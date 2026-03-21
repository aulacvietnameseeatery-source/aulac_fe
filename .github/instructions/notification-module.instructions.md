---
description: Notification module guide for the Âu Lạc FE — real-time SignalR notifications, metadata-first localization, anti-spam toast management, Zustand store, and adding new notification types end-to-end.
applyTo: "src/features/staff/notifications/**"
---

# Âu Lạc — Notification Module Guide

## Architecture Overview

The notification system delivers real-time alerts to staff via **SignalR** (push) backed by **REST** (query/mutate). The BE sends compact notifications with **metadata only** — the FE resolves localized titles and bodies from i18n templates at render time.

```
┌─────────┐  SignalR push   ┌──────────────┐  Zustand   ┌──────────────────┐
│  .NET BE │ ──────────────→ │ Provider     │ ────────→  │ Store (items,    │
│  Hub     │                 │ (connection) │            │ unread, prefs)   │
└─────────┘                  └──────────────┘            └──────────────────┘
     ↑ REST                        ↓ add/merge                ↓ subscribe
     │                       ┌──────────────┐            ┌──────────────────┐
     └─── Query / Mutate ←── │ Service      │            │ Components       │
                              │ (REST calls) │            │ (Bell, Center,   │
                              └──────────────┘            │  Toast, Item)    │
                                                          └──────────────────┘
```

**Key principle:** The BE stores `Title = type code`, `Body = null`, and puts all variable data in `Metadata` (JSON dict). The FE uses `resolveLocalizedNotification()` to map metadata into i18n message templates.

---

## File Structure

```
src/features/staff/notifications/
├── index.ts                          # Barrel exports (all public API)
├── constants/
│   └── notification.constants.ts     # Priority configs, type configs, anti-spam settings
├── types/
│   └── notification.types.ts         # Enums, DTOs, query params, preferences
├── store/
│   └── notification.store.ts         # Zustand — items, unread, connected, preferences
├── utils/
│   └── resolve-localized-notification.ts  # Metadata → i18n template resolver
├── services/
│   └── notification.service.ts       # REST API calls (GET/POST notifications)
├── hooks/
│   ├── use-notification-queries.ts   # TanStack Query wrappers (useNotifications, useMarkAsRead, etc.)
│   └── use-notification-sound.ts     # Web Audio procedural tone generator
├── components/
│   ├── notification-bell.tsx         # Header bell icon with unread badge
│   ├── notification-center.tsx       # Panel UI — tabs, scrollable list, load-more
│   ├── notification-item.tsx         # Single notification row
│   ├── notification-toast-renderer.tsx  # Toast logic + anti-spam engine
│   ├── notification-toaster.tsx      # Dedicated Sonner <Toaster> instance (top-right)
│   └── notification-preferences.tsx  # Per-type enable/disable + sound toggles
└── providers/
    └── notification-provider.tsx     # SignalR connection lifecycle + missed recovery
```

---

## Data Flow

### Real-Time (SignalR)

1. `NotificationProvider` creates a SignalR connection to `/hubs/restaurant`
2. Listens for `"ReceiveNotification"` events
3. Calls `store.addNotification(dto)` → prepends item, increments `unreadCount`
4. `NotificationToastRenderer` detects new item → runs anti-spam pipeline → shows toast
5. On reconnect, provider calls `getMissed(lastReceivedAt)` → `store.mergeMissed()` (dedup by ID)

### REST (Query/Mutate)

| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/api/notifications` | GET | `useNotifications` | Paginated list (`skip`, `take`, `unreadOnly`) |
| `/api/notifications/unread-count` | GET | `useUnreadCount` | Badge count (60s poll fallback) |
| `/api/notifications/missed?after=` | GET | — (provider) | Missed during offline |
| `/api/notifications/{id}/read` | POST | `useMarkAsRead` | Mark single read |
| `/api/notifications/mark-all-read` | POST | `useMarkAllRead` | Mark all read |
| `/api/notifications/{id}/ack` | POST | `useAcknowledge` | Acknowledge critical |
| `/api/notifications/preferences` | GET/PUT | — (service) | Load/save per-type prefs |

---

## Metadata-First Localization

### How It Works

The BE notification `Title` is just the type code (e.g. `"NEW_ORDER"`), `Body` is `null`. All variable data lives in `Metadata`:

```json
{
  "title": "NEW_ORDER",
  "body": null,
  "metadata": { "orderId": "42", "tableName": "T5" }
}
```

The FE resolver:
1. Looks up `Notifications.messages.{TYPE}.title` / `.body` in the locale JSON
2. Checks required metadata fields are present
3. Interpolates: `"New order #{orderId}"` → `"New order #42"`
4. Falls back to raw `title`/`body` if template or metadata is missing

### Locale JSON Structure

All notification strings live under the top-level `"Notifications"` key in each locale file (`src/messages/{en,vi,fr}.json`):

```json
{
  "Notifications": {
    "title": "Notifications",
    "markAllRead": "Mark all as read",
    "loadMore": "Load more",
    "loading": "Loading...",
    "batchSummary": "more notifications",
    "acknowledge": "Acknowledge",
    "types": {
      "NEW_ORDER": "New Order",
      "ORDER_CANCELLED": "Order Cancelled"
    },
    "messages": {
      "NEW_ORDER": {
        "title": "New order #{orderId}",
        "body": "Table {tableName} placed a new order"
      }
    },
    "metadata": {
      "defaults": { "table": "Table", "staff": "Staff", "guest": "Guest" },
      "statuses": { "AVAILABLE": "Available", "OCCUPIED": "Occupied" },
      "attendanceReasons": { "LATE_CHECKIN": "checked in {minutes} minutes late" }
    }
  }
}
```

### Metadata Normalization

`resolve-localized-notification.ts` normalizes raw BE field names to canonical keys before template interpolation:

| Raw BE field | Canonical key | Notes |
|-------------|--------------|-------|
| `tableCode`, `tableId` | `tableName` | Falls back to `"Table"` default |
| `userName`, `staffId` | `staffName` | Falls back to `"Staff"` default |
| `customerName` | `guestName` | Falls back to `"Guest"` default |
| `amount` | `amount` | Formatted as-is |
| `statusCode` | `status` | Localized via `metadata.statuses` |
| `oldStatusCode` | `oldStatus` | Localized via `metadata.statuses` |
| `alertType` | `reason` | Localized via `metadata.attendanceReasons` |

---

## Anti-Spam Toast System

The toast renderer implements multi-layer throttling to prevent notification flooding:

| Layer | Constant | Default | Behavior |
|-------|----------|---------|----------|
| **Dedup** | `TOAST_DEDUP_WINDOW_MS` | 10 000 ms | Same `type + entityType + entityId` suppressed within window |
| **Cooldown** | `TOAST_GLOBAL_COOLDOWN_MS` | 1 500 ms | Minimum gap between any two toasts |
| **Burst cap** | `MAX_VISIBLE_TOASTS` | 3 | Max individual toasts before batching |
| **Batch delay** | `TOAST_BATCH_DELAY_MS` | 800 ms | Queued overflow flushed as "+N more" summary |

**Critical priority bypasses all layers** — these always show immediately.

Tuning: Edit values in `constants/notification.constants.ts`. Lower `TOAST_DEDUP_WINDOW_MS` for more responsive feedback; raise `MAX_VISIBLE_TOASTS` if users want more visible toasts.

---

## Toast Separation

The app uses **two Sonner `<Toaster>` instances**:

| Instance | Position | Purpose | File |
|----------|----------|---------|------|
| App Toaster | `top-center` | Success/error/info toasts (mutations, form saves) | `src/components/ui/sonner.tsx` |
| Notification Toaster | `top-right` | Real-time notification toasts only | `notification-toaster.tsx` |

Both are rendered in the root layout (`src/app/[locale]/layout.tsx`).

Important: avoid duplicate notification toasts by routing toasts explicitly with `toasterId`.

```tsx
// notification-toaster.tsx
<Toaster toasterId="notification" position="top-right" />

// notification-toast-renderer.tsx
toast.custom(renderNode, {
  toasterId: "notification",
  duration: 5000,
});
```

Without `toasterId`, notification toasts may render in multiple Toaster instances.

---

## Sound System

`use-notification-sound.ts` generates procedural tones via Web Audio API:

| Priority | Frequency | Wave | Duration | Repeats |
|----------|-----------|------|----------|---------|
| Critical | 880 Hz | Square | 200 ms | 3 |
| High | 660 Hz | Triangle | 180 ms | 2 |
| Normal | 520 Hz | Sine | 150 ms | 1 |
| Low | 440 Hz | Sine | 120 ms | 1 |

Respects browser autoplay policy — AudioContext is resumed on first user gesture. Sound is skippable per-type via notification preferences.

---

## Notification Panel (Notification Center)

Facebook-style dropdown panel:

- **Width:** 420px, **Height:** `min(calc(100vh - 72px), 720px)` — tall but never overflows viewport
- **Tabs:** All / Unread + category tabs (Orders, Reservations, Tables, Inventory, Shifts, System)
- **Tab navigation:** horizontal scrollbar removed; use previous/next buttons to page tab groups
- **Scrollable list:** `overflow-y-auto` with `overscroll-contain`
- **Load More:** Button at bottom, fetches next 20 items
- **Mark All Read:** Always visible (disabled when 0 unread)
- **Preferences:** Gear icon opens settings sub-panel

---

## Adding a New Notification Type (End-to-End)

### Step 1 — BE: Add enum value

In `Core/Enum/NotificationType.cs`:

```csharp
public enum NotificationType
{
    // ... existing values ...
    MY_NEW_TYPE    // Add at the end
}
```

### Step 2 — BE: Send notification

In the relevant service, call `NotificationService.SendAsync()` with metadata:

```csharp
await _notificationService.SendAsync(new SendNotificationRequest
{
    Type = NotificationType.MY_NEW_TYPE,
    RecipientUserIds = userIds,
    Priority = NotificationPriority.Normal,
    EntityType = "SomeEntity",
    EntityId = entity.Id.ToString(),
    ActionUrl = $"/dashboard/some-page/{entity.Id}",
    Metadata = new Dictionary<string, string>
    {
        ["someField"] = value,
        ["anotherField"] = anotherValue,
    }
});
```

### Step 3 — FE: Add enum value

In `types/notification.types.ts`:

```typescript
export enum NotificationType {
  // ... existing ...
  MY_NEW_TYPE = "MY_NEW_TYPE",
}
```

### Step 4 — FE: Add type config

In `constants/notification.constants.ts`, add to `NOTIFICATION_TYPE_CONFIG`:

```typescript
[NotificationType.MY_NEW_TYPE]: {
  icon: SomeIcon,      // from lucide-react
  label: "myNewType",  // key under Notifications.types
  category: "Orders",  // or Reservations, Tables, Inventory, Shifts, System
},
```

### Step 5 — FE: Add locale strings (all 3 files)

In `src/messages/{en,vi,fr}.json` under `"Notifications"`:

```json
// types
"MY_NEW_TYPE": "My New Type",

