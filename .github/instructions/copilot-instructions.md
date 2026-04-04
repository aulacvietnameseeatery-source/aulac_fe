# Copilot Instructions — Âu Lạc Restaurant FE

## Architecture

Next.js 15 App Router with `[locale]` segment (`en`, `fr`, `vi` via `next-intl`). Pages are thin wrappers — all logic lives in `src/features/`.

```
src/app/[locale]/(auth)/dashboard/*  → Staff dashboard (requires JWT)
src/app/[locale]/(public)/*          → Customer-facing (no auth)
src/features/{customer,staff,auth}/* → Business logic home
src/components/ui/*                  → Shared UI primitives (shadcn/ui new-york + custom)
src/lib/                             → Infrastructure (http client, auth, utils)
src/types/                           → Cross-feature types & enums
```

**Key rule:** Feature-specific code (components, hooks, services, types) goes inside `src/features/<area>/<feature>/`. Only truly shared code goes in top-level `src/components/`, `src/hooks/`, `src/lib/`, `src/types/`.

## Feature Structure

Every feature follows this internal layout:

```
features/staff/some-feature/
├── index.ts              # Barrel exports
├── some-feature.tsx      # Main orchestrator component
├── components/           # Feature-scoped UI
├── services/             # API calls (*.service.ts)
├── hooks/                # Feature-scoped hooks
└── types/
    ├── *.types.ts        # Interfaces & config maps
    └── schema.ts         # Zod validation schema
```

## API & Data Fetching

- **HTTP client:** `import { api } from "@/lib/http"` — wraps `fetch` with JWT Bearer auth, auto-refresh on 401, `credentials: 'include'`.
- **Backend:** ASP.NET Core at `https://localhost:7083`. URL pattern: `/api/{resource}` (no version prefix).
- **All responses** use `ApiResponse<T>` envelope (`src/types/api-response.types.ts`). Paginated endpoints return `ApiResponse<PagedResult<T>>`.
- **Server state:** TanStack React Query (`useQuery`/`useMutation`). Configured with `staleTime: 60s`, `refetchOnWindowFocus: false`.
- **Service files** unwrap `.data` from `ApiResponse` before returning:
  ```ts
  // src/features/staff/kitchen/services/kitchen.service.ts
  export const kitchenService = {
    async getKitchenOrders() {
      const res = await api.get<ApiResponse<KitchenOrder[]>>("/api/orders/kitchen");
      return res.data ?? [];
    },
  };
  ```
- **FormData uploads:** Don't set `Content-Type` — the client detects `FormData` automatically.

## Lookup Table Pattern

The backend stores statuses, types, and zones as rows in a generic `LookupValue` table. DTOs include denormalized fields:

```ts
// Entity FK:  statusLvId (number)
// DTO fields: statusId, statusCode (ValueCode), statusName (display)
```

FE enum mirrors live in `src/types/status-codes.ts` — values match `ValueCode` in the DB (`SCREAMING_SNAKE_CASE`).

## Lookup UI Components

Anytime a feature needs a **select/combobox that loads options from a BE LookupValue endpoint**, always use the shared infrastructure from `@/features/lookup` — **never create a new route, file, or custom combobox/modal from scratch**.

| Need | Use |
|------|-----|
| Combobox with inline create + manager modal | `<LookupCombobox lookup={...} ... />` from `@/features/lookup` |
| Standalone CRUD modal for a lookup entity | `<LookupManagerModal {...lookup} ... />` from `@/features/lookup` |
| Data + CRUD callbacks for a lookup entity | `useLookupCrud({ typeId, queryKey, entityLabel, typeLabel? })` from `@/features/lookup` |

```ts
// Pattern: one hook call wires up everything
import { LOOKUP_TYPE, useLookupCrud } from "@/features/lookup";

const zoneLookup = useLookupCrud({
  typeId:      LOOKUP_TYPE.TableZone,
  queryKey:    ["lookups", "table-zone"],
  entityLabel: "Zone",
  typeLabel:   "Zone", // optional; helps BE return clearer delete conflict messages
});

// Renders combobox + "Manage" button + full CRUD modal
<LookupCombobox
  lookup={zoneLookup}
  title="Zone"
  required
  value={formData.zoneLvId}
  onChange={(val) => setFormData(f => ({ ...f, zoneLvId: val }))}
/>
```

