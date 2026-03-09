---
description: Form patterns for the Âu Lạc FE — Zod schema definition, react-hook-form setup hook, RHF + shadcn field wiring, and TanStack Query mutation submission.
applyTo: "src/features/**"
---

# Âu Lạc — Form Patterns

Forms follow a strict 3-layer pattern: **schema → form hook → component**.

---

## Layer 1 — Zod Schema (`types/schema.ts`)

```ts
// src/features/staff/ingredient-management/types/schema.ts
import { z } from "zod";

// Helper: coerce empty strings to null for optional numbers
const nullableNumber = z.preprocess(
  (v) => (v === "" || v === undefined ? null : Number(v)),
  z.number().nullable()
);

export const ingredientFormSchema = z.object({
  name:           z.string().trim().min(1, "Name is required"),
  unit:           z.string().trim().min(1, "Unit is required"),
  stock:          nullableNumber,
  categoryLvId:   z.number().min(1, "Category is required"),
  isActive:       z.boolean(),
});

// IMPORTANT: always use z.input<> (not z.infer<>) so optional/nullable
// fields match the uncontrolled HTML input shapes before Zod transforms.
export type IngredientFormValues = z.input<typeof ingredientFormSchema>;

// Optional: mapper to populate form when editing an existing entity
export function mapIngredientToFormValues(dto: IngredientDto): IngredientFormValues {
  return {
    name:         dto.name,
    unit:         dto.unit,
    stock:        dto.stock,
    categoryLvId: dto.categoryLvId,
    isActive:     dto.isActive,
  };
}
```

**Rules:**
- Use `z.coerce.number()` for numeric inputs that come from `<input type="number">`.
- Use the `nullableNumber` preprocess helper for nullable optional numbers.
- Use `z.input<typeof schema>` (not `z.infer`) for the exported `FormValues` type.
- Define a `mapXtoFormValues()` helper whenever the feature supports editing.

---

## Layer 2 — Form Hook (`hooks/useXForm.ts`)

```ts
// src/features/staff/ingredient-management/hooks/useIngredientForm.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ingredientFormSchema, IngredientFormValues } from "../types/schema";

export function useIngredientForm(defaultValues?: Partial<IngredientFormValues>) {
  return useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientFormSchema),
    mode:     "onBlur",          // validate on blur, not on every keystroke
    defaultValues: {
      name:         "",
      unit:         "",
      stock:        null,
      categoryLvId: 0,
      isActive:     true,
      ...defaultValues,          // override for edit mode
    },
  });
}
```

**Rules:**
- Always `mode: "onBlur"` — never `"onChange"` (too noisy).
- Accept optional `defaultValues` so the same hook works for both Create and Edit.
- Return the full form object — the component calls `handleSubmit`, `register`, `formState`, etc. directly.

---

## Layer 3 — Component (Form UI + Mutation)

```tsx
// src/features/staff/ingredient-management/components/ingredient-form.tsx
"use client";

import { useIngredientForm } from "../hooks/useIngredientForm";
import { useCreateIngredientMutation } from "../hooks/use-ingredient-queries";
import { ALInput } from "@/components/ui/al-input";
import { Button } from "@/components/ui/button";
import type { IngredientFormValues } from "../types/schema";

interface Props {
  onSuccess?: () => void;
}

export function IngredientForm({ onSuccess }: Props) {
  const form   = useIngredientForm();
  const create = useCreateIngredientMutation();

  const onSubmit = (values: IngredientFormValues) => {
    create.mutate(values, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <ALInput
        label="Name"
        required
        {...form.register("name")}
        error={form.formState.errors.name?.message}
      />
      <ALInput
        label="Unit"
        required
        {...form.register("unit")}
        error={form.formState.errors.unit?.message}
      />
      <Button type="submit" isLoading={create.isPending}>
        Save
      </Button>
    </form>
  );
}
```

---

## Edit Mode (pre-populate form)

```tsx
// Pass existing data as defaultValues — the hook merges with base defaults
const form = useIngredientForm(mapIngredientToFormValues(existingIngredient));
```

In the mutation:
```ts
const update = useUpdateIngredientMutation();

const onSubmit = (values: IngredientFormValues) => {
  update.mutate({ id: ingredient.ingredientId, body: values });
};
```

---

## UI Components for Form Fields

| Field type | Component | Import |
|------------|-----------|--------|
| Text / number input with label | `ALInput` | `@/components/ui/al-input` |
| Fixed-option select/dropdown | `ALCombobox` | `@/components/ui/al-combobox` |
| Dynamic lookup select (BE data) | `LookupCombobox` | `@/features/lookup` |
| File / image upload | `FileUpload` | `@/components/ui/file-upload` |
| Toggle | `Switch` | `@/components/ui/switch` |

Always use these — **never** `<input>` or `<select>` directly.

---

## Multilingual Forms (i18n content)

Use a nested `i18n` object when a feature stores content in EN / VI / FR:

```ts
// schema
i18n: z.object({
  en: contentSchema,
  vi: contentSchema,
  fr: contentSchema,
}),
```

Render as `<Tabs>` with one tab per language. Register fields as:
```ts
form.register("i18n.en.dishName")
```

See `src/features/staff/create-edit-dish/types/schema.ts` for the full reference implementation.

---

## File Upload (FormData)

When the form includes images, build `FormData` manually and call the service — **do NOT set `Content-Type`**:

```ts
const onSubmit = async (values: IngredientFormValues) => {
  const fd = new FormData();
  fd.append("name", values.name);
  if (values.image) fd.append("image", values.image);
  await service.createIngredient(fd);
};
```

The HTTP client (`src/lib/http.ts`) detects `FormData` and omits `Content-Type` automatically.

---

## Checklist

- [ ] Schema in `types/schema.ts`, type exported as `z.input<typeof schema>`
- [ ] `mapXtoFormValues()` helper defined for edit flows
- [ ] Hook in `hooks/useXForm.ts` with `mode: "onBlur"` and typed `defaultValues`
- [ ] Form component uses `ALInput` / `ALCombobox` / `LookupCombobox`, not raw HTML elements
- [ ] Submit calls `useMutation` from TanStack Query (not direct service call)
- [ ] `Button` uses `isLoading={mutation.isPending}` to disable during submission
- [ ] `form.reset()` called in `onSuccess` for create flows
