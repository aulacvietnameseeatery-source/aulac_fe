"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { Check, ChevronDown, Loader2, Search, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import "@/styles/components/al-combobox.css";

import type {
  ALComboboxProps,
  ALComboboxOption,
} from "./al-combobox.types";

// ─── Helpers ────────────────────────────────────────────────

const sizeClass = (size: ALComboboxProps["inputSize"] = "default") =>
  ({
    sm: "al-cb-trigger--sm",
    default: "al-cb-trigger--default",
    lg: "al-cb-trigger--lg",
  })[size];

const stateClass = (
  state: ALComboboxProps["state"],
  error: ALComboboxProps["error"]
) => {
  const resolved = error ? "error" : state ?? "default";
  return {
    default: "",
    error: "al-cb-trigger--error",
    success: "al-cb-trigger--success",
  }[resolved];
};

/** Normalise value to an array for internal logic */
const toArray = (
  val: string | number | (string | number)[] | undefined
): (string | number)[] => {
  if (val === undefined || val === null) return [];
  return Array.isArray(val) ? val : [val];
};

/** Simple accent-insensitive search */
const matchSearch = (label: string, query: string) =>
  label.toLowerCase().includes(query.toLowerCase());

/** Group options by their `group` field */
const groupOptions = (options: ALComboboxOption[]) => {
  const map = new Map<string, ALComboboxOption[]>();
  for (const opt of options) {
    const key = opt.group ?? "";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(opt);
  }
  return map;
};

// MAX badges shown before "+N more" (default, overridable via maxTags)
const DEFAULT_MAX_BADGES = 3;

// ─── Component ──────────────────────────────────────────────

