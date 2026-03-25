---
description: Step-by-step guide for scaffolding a new staff/customer/auth feature in the Âu Lạc FE, including folder layout, barrel exports, service file, React Query hooks, and page wiring.
applyTo: "src/features/**"
---

# Âu Lạc — Feature Scaffolding

## 1. Determine the Area

Pick the correct area based on the audience:
| Audience | Area path |
|----------|-----------|
| Restaurant staff (dashboard) | `src/features/staff/<feature-name>/` |
| Customer-facing | `src/features/customer/<feature-name>/` |
| Auth flows | `src/features/auth/<feature-name>/` |

Use `kebab-case` for all folder and file names.

---

## 2. Mandatory Folder Layout

```
src/features/<area>/<feature-name>/
├── index.ts                   ← barrel — only named re-exports
├── <feature-name>.tsx          ← top-level orchestrator component
├── components/
│   └── <sub-component>.tsx
├── services/
│   └── <feature-name>.service.ts
├── hooks/
│   └── use-<feature-name>-queries.ts
└── types/
    ├── <feature-name>.types.ts
    └── schema.ts               ← Zod schema + FormValues type
```

Sub-features (e.g. role-list, role-create) each get their **own identical sub-folder** inside the parent feature:
```
src/features/staff/role-management/
├── role-list/
├── role-create/
├── role-edit/
└── role-detail/
```

---

## 3. Barrel (`index.ts`)

Export **only** what is consumed outside this feature. Never re-export internal utilities.

```ts
// src/features/staff/ingredient-management/index.ts
export { IngredientManagement } from "./ingredient-management";
export type { IngredientDto } from "./types/ingredient-management.types";
```

---

## 4. Service File

File: `services/<feature-name>.service.ts`

Rules:
- Import HTTP client: `import { api } from "@/lib/http"`
- Type every response with `ApiResponse<T>` from `@/types/api-response.types`
- **Always unwrap `.data`** before returning — callers never see the envelope
- For `PagedResult<T>` endpoints, return the full `PagedResult` (don't strip pagination metadata)
- For `FormData` uploads: do **not** set `Content-Type`

```ts
import { api } from "@/lib/http";
import type { ApiResponse, PagedResult } from "@/types/api-response.types";
import type { IngredientDto, CreateIngredientRequest } from "../types/ingredient-management.types";

export const ingredientService = {
  async getIngredients(): Promise<PagedResult<IngredientDto>> {
    const res = await api.get<ApiResponse<PagedResult<IngredientDto>>>("/api/ingredients");
    return res.data ?? { pageData: [], pageIndex: 1, pageSize: 20, totalCount: 0, totalPage: 0 };
  },

  async createIngredient(body: CreateIngredientRequest): Promise<IngredientDto> {
    const res = await api.post<ApiResponse<IngredientDto>>("/api/ingredients", body);
    return res.data;
  },

  async updateIngredient(id: number, body: Partial<CreateIngredientRequest>): Promise<IngredientDto> {
    const res = await api.put<ApiResponse<IngredientDto>>(`/api/ingredients/${id}`, body);
    return res.data;
  },

  async deleteIngredient(id: number): Promise<void> {
    await api.delete(`/api/ingredients/${id}`);
  },
};
```

---

## 5. React Query Hooks

File: `hooks/use-<feature-name>-queries.ts`

Rules:
- Use a `QUERY_KEYS` constant object with typed factory functions
- `staleTime` is set globally to 60 s in the Query provider — **do not override** unless there's a specific reason
- Import from `@tanstack/react-query`; use `toast` from `sonner` for mutation feedback
- `useMutation` must call `queryClient.invalidateQueries` in `onSuccess`

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ingredientService } from "../services/ingredient-management.service";
import type { IngredientDto, CreateIngredientRequest } from "../types/ingredient-management.types";
import type { PagedResult } from "@/types/api-response.types";

export const INGREDIENT_QUERY_KEYS = {
  all:     ["ingredients"] as const,
  lists:   () => [...INGREDIENT_QUERY_KEYS.all, "list"] as const,
  list:    (params: object) => [...INGREDIENT_QUERY_KEYS.lists(), params] as const,
  detail:  (id: number) => [...INGREDIENT_QUERY_KEYS.all, "detail", id] as const,
};

export function useIngredientsQuery(params: object = {}) {
  return useQuery<PagedResult<IngredientDto>>({
    queryKey: INGREDIENT_QUERY_KEYS.list(params),
    queryFn:  () => ingredientService.getIngredients(),
  });
}

export function useCreateIngredientMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateIngredientRequest) => ingredientService.createIngredient(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INGREDIENT_QUERY_KEYS.lists() });
      toast.success("Ingredient created");
    },
    onError: () => toast.error("Failed to create ingredient"),
  });
}
```

---

## 6. Types File

File: `types/<feature-name>.types.ts`

- DTO interfaces mirror backend response shapes
- Include both FK (`statusLvId: number`) and denormalized fields (`statusCode: string`, `statusName: string`)
- If the feature uses statuses, add a `CONFIG` map keyed by `StatusCode`:

```ts
import type { StatusCode } from "@/types/status-codes";

export interface IngredientDto {
  ingredientId: number;
  name:         string;
  unit:         string;
  stock:        number;
  statusLvId:   number;
  statusCode:   string;
  statusName:   string;
}

export interface CreateIngredientRequest {
  name:   string;
  unit:   string;
  stock?: number;
}
```

---

## 7. Wiring the Page

Staff pages live at `src/app/[locale]/(auth)/dashboard/<feature>/page.tsx`.

```tsx
// src/app/[locale]/(auth)/dashboard/ingredients/page.tsx
import { IngredientManagement } from "@/features/staff/ingredient-management";
import { ProtectedRoute } from "@/components/protected-route";

export default function IngredientsPage() {
  return (
    <ProtectedRoute permission="INGREDIENT:READ">
      <IngredientManagement />
    </ProtectedRoute>
  );
}
```

Permission constants live in `src/types/const.ts`.

---

## 8. i18n

Add locale keys to **all three locale folders** before committing:
- `src/messages/en/<module>.json`
- `src/messages/fr/<module>.json`
- `src/messages/vi/<module>.json`

Recommended modules: `common`, `auth`, `orders`, `kitchen`, `reservations`, `shift`.

Rules:
- Use nested namespaced keys by domain (example: `shift.reports.tabs.attendance`).
- Keep the same key tree across locales to prevent runtime missing messages.
- Avoid top-level generic keys that can collide across modules.
- If migrating from legacy monolithic files (`src/messages/{locale}.json`), follow `docs/i18n-migration-from-monolith.md`.

Access in components via `useTranslations("FeatureNamespace")` from `next-intl`.

---

## 9. No-Deletion Policy

**Never delete existing code.** Instead:
- Inline: comment it out with a `// _OLD:` prefix
- Identifiers: rename to `FooBar_DEPRECATED`
- Moving a file is allowed, but the new file must be a copy-paste with changes — never a refactor-in-place

---

## 10. Final Checklist

- [ ] Folder structure matches §2 exactly
- [ ] `index.ts` barrel exports are complete
- [ ] Service file unwraps `ApiResponse.data` everywhere
- [ ] React Query hooks have `QUERY_KEYS` + `onSuccess` invalidation
- [ ] `schema.ts` + `FormValues` type defined (if feature has a form)
- [ ] Status config map created (if feature has statuses)
- [ ] Page wired with `<ProtectedRoute>`
- [ ] Locale keys added to all three locale module files
- [ ] `npx tsc --noEmit` passes
