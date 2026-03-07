---
description: Lookup table UI patterns for the Âu Lạc FE — when and how to use LookupCombobox, LookupManagerModal, and useLookupCrud for any select/combobox that loads options from a BE LookupValue endpoint.
applyTo: "src/features/**"
---

# Âu Lạc — Lookup Table UI Patterns

## What Is a LookupValue?

The backend stores all enumerations (statuses, types, zones, tags, categories…) as rows in a generic `LookupValue` table. DTOs expose three denormalized fields:

```ts
statusLvId:   number   // FK — what you send in request bodies
statusCode:   string   // SCREAMING_SNAKE_CASE ValueCode — for logic/config maps
statusName:   string   // human-readable — display only
```

Frontend enum mirrors live in `src/types/status-codes.ts`. **Never hardcode ValueCode strings** outside of that file.

---

## Decision Table

| You need… | Use… | Import from |
|-----------|------|-------------|
| A combobox whose options come from a `/api/…` lookup endpoint | `<LookupCombobox>` | `@/features/lookup` |
| A standalone CRUD manager modal (create / edit / delete lookup items) | `<LookupManagerModal>` | `@/features/lookup` |
| Just the data + CRUD callbacks (custom UI) | `useLookupCrud()` | `@/features/lookup` |
| **Never:** a hand-rolled combobox, custom modal, or custom useQuery for a LookupValue endpoint | ✗ | — |

---

## Pattern A — `LookupCombobox` (most common)

This is the default choice whenever a form field lets the user pick a lookup value.

```tsx
import { useLookupCrud, LookupCombobox } from "@/features/lookup";

// 1. One hook wires up everything
const zoneLookup = useLookupCrud({
  baseUrl:     "/api/tables/zones",
  queryKey:    ["tables", "zones"],   // must be unique across app
  entityLabel: "Zone",                // used in toast messages
});

// 2. One component renders combobox + "Manage" button + full CRUD modal
<LookupCombobox
  lookup={zoneLookup}
  title="Zone"
  required
  placeholder="Select a zone…"
  value={formData.zoneLvId}           // controlled: pass the FK number
  onChange={(val) =>                  // val is number | ""
    setFormData(f => ({ ...f, zoneLvId: val }))
  }
  onCreated={(item) =>               // optional: auto-select after create
    setFormData(f => ({ ...f, zoneLvId: item.valueId }))
  }
/>
```

Key props:
| Prop | Type | Notes |
|------|------|-------|
| `lookup` | `LookupCrudReturn` | Full result of `useLookupCrud()` |
| `value` | `number \| string \| undefined` | Pass the FK (`zoneLvId`), not the name |
| `onChange` | `(val: number \| "") => void` | `""` = cleared |
| `onCreated` | `(item: LookupValueDto) => void` | Auto-select newly created item |

---

## Pattern B — `LookupManagerModal` standalone

Use when you need a dedicated "Manage Zones" button that opens the full CRUD modal independently of a combobox.

```tsx
import { useLookupCrud, LookupManagerModal } from "@/features/lookup";

const zoneLookup = useLookupCrud({
  baseUrl:     "/api/tables/zones",
  queryKey:    ["tables", "zones"],
  entityLabel: "Zone",
});

<LookupManagerModal
  {...zoneLookup}               // spread all props from hook
  isOpen={managerOpen}
  onClose={() => setManagerOpen(false)}
  onCreated={(item) => console.log(item)}
/>
```

---

## Pattern C — `useLookupCrud` with custom UI

When the standard components don't fit your layout, use the hook directly:

```ts
const zoneLookup = useLookupCrud({ baseUrl: "/api/tables/zones", queryKey: ["tables","zones"], entityLabel: "Zone" });

// Available from the hook:
zoneLookup.items          // LookupValueDto[]
zoneLookup.isLoading      // boolean
zoneLookup.onSave(body)   // create or update → returns Promise<LookupValueDto>
zoneLookup.onDelete(id)   // delete by valueId
```

---

## DTO Shape

```ts
interface LookupValueDto {
  valueId:   number;
  valueName: string;
  valueCode: string;  // SCREAMING_SNAKE_CASE
  sortOrder?: number;
}
```

When sending a selection in a **request body**, use the FK (`valueId` → `zoneLvId`):
```ts
// ✓ correct
{ zoneLvId: selectedItem.valueId }

// ✗ wrong
{ zoneName: selectedItem.valueName }
```

---

## Status Config Map Pattern

For fields that drive UI styling (badge color, icon), define a config map keyed by `ValueCode`:

```ts
// types/<feature>.types.ts
import type { StatusCode } from "@/types/status-codes";

export const TABLE_STATUS_CONFIG: Record<string, { label: string; variant: "default" | "destructive" | "secondary" }> = {
  AVAILABLE: { label: "Available", variant: "default" },
  OCCUPIED:  { label: "Occupied",  variant: "destructive" },
  RESERVED:  { label: "Reserved",  variant: "secondary" },
};
```

Use `statusCode` (not `statusLvId`) as the key — codes are stable across environments; IDs are not.

---

## Real Example: Table Management

```tsx
// components/table-form.tsx
const zoneLookup  = useLookupCrud({ baseUrl: "/api/tables/zones", queryKey: ["tables","zones"],  entityLabel: "Zone"  });
const typeLookup  = useLookupCrud({ baseUrl: "/api/tables/types", queryKey: ["tables","types"],  entityLabel: "Type"  });

<LookupCombobox lookup={zoneLookup}  title="Zone" value={form.zoneLvId}  onChange={v => setForm(f => ({...f, zoneLvId:  v }))} />
<LookupCombobox lookup={typeLookup}  title="Type" value={form.typeLvId}  onChange={v => setForm(f => ({...f, typeLvId:  v }))} />
```
