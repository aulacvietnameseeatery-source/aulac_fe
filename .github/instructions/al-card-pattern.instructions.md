---
description: ALCard reusable component pattern for the Âu Lạc FE — unified card wrapper with presets for variants, animations, effects, and self-contained hover state management.
applyTo: "src/features/**"
---

# Âu Lạc — ALCard Pattern & Self-Contained Hover

## What Is ALCard?

`ALCard` is a reusable, strongly-typed card wrapper component that eliminates boilerplate styling and event wiring across pages. It provides:

- **Semantic HTML:** Render as `<div>`, `<article>`, `<section>`, or custom tags via `as` prop
- **Preset styles:** variants, elevation, border radius, animations, hover effects
- **Self-contained hover state:** optional internal hover tracking with render-prop children
- **Backward compatibility:** legacy `hoverable` and `animated` flags still work

**Import:** `import { ALCard } from "@/components/ui/al-card"`

---

## When to Use ALCard

| Need | Use |
|------|-----|
| Main card container with consistent styling | ✓ ALCard with `variant`, `elevation`, etc. |
| Card that responds to hover without parent wiring | ✓ ALCard with `withHoverState` + render-prop children |
| Banner / status indicator with accent color | ✓ ALCard with `variant="tinted"` or `variant="soft"` |
| Clickable row with lift/scale hover effect | ✓ ALCard with `hoverEffect="lift"` + `animated` |
| Transparent overlay / glass effect | ✓ ALCard with `variant="glass"` |
| **Don't:** Custom `<div>` with hardcoded Tailwind classes for cards | ✗ Use ALCard instead |

---

## Props Reference

```ts
interface ALCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  // HTML element type to render
  as?: React.ElementType;

  // Internal padding (if not overridden via className)
  padding?: "none" | "sm" | "md" | "lg";

  // Style preset: default, soft, tinted, glass, outline
  variant?: "default" | "soft" | "tinted" | "glass" | "outline";

  // Shadow depth: none, sm, md, lg
  elevation?: "none" | "sm" | "md" | "lg";

  // Border radius: md, lg, xl, 2xl
  radius?: "md" | "lg" | "xl" | "2xl";

  // Entry animation: none, fade, slide-up
  animation?: "none" | "fade" | "slide-up";

  // Hover effect: none, lift, scale, glow
  hoverEffect?: "none" | "lift" | "scale" | "glow";

  // Enable internal hover state (paired with render-prop children)
  withHoverState?: boolean;

  // Children: can be ReactNode or function receiving { isHovered }
  children?: React.ReactNode | (state: ALCardRenderState) => React.ReactNode;

  // [Legacy flags — still supported]
  hoverable?: boolean;
  animated?: boolean;

  // [CSS overrides if needed]
  className?: string;
  style?: React.CSSProperties;
}

interface ALCardRenderState {
  isHovered: boolean;
}
```

---

## Examples

### Basic Card with Variant

```tsx
<ALCard variant="soft" padding="md" radius="lg">
  <h3 className="font-semibold">Shift Overview</h3>
  <p>Total shifts assigned: 12</p>
</ALCard>
```

### Card with Hover Effect (No Parent Event Wiring)

```tsx
<ALCard
  hoverEffect="lift"
  animation="fade"
  withHoverState
>
  {({ isHovered }) => (
    <div className="transition-all">
      <h4>{isHovered ? "Click to edit" : "Shift Name"}</h4>
      <p className={isHovered ? "text-blue-600" : "text-gray-600"}>
        Detail info
      </p>
    </div>
  )}
</ALCard>
```

### Clickable Row with Glass Effect

```tsx
<ALCard
  as="button"
  variant="glass"
  hoverEffect="scale"
  elevation="sm"
  onClick={() => handleSelect(shiftId)}
  className="w-full cursor-pointer text-left"
>
  <div className="flex items-center justify-between">
    <span className="font-medium">{shiftName}</span>
    <Badge>{status}</Badge>
  </div>
</ALCard>
```

### Tinted Banner (Status Info)

```tsx
<ALCard variant="tinted" padding="md" radius="md" elevation="none">
  <div className="flex items-center gap-2">
    <AlertCircle className="h-5 w-5" />
    <span>No shifts assigned this week</span>
  </div>
</ALCard>
```

### Self-Contained Selection State

Instead of **parent managing hover:**

```tsx
// ❌ OLD: Parent tracks hover via useState
const [hoveredId, setHoveredId] = useState<string | null>(null);

{shifts.map(shift => (
  <div
    key={shift.id}
    onMouseEnter={() => setHoveredId(shift.id)}
    onMouseLeave={() => setHoveredId(null)}
  >
    <p className={hoveredId === shift.id ? "text-blue" : ""}>
      {shift.name}
    </p>
  </div>
))}
```

Use **ALCard's internal state:**

```tsx
// ✓ NEW: ALCard manages hover internally
{shifts.map(shift => (
  <ALCard 
    key={shift.id} 
    withHoverState 
    hoverEffect="lift"
  >
    {({ isHovered }) => (
      <p className={isHovered ? "text-blue-600" : "text-gray-700"}>
        {shift.name}
      </p>
    )}
  </ALCard>
))}
```

---

## Variant Presets

### `variant="default"`
- **Purpose:** Plain card shell with soft border and minimal shadow
- **Use:** Most list items, plain content containers
- **Colors:** `bg-white`, `border-slate-200/60`