The `LookupCombobox` component lives in `src/features/lookup/components/lookup-combobox.tsx`.
The `LookupManagerModal` component lives in `src/features/lookup/components/lookup-manager-modal.tsx`.

## Auth

- JWT access token in `localStorage` via `AuthStorage` singleton (`src/lib/auth-storage.ts`).
- Refresh token in HttpOnly cookie (invisible to JS). Auto-refresh handled by `http.ts` (401 → `/api/auth/refresh` → retry).
- Cross-tab sync via `BroadcastChannel` (`src/lib/auth-sync.ts`).
- **Permissions** follow `RESOURCE:ACTION` format (e.g. `"DISH:CREATE"`, `"ACCOUNT:READ"`). Constants in `src/types/const.ts`.
- **Route protection:** `<ProtectedRoute permission="X">` (redirects) and `<PermissionGuard permission="X">` (hides UI). Frontend permissions are UX-only — always enforce on backend.

## UI Components

shadcn/ui (new-york style) extended with project-specific components. Import from `@/components/ui/*`.

**Component-first rule:** Always check `src/components/ui/` for a suitable existing component before creating a new one. If no component fits the need, **ask the user for confirmation** before building a new one. Do not silently create new UI primitives.

| Component | Notes |
|-----------|-------|
| `ALCard` | **Reusable card wrapper with presets:** variants (`default`, `soft`, `tinted`, `glass`, `outline`), elevation levels, animations, hover effects. **Self-contained hover state** via `withHoverState` + render-prop children. See [al-card-pattern guide](instructions/al-card-pattern.instructions.md). Replace raw `<div>` card styling with `<ALCard>`. |
| `Button` | Has custom `isLoading` prop |
| `Dialog` | **Custom portal implementation**, NOT Radix — styled via `src/styles/components/dialog.css` |
| `Drawer` | Right-side panel |
| `ALInput`, `ALCombobox` | Project-specific form controls with labels (under `al-input/`, `al-combobox/`) |
| `KeywordSearch` | Debounced search input (`keyword-search/`) |
| `FileUpload` | Drag-and-drop with preview |
| `TableActionColumn` | Unified table actions (`components/ui/table/table-action-column.tsx`). **No custom icons/labels allowed**. Add new action types to `BUILT_IN_ACTIONS` inside the component to maintain visual consistency. |
| `Badge`, `Card`, `Tabs`, `Switch`, `Tooltip` | Standard shadcn |

Icons: `lucide-react`. Utility: `cn()` from `@/lib/utils` (twMerge + clsx).

## Forms

`react-hook-form` + `zod` + `@hookform/resolvers/zod`. Pattern:

1. Define schema in `types/schema.ts` → `export type FormValues = z.input<typeof schema>`
2. Create hook in `hooks/useXForm.ts` → `useForm({ resolver: zodResolver(schema), mode: "onBlur" })`
3. Submit via `useMutation` from TanStack Query

## Styling & Color Palette

Tailwind CSS v4 with CSS variables for theming (`src/styles/globals.css`). Some complex components have companion CSS files in `src/styles/components/`.

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary (Navy Blue)** | `#1A3A52` | Primary text, prominent UI elements, active states, active tab backgrounds, contrast sections |
| **Secondary (Beige)** | `#D5BA98` | Accents, dividing lines, borders, secondary badges, subtle highlights |
| **Light Beige** | `#D5BA98` at 10–30% opacity, or `#FDFBF9` | Page backgrounds, muted strips, soft hover layers |
| **Surface White** | `#FFFFFF` | Cards/sections that must stand out from cream page background |

Tailwind usage examples: `text-[#1A3A52]`, `bg-[#1A3A52]`, `border-[#D5BA98]`, `bg-[#D5BA98]/30`, `bg-[#FDFBF9]`, `text-[#1A3A52]/70`.

### Status Color System (Use Tailwind Semantic Colors)

For all status badges/chips/active pills, use Tailwind semantic colors and keep mapping consistent across features:

