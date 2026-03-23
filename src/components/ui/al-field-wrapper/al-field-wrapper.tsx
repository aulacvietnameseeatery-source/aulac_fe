import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────

export type ALFieldSize = "sm" | "default" | "lg";

export interface ALFieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
  size?: ALFieldSize;
  action?: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export interface ALFieldMessageProps {
  error?: string;
  description?: string;
  className?: string;
}

export interface ALFieldWrapperProps {
  title?: string;
  description?: string;
  error?: string;
  required?: boolean;
  size?: ALFieldSize;
  titleAction?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

// ─── Size maps ──────────────────────────────────────────────

const LABEL_SIZE: Record<ALFieldSize, string> = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-base",
};

const LABEL_GAP: Record<ALFieldSize, string> = {
  sm: "mb-1",
  default: "mb-1.5",
  lg: "mb-1.5",
};

// ─── ALFieldLabel ───────────────────────────────────────────

const ALFieldLabel: React.FC<ALFieldLabelProps> = ({
  children,
  required,
  size = "default",
  action,
  htmlFor,
  className,
}) => {
  const baseLabel = cn("block font-medium text-[#1A3A52]", LABEL_SIZE[size], className);

  if (action) {
    return (
      <div className={cn("flex items-center justify-between", LABEL_GAP[size])}>
        <label htmlFor={htmlFor} className={baseLabel}>
          {children}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        <span className="shrink-0">{action}</span>
      </div>
    );
  }

  return (
    <label htmlFor={htmlFor} className={cn(baseLabel, LABEL_GAP[size])}>
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
};

ALFieldLabel.displayName = "ALFieldLabel";

// ─── ALFieldMessage ─────────────────────────────────────────

const ALFieldMessage: React.FC<ALFieldMessageProps> = ({
  error,
  description,
  className,
}) => {
  if (error) {
    return <p className={cn("mt-1 text-xs text-red-500", className)}>{error}</p>;
  }
  if (description) {
    return <p className={cn("mt-1 text-xs text-[#1A3A52]/55", className)}>{description}</p>;
  }
  return null;
};

ALFieldMessage.displayName = "ALFieldMessage";

// ─── ALFieldWrapper (convenience composition) ───────────────

const ALFieldWrapper = React.forwardRef<HTMLDivElement, ALFieldWrapperProps>(
  (
    {
      title,
      description,
      error,
      required,
      size = "default",
      titleAction,
      className,
      children,
    },
    ref
  ) => (
    <div ref={ref} className={cn("w-full", className)}>
      {title && (
        <ALFieldLabel size={size} required={required} action={titleAction}>
          {title}
        </ALFieldLabel>
      )}
      {children}
      <ALFieldMessage error={error} description={description} />
    </div>
  )
);

ALFieldWrapper.displayName = "ALFieldWrapper";

export { ALFieldLabel, ALFieldMessage, ALFieldWrapper };