### `variant="soft"`
- **Purpose:** Muted background, ideal for secondary info or summary sections
- **Use:** Summary cards, filter panels, info boxes
- **Colors:** `bg-[#FDFBF9]`, `border-[#D5BA98]/40`

### `variant="tinted"`
- **Purpose:** Accent background (beige tint), stands out subtly
- **Use:** Status banners, highlights, call-outs
- **Colors:** `bg-[#D5BA98]/10`, `border-[#D5BA98]/60`

### `variant="glass"`
- **Purpose:** Transparent with backdrop blur, modern overlay feel
- **Use:** Overlay modals, floating panels, premium interactions
- **Colors:** `bg-white/80 backdrop-blur-sm`, `border-white/30`

### `variant="outline"`
- **Purpose:** Minimal—only border, no fill
- **Use:** Subtle separators, compact lists
- **Colors:** `bg-transparent`, `border-slate-300`

---

## Elevation Presets

| Value | Style | Use |
|-------|-------|-----|
| `"none"` | No shadow | Flat surfaces, text-only content |
| `"sm"` | `shadow-sm` | Default for most cards |
| `"md"` | `shadow-md` | Clickable items, hover targets |
| `"lg"` | `shadow-lg md:shadow-xl` | Modals, prominently elevated sections |

---

## Animation Presets

| Value | Style | Use |
|-------|-------|-----|
| `"none"` | No animation | Static content |
| `"fade"` | Fade-in on mount | Gentle entrance (200ms) |
| `"slide-up"` | Slide up on mount | More dramatic entrance (300ms) |

---

## Hover Effect Presets

| Value | Style | Use |
|-------|-------|-----|
| `"none"` | No effect | Non-interactive content |
| `"lift"` | Translate up + shadow increase on hover | Clickable rows, selectable items |
| `"scale"` | Slight scale (1.02) on hover | Buttons, actionable cards |
| `"glow"` | Border/shadow glow on hover | Premium/premium interactions |

---

## Migration Guide

### From Raw Tailwind/Custom Divs → ALCard

**Before:**
```tsx
<div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 hover:shadow-md transition-shadow">
  <h3>{title}</h3>
  <p>{description}</p>
</div>
```

**After:**
```tsx
<ALCard variant="default" elevation="sm" padding="md" radius="lg">
  <h3>{title}</h3>
  <p>{description}</p>
</ALCard>
```

### From State-Managed Hover → Self-Contained

**Before:**
```tsx
const [hoveredId, setHoveredId] = useState<string | null>(null);

<div
  onMouseEnter={() => setHoveredId(id)}
  onMouseLeave={() => setHoveredId(null)}
  className={hoveredId === id ? "bg-blue-100" : ""}
>
  {content}
</div>
```

**After:**
```tsx
<ALCard withHoverState hoverEffect="lift">
  {({ isHovered }) => (
    <div className={isHovered ? "bg-blue-100" : ""}>
      {content}
    </div>
  )}
</ALCard>
```

---

## Backward Compatibility

The old `hoverable` and `animated` flags remain functional:

```tsx
// ✓ Old flag still works
<ALCard hoverable animated>
  Content
</ALCard>

// ✓ Equivalent to new preset syntax
<ALCard hoverEffect="lift" animation="fade">
  Content
</ALCard>
```

For new code, prefer the explicit preset names (`hoverEffect`, `animation`).

---

## Tips & Best Practices

1. **Render props for hover only when needed:** If you don't need to change UI based on hover, use `hoverEffect` prop instead.
   ```tsx
   // ✓ Good: Simple hover effect, no render function needed
   <ALCard hoverEffect="lift">This is clickable</ALCard>

   // ✓ Also good: When you need to show/hide elements
   <ALCard withHoverState>
     {({ isHovered }) => isHovered && <EditButton />}
   </ALCard>
   ```

2. **Combine variants + effects judiciously:**
   ```tsx
   // ✗ Too many effects — overwhelming
   <ALCard variant="glass" hoverEffect="glow" animation="slide-up" />

   // ✓ Balanced — intentional
   <ALCard variant="soft" hoverEffect="lift" />
   ```

3. **Use `as` prop for semantic HTML:**
   ```tsx
   <ALCard as="article">Article content</ALCard>
   <ALCard as="button" onClick={handleAction}>Clickable item</ALCard>
   ```

4. **Override with className when preset doesn't fit:**
   ```tsx
   <ALCard 
     variant="default"
     className="bg-custom-gradient border-custom-color"
   >
     Custom styled content
   </ALCard>
   ```

5. **Memoize render-prop children if expensive:**
   ```tsx
   const renderShiftRow = useCallback(({ isHovered }: ALCardRenderState) => (
     <ExpensiveShiftComponent isHovered={isHovered} />
   ), []);

   <ALCard withHoverState>
     {renderShiftRow}
   </ALCard>
   ```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Hover effect not working | `withHoverState` not set | Add `withHoverState` prop |
| TypeScript error on `children` | Mixing string children with function | Use render prop **or** string children, not both |
| Shadow not showing | Card has `elevation="none"` | Set `elevation="sm"` or higher |
| Animation too fast/slow | Layout shift not smooth | Add `transition-all` to child elements or use `duration-*` Tailwind classes |

---

## Files & Reference

- **Component:** [src/components/ui/al-card/al-card.tsx](src/components/ui/al-card/al-card.tsx)
- **Export:** [src/components/ui/al-card/index.ts](src/components/ui/al-card/index.ts)
- **Used in:** Shift management pages (my-shifts, shift-live, shift-reports, etc.)
