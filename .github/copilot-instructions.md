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

## Auth

- JWT access token in `localStorage` via `AuthStorage` singleton (`src/lib/auth-storage.ts`).
- Refresh token in HttpOnly cookie (invisible to JS). Auto-refresh handled by `http.ts` (401 → `/api/auth/refresh` → retry).
- Cross-tab sync via `BroadcastChannel` (`src/lib/auth-sync.ts`).
- **Permissions** follow `RESOURCE:ACTION` format (e.g. `"DISH:CREATE"`, `"ACCOUNT:READ"`). Constants in `src/types/const.ts`.
- **Route protection:** `<ProtectedRoute permission="X">` (redirects) and `<PermissionGuard permission="X">` (hides UI). Frontend permissions are UX-only — always enforce on backend.

## UI Components

shadcn/ui (new-york style) extended with project-specific components. Import from `@/components/ui/*`.

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

## Styling

Tailwind CSS v4 with CSS variables for theming (`src/styles/globals.css`). Some complex components have companion CSS files in `src/styles/components/`. Three font families: Inter (body), Playfair Display (headings), Lexend.

## Conventions

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