const ALCombobox: React.FC<ALComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  multiple = false,
  searchable = true,
  clearable = false,
  allowCreate = false,
  onCreateOption,
  title,
  description,
  error,
  required,
  inputSize = "default",
  state,
  iconStart,
  renderOption,
  renderValue,
  isLoading = false,
  emptyMessage = "No options found.",
  searchPlaceholder = "Search...",
  grouped = false,
  disabled = false,
  readOnly = false,
  tagMode = "collapse",
  maxTags = DEFAULT_MAX_BADGES,
  className,
  wrapperClassName,
  popoverClassName,
  maxHeight = 240,
  name,
  titleAction,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [focusIndex, setFocusIndex] = React.useState(-1);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const selected = toArray(value);

  // ── Filtered options ──────────────────────────────────────
  const filtered = React.useMemo(() => {
    if (!search) return options;
    return options.filter((o) => matchSearch(o.label, search));
  }, [options, search]);

  // Flat list for keyboard navigation
  const navigable = React.useMemo(
    () => filtered.filter((o) => !o.disabled),
    [filtered]
  );

  // ── Selection logic ───────────────────────────────────────
  const isSelected = (val: string | number) => selected.includes(val);

  const handleSelect = (opt: ALComboboxOption) => {
    if (opt.disabled || readOnly) return;
    if (multiple) {
      const next = isSelected(opt.value)
        ? selected.filter((v) => v !== opt.value)
        : [...selected, opt.value];
      onChange?.(next);
    } else {
      onChange?.(opt.value);
      setOpen(false);
      setSearch("");
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    onChange?.(multiple ? [] : "" as unknown as string | number);
  };

  const handleRemoveBadge = (val: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    onChange?.(selected.filter((v) => v !== val));
  };

  const handleCreate = () => {
    if (!search.trim()) return;
    onCreateOption?.(search.trim());
    setSearch("");
  };

  // ── Keyboard navigation ───────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusIndex((prev) =>
          prev < navigable.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex((prev) =>
          prev > 0 ? prev - 1 : navigable.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (focusIndex >= 0 && focusIndex < navigable.length) {
          handleSelect(navigable[focusIndex]);
        } else if (allowCreate && search.trim()) {
          handleCreate();
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setSearch("");
        break;
    }
  };

  // Scroll focused option into view
  React.useEffect(() => {
    if (focusIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-al-cb-option]");
    items[focusIndex]?.scrollIntoView({ block: "nearest" });
  }, [focusIndex]);

  // Reset search & focus when closing
  React.useEffect(() => {
    if (!open) {
      setSearch("");
      setFocusIndex(-1);
    }
  }, [open]);

  // Auto-focus search input when opening
  React.useEffect(() => {
    if (open && searchable) {
      // Small delay for popover animation
      const t = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open, searchable]);

  // ── Resolve display labels ────────────────────────────────
  const getOption = (val: string | number) =>
    options.find((o) => o.value === val);

  const showCreate =
    allowCreate &&
    search.trim() &&
    !filtered.some(
      (o) => o.label.toLowerCase() === search.trim().toLowerCase()
    );

  // ── Render: trigger value area ────────────────────────────
  const renderTriggerContent = () => {
    if (multiple && selected.length > 0) {
      const isExpand = tagMode === "expand";
      const limit = isExpand ? selected.length : maxTags;
      const visible = selected.slice(0, limit);
      const extra = selected.length - limit;

      // Build tooltip text for overflow badge
      const overflowLabels = extra > 0
        ? selected.slice(limit).map((val) => getOption(val)?.label ?? val).join(", ")
        : "";

      return (
        <div className={cn("al-cb-badges", isExpand && "al-cb-badges--expand")}>
          {visible.map((val) => {
            const opt = getOption(val);
            return (
              <span key={val} className="al-cb-badge">
                {renderValue && opt ? renderValue(opt) : opt?.label ?? val}
                <span
                  role="button"
                  tabIndex={0}
                  className="al-cb-badge__remove"
                  onClick={(e) => handleRemoveBadge(val, e)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleRemoveBadge(val, e as any); } }}
                  aria-label={`Remove ${opt?.label ?? val}`}
                >
                  <X size={8} />
                </span>
              </span>
            );
          })}
          {extra > 0 && (
            <span
              className="al-cb-badge-overflow"
              data-tooltip-content={overflowLabels}
              data-tooltip-id="my-tooltip"
            >
              +{extra}
            </span>
          )}
        </div>
      );
    }

    if (!multiple && selected.length === 1) {
      const opt = getOption(selected[0]);
      if (opt) {
        return (
          <span className="al-cb-trigger__value">
            {renderValue ? renderValue(opt) : opt.label}
          </span>
        );
      }
    }

    return (
      <span className="al-cb-trigger__placeholder">{placeholder}</span>
    );
  };

  // ── Render: options list ──────────────────────────────────
  const renderOptions = () => {
    if (isLoading) {
      return (
        <div className="al-cb-loading">
          <Loader2 size={16} className="al-cb-loading__spinner animate-spin" />
          <span>Loading...</span>
        </div>
      );
    }

    if (filtered.length === 0 && !showCreate) {
      return <div className="al-cb-empty">{emptyMessage}</div>;
    }

    if (grouped) {
      const groups = groupOptions(filtered);
      return Array.from(groups.entries()).map(([groupKey, groupOpts]) => (
        <div key={groupKey}>
          {groupKey && (
            <div className="al-cb-group-header">{groupKey}</div>
          )}
          {groupOpts.map((opt) => {
            const isSel = isSelected(opt.value);
            const isFocused =
              navigable[focusIndex]?.value === opt.value;
            return renderSingleOption(opt, isSel, isFocused);
          })}
        </div>
      ));
    }

    return filtered.map((opt) => {
      const isSel = isSelected(opt.value);
      const navI = navigable.indexOf(opt);
      const isFocused = navI === focusIndex;
      return renderSingleOption(opt, isSel, isFocused);
    });
  };

  const renderSingleOption = (
    opt: ALComboboxOption,
    isSel: boolean,
    isFocused: boolean,
  ) => {
    if (renderOption) {
      return (
        <div
          key={opt.value}
          data-al-cb-option
          className={cn(
            "al-cb-option",
            isSel && "al-cb-option--selected",
            isFocused && "al-cb-option--focused",
            opt.disabled && "al-cb-option--disabled"
          )}
          onClick={() => handleSelect(opt)}
        >
          {renderOption(opt, isSel)}
        </div>
      );
    }

    return (
      <div
        key={opt.value}
        data-al-cb-option
        className={cn(
          "al-cb-option",
          isSel && "al-cb-option--selected",
          isFocused && "al-cb-option--focused",
          opt.disabled && "al-cb-option--disabled"
        )}
        role="option"
        aria-selected={isSel}
        onClick={() => handleSelect(opt)}
      >
        {/* Checkbox area for multi */}
        {multiple && (
          <span
            className={cn(
              "al-cb-option__icon flex items-center justify-center rounded border",
              isSel
                ? "bg-white/20 border-white/40"
                : "border-current opacity-40"
            )}
          >
            {isSel && <Check size={10} />}
          </span>
        )}

        {/* Option icon */}
        {opt.icon && <span className="al-cb-option__icon">{opt.icon}</span>}

        {/* Label + description */}
        <span className="al-cb-option__content">
          <span className="al-cb-option__label">{opt.label}</span>
          {opt.description && (
            <span className="al-cb-option__description">
              {opt.description}
            </span>
          )}
        </span>

        {/* Check mark for single select */}
        {!multiple && isSel && (
          <Check size={14} className="al-cb-option__check" />
        )}
      </div>
    );
  };

  // ── Hidden input for form integration ─────────────────────
  const hiddenValue = multiple ? selected.join(",") : (selected[0] ?? "");

  // ── Main render ───────────────────────────────────────────
  return (
    <div className={cn("w-full", wrapperClassName)}>
      {/* Title / Label */}
      {title && (
        <div className="flex items-center justify-between mb-1">
          <label className="al-cb-title !mb-0">
            {title}
            {required && <span className="al-cb-required">*</span>}
          </label>
          {titleAction && <span>{titleAction}</span>}
        </div>
      )}

      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(v) => {
          if (!disabled && !readOnly) setOpen(v);
        }}
      >
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls="al-cb-listbox"
            aria-haspopup="listbox"
            disabled={disabled}
            className={cn(
              "al-cb-trigger",
              sizeClass(inputSize),
              stateClass(state, error),
              disabled && "al-cb-trigger--disabled",
              multiple && tagMode === "expand" && selected.length > 0 && "al-cb-trigger--expand",
              className
            )}
            onKeyDown={handleKeyDown}
          >
            {iconStart && (
              <span className="al-cb-trigger__icon-start">{iconStart}</span>
            )}
            <span className="al-cb-trigger__content">
              {renderTriggerContent()}
            </span>
            {clearable && selected.length > 0 && !disabled && !readOnly && (
              <span
                className="al-cb-trigger__clear"
                onClick={handleClear}
                role="button"
                aria-label="Clear selection"
              >
                <X size={10} />
              </span>
            )}
            <ChevronDown size={16} className="al-cb-trigger__chevron" />
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className={cn("al-cb-popover z-50", popoverClassName)}
            style={{ width: "var(--radix-popover-trigger-width)" }}
            onKeyDown={handleKeyDown}
          >
            {/* Search */}
            {searchable && (
              <div className="al-cb-search">
                <Search size={14} className="al-cb-search__icon" />
                <input
                  ref={searchRef}
                  className="al-cb-search__input"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setFocusIndex(-1);
                  }}
                  autoComplete="off"
                />
              </div>
            )}

            {/* Options */}
            <div
              ref={listRef}
              id="al-cb-listbox"
              className="al-cb-list"
              role="listbox"
              aria-multiselectable={multiple}
              style={{ maxHeight }}
            >
              {renderOptions()}

              {/* Create row */}
              {showCreate && (
                <button
                  type="button"
                  className="al-cb-create"
                  onClick={handleCreate}
                >
                  <Plus size={14} />
                  <span>
                    Create &quot;<strong>{search.trim()}</strong>&quot;
                  </span>
                </button>
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {/* Hidden input for forms */}
      {name && <input type="hidden" name={name} value={String(hiddenValue)} />}

      {/* Error / Description */}
      {error && <span className="al-cb-error">{error}</span>}
      {!error && description && (
        <span className="al-cb-description">{description}</span>
      )}
    </div>
  );
};

ALCombobox.displayName = "ALCombobox";

export { ALCombobox };