- `pending` / `new`: `amber` (`bg-amber-600`, `text-white`, `border-amber-600`)
- `in-progress` / `confirmed` / `in-kitchen`: `blue` (`bg-blue-600`, `text-white`, `border-blue-600`)
- `completed` / `checked-in` / `paid`: `emerald` (`bg-emerald-600`, `text-white`, `border-emerald-600`)
- `cancelled` / `rejected` / `unpaid` / `no-show`: `red` (`bg-red-600`, `text-white`, `border-red-600`)
- `all` / fallback buckets: `slate` (`bg-slate-700`, `text-white`, `border-slate-700`)

Important:

- Prefer Tailwind semantic tokens (`amber-*`, `blue-*`, `emerald-*`, `red-*`, `slate-*`) for statuses.
- Do **not** introduce new custom hex values for status semantics unless explicitly requested.

### Typography

| Role | Font Family | Notes |
|------|-------------|-------|
| Headings & accents | `Cormorant Garamond` | Elegant, traditional serif |
| Body & UI elements | `Inter` | Clean, readable sans-serif |

Favor light font weights (`font-light`), relaxed letter spacing (`tracking-wide`), and subtle italicization for emphasis.

### General UI Rules

1. **Surface Hierarchy** — Use cream page background (`bg-[#FDFBF9]`) and place key content inside white cards/sections (`bg-white`) so content clearly stands out.
2. **Borders** — For primary cards/sections, prefer neutral borders like `border-slate-200`; use beige borders for secondary accents and inline controls.
2. **Text** — Avoid pure black (`#000`) or harsh dark grays (`#0f172a`). Use Navy Blue (`text-[#1A3A52]`) for primary text and Navy Blue with opacity (`text-[#1A3A52]/70`) for secondary text.
3. **Card Emphasis** — Use subtle elevation for readability (`shadow-sm`) and stronger hover affordance (`hover:shadow-md`, optional `hover:-translate-y-0.5`) on clickable cards.
4. **Backgrounds** — Use beige tint layers (`bg-[#D5BA98]/10` to `/20`) for muted strips, filters, and informational areas; keep main data surfaces white.
5. **Shadows** — Soft shadows are preferred for separation; avoid heavy/glassy shadows.
6. **Vibe** — Calm and premium, but with clearer section separation for fast scanning by staff/customers.

### Management Page Layout Pattern

For staff management/list screens, use a **stacked card layout** rather than one flat container.

Preferred structure:

1. Header card — page title, short description, primary action button
2. Secondary card — summary chips, filters, date pickers, quick controls
3. Content card — table, board, chart, or primary data surface

Tailwind direction:

- Page shell: `space-y-4` or `space-y-6`, often with `bg-[#FDFBF9]`
- Each section card: `rounded-xl border border-[#D5BA98]/60 bg-white shadow-sm`
- Header cards: use `px-4 py-4 sm:px-5`
- Secondary control cards: use `p-3` or `p-4`
- Avoid collapsing all content into a single giant card when the page has clearly different functional areas

### BaseTable Layout Rule

`BaseTable` should be treated as the main content card of list pages.

- The shared `BaseTable` shell should own the white bordered table card treatment
- Feature pages should not add another redundant nested card around the table unless there is a specific visual reason
- `renderTitle()` should be used for page-level header/summary sections above the table body
- `renderToolbarAppend()` should provide compact inline controls that sit naturally inside the table toolbar area
- When building new list pages, prefer: page header card(s) via `renderTitle()` + BaseTable default content card

### Table + Mobile Responsiveness Rule

For all staff list/management pages:

- `renderTitle()` must remain usable on mobile first (`flex-col`, full-width controls, buttons expand to `w-full` on small screens).
- Keep primary actions discoverable on mobile: do not hide the create/filter controls behind hover-only interactions.
- Avoid hardcoded oversized table column widths that force unusable horizontal scrolling on phones.
- Long text cells must support truncation + readable secondary metadata lines (`text-xs` / `text-sm`) for compact mobile scanning.
- If a table is core on both desktop and mobile, design supporting controls to wrap and stack cleanly at `< md` breakpoints.

### Scroll Containment Rule

- **Desktop (`lg:` and above):** Do **not** use `overflow-y-auto` + `max-h-*` on main list/form content areas. Let the browser scroll naturally. Remove scroll containment using `lg:max-h-none lg:overflow-visible`.
- **Mobile / Tablet (`< lg`):** Containment scrolling (`max-h-[44vh] overflow-y-auto`) is acceptable for long lists to keep the view usable on small screens.
- Pattern: `className="max-h-[44vh] overflow-y-auto lg:max-h-none lg:overflow-visible"`
- Exception: modals and drawers may use scroll containment at all breakpoints.