// messages
"MY_NEW_TYPE": {
  "title": "Something happened — {someField}",
  "body": "Details: {anotherField}"
}
```

### Step 6 — FE: Update resolver (if needed)

In `utils/resolve-localized-notification.ts`:

1. Add required fields to `REQUIRED_FIELDS` map:
   ```typescript
   MY_NEW_TYPE: { title: ["someField"], body: ["anotherField"] },
   ```

2. If any metadata keys need normalization (e.g., BE sends `someCode` but template expects `someName`), add mapping logic in the `normalizeMetadata()` function.

### Step 7 — Verify

- Check toast appears on SignalR push with correct localized text
- Check notification center shows correct icon, title, body
- Check all 3 locales render correctly
- Run `npx tsc --noEmit` to validate types

---

## Zustand Store API

```typescript
import { useNotificationStore } from "@/features/staff/notifications";

// Read state
const items = useNotificationStore((s) => s.items);
const unreadCount = useNotificationStore((s) => s.unreadCount);
const connected = useNotificationStore((s) => s.connected);

// Dispatch actions
const store = useNotificationStore.getState();
store.addNotification(dto);       // New real-time notification
store.mergeMissed(dtos);          // Reconnect recovery
store.setItems(list);             // Full replacement
store.appendItems(list);          // Pagination append (dedup by ID)
store.markRead(id);               // Single read
store.markAllRead();              // Bulk read
store.acknowledge(id);            // Acknowledge critical
store.setUnreadCount(n);          // Badge sync
store.setConnected(bool);         // Connection status
store.setPreferences(prefs);      // Cache user prefs
```

Max items: 200 (`MAX_STORE_ITEMS`). Older items are trimmed on `addNotification` / `mergeMissed`.

---

## Integration Checklist

When wiring notifications into a new layout or page:

1. **Provider:** Ensure `<NotificationProvider>` wraps the authenticated area (needs JWT token)
2. **Toaster:** Render `<NotificationToaster />` in the root layout (once)
3. **Toast Renderer:** Render `<NotificationToastRenderer />` inside the auth-protected layout
4. **Bell:** Place `<NotificationBell />` in the header
5. **Center:** Render `<NotificationCenter />` as a popover/modal triggered by the bell
6. **Locale keys:** Ensure all `"Notifications"` keys exist in `en.json`, `vi.json`, `fr.json`

---

## Common Pitfalls

| Symptom | Cause | Fix |
|---------|-------|-----|
| Toasts show raw type code instead of localized text | Missing `messages.{TYPE}` in locale JSON | Add title/body templates to all 3 locale files |
| Blank notification body | Missing required metadata fields from BE | Check `REQUIRED_FIELDS` map vs actual metadata sent |
| Duplicate toasts flooding | Anti-spam bypassed | Check if priority is `Critical` (bypasses all) or dedup key is unique per instance |
| Panel not scrollable | Missing `min-h-0` on flex child | Ensure list container has `min-h-0 overflow-y-auto` |
| Notification sound not playing | Browser autoplay policy | Sound only works after first user interaction on the page |
| Toast appears in wrong position | Using wrong Sonner import | Notification toasts use `toast.custom()` — routed to top-right Toaster |
| `metadata` is null on FE | BE not projecting `MetadataJson` | Check `NotificationRepository` maps `MetadataJson` and calls `HydrateMetadata()` |
