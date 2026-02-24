"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

// ─── Context ───────────────────────────────────────────────────────────────────
type Direction = "top" | "bottom" | "left" | "right"

interface DrawerContextValue {
  open: boolean
  onClose: () => void
  direction: Direction
}

const DrawerContext = React.createContext<DrawerContextValue>({
  open: false,
  onClose: () => {},
  direction: "right",
})

function useDrawerContext() {
  return React.useContext(DrawerContext)
}

// ─── Root ──────────────────────────────────────────────────────────────────────
interface DrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  direction?: Direction
  children: React.ReactNode
}

function Drawer({ open = false, onOpenChange, direction = "right", children }: DrawerProps) {
  const onClose = React.useCallback(() => {
    onOpenChange?.(false)
  }, [onOpenChange])

  const value = React.useMemo(
    () => ({ open, onClose, direction }),
    [open, onClose, direction]
  )

  return (
    <DrawerContext.Provider value={value}>
      {children}
    </DrawerContext.Provider>
  )
}

// ─── Trigger ───────────────────────────────────────────────────────────────────
function DrawerTrigger({ ...props }: React.ComponentProps<"button">) {
  return <button data-slot="drawer-trigger" {...props} />
}

// ─── Portal (noop wrapper) ─────────────────────────────────────────────────────
function DrawerPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// ─── Close ─────────────────────────────────────────────────────────────────────
function DrawerClose({ className, ...props }: React.ComponentProps<"button">) {
  const { onClose } = useDrawerContext()
  return (
    <button
      data-slot="drawer-close"
      onClick={onClose}
      className={className}
      {...props}
    />
  )
}

// ─── Overlay (standalone, for external use if needed) ──────────────────────────
function DrawerOverlay({ className, ...props }: React.ComponentProps<"div">) {
  const { onClose } = useDrawerContext()
  return (
    <div
      data-slot="drawer-overlay"
      className={cn("fixed inset-0 z-40 bg-black/50", className)}
      onClick={onClose}
      {...props}
    />
  )
}

// ─── Translate values for each direction ───────────────────────────────────────
const TRANSLATE_HIDDEN: Record<Direction, string> = {
  right: "translate-x-full",
  left: "-translate-x-full",
  top: "-translate-y-full",
  bottom: "translate-y-full",
}

const DIRECTION_CLASSES: Record<Direction, string> = {
  right: "inset-y-0 right-0 w-3/4 border-l sm:max-w-sm",
  left: "inset-y-0 left-0 w-3/4 border-r sm:max-w-sm",
  top: "inset-x-0 top-0 mb-24 max-h-[80vh] rounded-b-lg border-b",
  bottom: "inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-lg border-t",
}

const TRANSITION_DURATION = 300 // ms

// ─── Content ───────────────────────────────────────────────────────────────────
function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open, direction, onClose } = useDrawerContext()
  const [mounted, setMounted] = React.useState(false)
  // Whether the portal DOM is rendered
  const [shouldRender, setShouldRender] = React.useState(false)
  // Whether the "open" visual state is active (drives the transition)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (open) {
      // Mount first, then on next frame activate the transition
      setShouldRender(true)
      // Use double rAF to ensure the initial (hidden) state is painted before transitioning
      let raf2: number
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setIsVisible(true)
        })
      })
      return () => {
        cancelAnimationFrame(raf1)
        cancelAnimationFrame(raf2)
      }
    } else {
      // Start close transition
      setIsVisible(false)
      // After transition ends, unmount
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, TRANSITION_DURATION)
      return () => clearTimeout(timer)
    }
  }, [open])

  if (!mounted || !shouldRender) return null

  return createPortal(
    <>
      {/* Overlay */}
      <div
        data-slot="drawer-overlay"
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDuration: `${TRANSITION_DURATION}ms` }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-40 flex h-auto flex-col transition-transform ease-out",
          DIRECTION_CLASSES[direction],
          isVisible ? "translate-x-0 translate-y-0" : TRANSLATE_HIDDEN[direction],
          className
        )}
        style={{ transitionDuration: `${TRANSITION_DURATION}ms` }}
        {...props}
      >
        {direction === "bottom" && (
          <div className="bg-muted mx-auto mt-4 h-2 w-25 shrink-0 rounded-full" />
        )}
        {children}
      </div>
    </>,
    document.body
  )
}

// ─── Header ────────────────────────────────────────────────────────────────────
function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 md:gap-1.5 md:text-left",
        className
      )}
      {...props}
    />
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

// ─── Title ─────────────────────────────────────────────────────────────────────
function DrawerTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

// ─── Description ───────────────────────────────────────────────────────────────
function DrawerDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
