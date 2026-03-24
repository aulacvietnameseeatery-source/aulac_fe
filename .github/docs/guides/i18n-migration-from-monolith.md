# i18n Migration: Monolith to Modular

This guide explains how to migrate from legacy monolithic locale files:

- src/messages/en.json
- src/messages/fr.json
- src/messages/vi.json

...to modular, domain-based locale files:

- src/messages/{locale}/common.json
- src/messages/{locale}/auth.json
- src/messages/{locale}/orders.json
- src/messages/{locale}/kitchen.json
- src/messages/{locale}/reservations.json
- src/messages/{locale}/shift.json

## Goals

- Keep translation keys readable and stable
- Reduce key collisions across teams and features
- Scale translation ownership by feature/domain
- Preserve existing UI behavior during migration

## Prerequisites

- Ensure src/i18n.ts loads and deep-merges module files for each locale
- Ensure fallback behavior exists for locales that are not fully migrated yet

## Recommended Migration Strategy

1. Migrate one module at a time (for example: shift first)
2. Keep legacy keys available in common.json during transition
3. Update code usage to namespaced keys only for migrated module
4. Type-check and smoke-test each migrated module
5. Repeat for next module

## Mapping Rules

### 1. Namespace by domain

Old:

- ShiftManagement.Reports.title

New:

- shift.reports.title

### 2. Convert PascalCase groups to lowerCamel namespace segments

Old:

- ShiftManagement.AssignmentForm.fields.staffMember

New:

- shift.assignmentForm.fields.staffMember

### 3. Keep leaf keys unchanged whenever possible

Old:

- ShiftManagement.Reports.tabs.attendance

New:

- shift.reports.tabs.attendance

### 4. Avoid cross-domain generic roots

Avoid new roots like:

- title
- list
- table

Use domain roots instead:

- common.table
- shift.scheduleList
- orders.list

## Suggested Domain Split

- common: shared UI strings, table/pagination/common errors
- auth: login/register/forgot/reset/password flows
- orders: order list/create/edit/payment/history
- kitchen: kitchen display and kitchen actions
- reservations: reservation flows and management
- shift: templates, schedule, live board, reports, my shifts

## Example Migration (Shift)

### Step 1: Extract JSON

From monolith key group:

- ShiftManagement.Common
- ShiftManagement.Schedule
- ShiftManagement.Live
- ShiftManagement.MyShift
- ShiftManagement.Reports
- ShiftManagement.ScheduleList
- ShiftManagement.AssignmentForm

Create module file:

- src/messages/en/shift.json

Structure:

{
  "shift": {
    "common": { ... },
    "schedule": { ... },
    "live": { ... },
    "myShift": { ... },
    "reports": { ... },
    "scheduleList": { ... },
    "assignmentForm": { ... }
  }
}

Repeat for fr and vi.

### Step 2: Update component namespaces

Old:

const t = useTranslations("ShiftManagement.Reports");

New:

const t = useTranslations("shift.reports");

### Step 3: Verify keys

- Compare key trees across en/fr/vi module files
- Run: npx tsc --noEmit
- Navigate migrated screens and verify no missing-message errors

## Incremental Compatibility Pattern

During migration, keep old groups in common.json to avoid breakage for code not yet migrated.

Only remove old groups after:

- all callsites are updated
- all locales are migrated
- smoke tests pass

## Pitfalls to Avoid

- Moving keys in one locale only
- Renaming too many leaf keys at once
- Mixing domain keys into common.json without clear ownership
- Creating duplicate paths that differ only by case

## PR Checklist

- [ ] Added/updated module files for en/fr/vi
- [ ] Preserved key tree consistency across locales
- [ ] Updated useTranslations namespaces in migrated feature
- [ ] No unresolved missing-message errors in migrated screens
- [ ] Ran npx tsc --noEmit
- [ ] Linked this migration guide in updated instructions
