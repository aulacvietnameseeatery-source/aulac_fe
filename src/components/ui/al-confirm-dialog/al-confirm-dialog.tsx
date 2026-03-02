"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export type ALConfirmDialogVariant = "delete" | "warning" | "confirm" | "custom";

export interface ALConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Called when the dialog should close (backdrop click, X, or Cancel) */
  onClose: () => void;
  /** Called when the confirm button is clicked */
  onConfirm: () => void;
  /** Title displayed prominently */
  title: string;
  /** Descriptive message below the title */
  message?: string;
  /** Pre-built variant — determines icon, colors, and default button labels */
  variant?: ALConfirmDialogVariant;
  /** Override the confirm button text (defaults based on variant) */
  confirmText?: string;
  /** Override the cancel button text */
  cancelText?: string;
  /** Custom icon — overrides the variant's default icon */
  icon?: LucideIcon | React.ReactNode;
  /** Show loading spinner on the confirm button */
  isLoading?: boolean;
  /** Custom content below the message */
  children?: React.ReactNode;
  /** Override the confirm button's colour variant (maps to Button component variants) */
  confirmButtonVariant?: "danger" | "primary" | "default" | "success";
  /** Additional class names for the dialog container */
  className?: string;
}

// ──────────────────────────────────────────────────────────
// Variant configuration
// ──────────────────────────────────────────────────────────

interface VariantConfig {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  confirmBtnVariant: "danger" | "primary" | "default" | "success";
  defaultConfirmText: string;
}

const VARIANT_CONFIG: Record<Exclude<ALConfirmDialogVariant, "custom">, VariantConfig> = {
  delete: {
    icon: Trash2,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    confirmBtnVariant: "danger",
    defaultConfirmText: "Delete",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    confirmBtnVariant: "primary",
    defaultConfirmText: "Continue",
  },
  confirm: {
    icon: CheckCircle2,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    confirmBtnVariant: "default",
    defaultConfirmText: "Confirm",
  },
};

// ──────────────────────────────────────────────────────────
// Animation variants
// ──────────────────────────────────────────────────────────

const overlayMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
};

const contentMotion = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 8 },
  transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] as const },
};

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────

export function ALConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = "confirm",
  confirmText,
  cancelText = "Cancel",
  icon,
  isLoading = false,
  children,
  confirmButtonVariant,
  className,
}: ALConfirmDialogProps) {
  // Resolve config based on variant
  const config = variant !== "custom" ? VARIANT_CONFIG[variant] : null;
  const resolvedConfirmText = confirmText ?? config?.defaultConfirmText ?? "Confirm";
  const resolvedBtnVariant = confirmButtonVariant ?? config?.confirmBtnVariant ?? "default";

  // Resolve icon
  const renderIcon = () => {
    if (icon) {
      // If icon is a LucideIcon component (function), render it; otherwise render as ReactNode
      if (typeof icon === "function") {
        const IconComponent = icon as LucideIcon;
        return (
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", config?.iconBg ?? "bg-gray-100")}>
            <IconComponent className={cn("w-6 h-6", config?.iconColor ?? "text-gray-500")} />
          </div>
        );
      }
      return <>{icon}</>;
    }
    if (config) {
      const DefaultIcon = config.icon;
      return (
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", config.iconBg)}>
          <DefaultIcon className={cn("w-6 h-6", config.iconColor)} />
        </div>
      );
    }
    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            {...overlayMotion}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            {...contentMotion}
            className={cn(
              "relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5",
              className
            )}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <div className="flex flex-col items-center text-center gap-4">
                {/* Icon */}
                {renderIcon()}

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 font-display">
                    {title}
                  </h3>
                  {message && (
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {message}
                    </p>
                  )}
                </div>

                {/* Custom children */}
                {children}

                {/* Actions */}
                <div className="flex items-center gap-3 w-full mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    {cancelText}
                  </Button>
                  <Button
                    type="button"
                    variant={resolvedBtnVariant}
                    className="flex-1"
                    onClick={onConfirm}
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    {resolvedConfirmText}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