### Settings Page Layout Rule (System + Store)

For `system-settings` and `store-settings` pages, use a strict fixed-header + inner-scroll layout to prevent header jump and nested scroll conflicts.

Required structure:

1. Page shell
- Use: `flex h-full min-h-0 flex-col overflow-hidden`
- Keep page-level header in an `ALCard` at the top (title + description/actions).
- Main content wrapper should be `mt-3 flex-1 min-h-0 overflow-hidden`.

2. Tab/Form container
- Parent container must pass height down: `w-full h-full min-h-0`.
- If using tabs, keep inactive content mounted with `forceMount` and hide via `data-[state=inactive]:hidden` to preserve unsaved input while switching tabs.

3. Card composition
- Each main card should be: `flex h-full min-h-0 flex-col overflow-hidden`.
- Card header/actions live in a non-scroll block (top section).
- Card body must be the only scroll area: `flex-1 min-h-0 overflow-y-auto overscroll-contain`.

4. Do not scroll headers
- Never put `overflow-y-auto` on page root, tab root, or card root when that would cause header/title/action rows to scroll.
- Scroll should happen only in designated body regions.

Reference targets in current codebase:
- `src/app/[locale]/(auth)/dashboard/system-settings/page.tsx`
- `src/app/[locale]/(auth)/dashboard/store-settings/page.tsx`
- `src/features/staff/system-settings/components/GeneralSettings.tsx`
- `src/features/staff/system-settings/components/StoreProfileForm.tsx`
- `src/features/staff/system-settings/components/IntroductionSettingsForm.tsx`
- `src/features/staff/system-settings/components/AboutUsSettingsForm.tsx`

### ALCombobox Sizing Rule

- Use `inputSize` intentionally by context:
  - dense toolbar/filter: `inputSize="sm"`
  - default forms: `inputSize="default"`
  - page-level filters and prominent selectors: `inputSize="lg"`
- Explicitly set readable text size via class hooks when needed (for example `text-sm` on compact layouts).
- For `LookupCombobox`, pass size/text props instead of ad-hoc CSS overrides whenever possible.

## Conventions

- **No deletions:** Never delete existing code when implementing changes. Instead, comment it out and rename it with a `// _OLD:` prefix on the comment (for inline blocks) or append `_DEPRECATED` to the identifier name. This preserves history and makes rollback trivial. Moving file is allowed to delete the old path, but the new file must be a copy-paste of the old content with changes applied, never a refactor that edits in place.
- **File naming:** `kebab-case` for all files (`table-modal.tsx`, `dish.service.ts`, `table.types.ts`)
- **Exports:** PascalCase named exports for components. Barrel `index.ts` in each feature
- **Imports:** Use `@/*` path alias (maps to `src/*`)
- **i18n:** Use modular locale files under `src/messages/{locale}/` (for example `common.json`, `auth.json`, `orders.json`, `kitchen.json`, `reservations.json`, `shift.json`).
- **Namespaces:** Prefer namespaced access like `useTranslations("shift.reports")` or `useTranslations("common.table")`.
- **Loader behavior:** `src/i18n.ts` dynamically loads and deep-merges locale modules; keep module keys nested and collision-safe.
- **Migration reference:** Follow `docs/i18n-migration-from-monolith.md` when moving old keys from monolithic locale files.
- **Comments:** Vietnamese is common in code comments — this is expected
- **Type check:** `npx tsc --noEmit` — run before committing
- **Dev server:** `npm run dev` (uses Turbopack)

## Key Files Reference

| Purpose | Path |
|---------|------|
| HTTP client | `src/lib/http.ts` |
| API response types | `src/types/api-response.types.ts` |
| Backend enum mirrors | `src/types/status-codes.ts` |
| Permission constants | `src/types/const.ts` |
| Auth provider | `src/components/providers/auth-provider.tsx` |
| Query provider | `src/components/providers/query-provider.tsx` |
| i18n config | `src/i18n.ts`, `src/middleware.ts` |
| Global styles + theme | `src/styles/globals.css` |
