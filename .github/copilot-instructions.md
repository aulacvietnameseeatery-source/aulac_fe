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
| Data + CRUD callbacks for a lookup entity | `useLookupCrud({ baseUrl, queryKey, entityLabel })` from `@/features/lookup` |

```ts
// Pattern: one hook call wires up everything
const zoneLookup = useLookupCrud({
  baseUrl:     "/api/tables/zones",
  queryKey:    ["tables", "zones"],
  entityLabel: "Zone",
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
| `Button` | Has custom `isLoading` prop |
| `Dialog` | **Custom portal implementation**, NOT Radix — styled via `src/styles/components/dialog.css` |
| `Drawer` | Right-side panel |
| `ALInput`, `ALCombobox` | Project-specific form controls with labels (under `al-input/`, `al-combobox/`) |
| `KeywordSearch` | Debounced search input (`keyword-search/`) |
| `FileUpload` | Drag-and-drop with preview |
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
| **Light Beige** | `#D5BA98` at 10–30% opacity, or `#FDFBF9` | Main backgrounds, muted containers, hovered items |
| **Semantic — Success** | `#D5BA98` or muted green `#4A5D4E` | Only when absolutely necessary |
| **Semantic — Warning** | Muted red `#8C3A3A` | Never use harsh `#ff3636` |

Tailwind usage examples: `text-[#1A3A52]`, `bg-[#1A3A52]`, `border-[#D5BA98]`, `bg-[#D5BA98]/30`, `bg-[#FDFBF9]`, `text-[#1A3A52]/70`.

### Typography

| Role | Font Family | Notes |
|------|-------------|-------|
| Headings & accents | `Cormorant Garamond` | Elegant, traditional serif |
| Body & UI elements | `Inter` | Clean, readable sans-serif |

Favor light font weights (`font-light`), relaxed letter spacing (`tracking-wide`), and subtle italicization for emphasis.

### General UI Rules

1. **Borders** — Replace harsh grays (`#e2e8f0`) with soft beige (`border-[#D5BA98]/30` or `border-[#D5BA98]/50`).
2. **Text** — Avoid pure black (`#000`) or harsh dark grays (`#0f172a`). Use Navy Blue (`text-[#1A3A52]`) for primary text and Navy Blue with opacity (`text-[#1A3A52]/70`) for secondary text.
3. **Backgrounds** — Avoid pure white (`#fff`) blocks on stark gray (`#f5f6fa`). Use a warm, soft progression from white to light beige (`bg-[#D5BA98]/10` → `bg-[#D5BA98]/30`).
4. **Shadows** — Use very soft, diffused shadows or eliminate them in favor of subtle border definitions.
5. **Vibe** — The UI should feel calm, unhurried, balanced, and serene.

## Conventions

- **No deletions:** Never delete existing code when implementing changes. Instead, comment it out and rename it with a `// _OLD:` prefix on the comment (for inline blocks) or append `_DEPRECATED` to the identifier name. This preserves history and makes rollback trivial. Moving file is allowed to delete the old path, but the new file must be a copy-paste of the old content with changes applied, never a refactor that edits in place.
- **File naming:** `kebab-case` for all files (`table-modal.tsx`, `dish.service.ts`, `table.types.ts`)
- **Exports:** PascalCase named exports for components. Barrel `index.ts` in each feature
- **Imports:** Use `@/*` path alias (maps to `src/*`)
- **i18n:** Locale strings in `src/messages/{en,fr,vi}.json`. Access via `useTranslations()` from `next-intl`
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
