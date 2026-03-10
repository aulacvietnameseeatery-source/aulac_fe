"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X, GripVertical, TagIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ALInput } from "@/components/ui/al-input";
import { ALConfirmDialog } from "@/components/ui/al-confirm-dialog";
import { cn } from "@/lib/utils";
import type {
  LookupValueDto,
  CreateLookupValueRequest,
  UpdateLookupValueRequest,
  I18nMap,
} from "../types/lookup.types";

// ─── Types ───────────────────────────────────────────────────

type Locale = "en" | "vi" | "fr";

const LOCALES: { key: Locale; flag: string; label: string }[] = [
  { key: "en", flag: "🇬🇧", label: "EN" },
  { key: "vi", flag: "🇻🇳", label: "VI" },
  { key: "fr", flag: "🇫🇷", label: "FR" },
];

export interface LookupManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Display label for the entity (e.g. "Zone", "Table Type", "Dish Status") */
  entityLabel: string;
  /** The current list of lookup items — fetched by the parent via its own useQuery */
  items: LookupValueDto[];
  /** Whether the parent query is loading */
  isLoading?: boolean;
  /** Create a new lookup value. Must return the created item (for auto-select). */
  onSave: (data: CreateLookupValueRequest) => Promise<LookupValueDto>;
  /** Update an existing lookup value. */
  onUpdate: (id: number, data: UpdateLookupValueRequest) => Promise<unknown>;
  /** Delete a lookup value. */
  onDelete: (id: number) => Promise<unknown>;
  /** Called after a new item is successfully created so the parent can auto-select it */
  onCreated?: (item: LookupValueDto) => void;
}

// ─── Inline form state ───────────────────────────────────────

interface FormState {
  nameI18n: Record<Locale, string>;
  descriptionI18n: Record<Locale, string>;
  sortOrder: string;
}

const EMPTY_FORM: FormState = {
  nameI18n: { en: "", vi: "", fr: "" },
  descriptionI18n: { en: "", vi: "", fr: "" },
  sortOrder: "",
};

// ─── Component ───────────────────────────────────────────────

const LookupManagerModal: React.FC<LookupManagerModalProps> = ({
  isOpen,
  onClose,
  entityLabel,
  items,
  isLoading = false,
  onSave,
  onUpdate,
  onDelete,
  onCreated,
}) => {
  // ── Form state ──
  const [formMode, setFormMode] = useState<"idle" | "add" | "edit">("idle");
  const [editTarget, setEditTarget] = useState<LookupValueDto | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [activeLang, setActiveLang] = useState<Locale>("en");
  const [deleteTarget, setDeleteTarget] = useState<LookupValueDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus name input when form opens or language changes
  useEffect(() => {
    if (formMode !== "idle") {
      const t = setTimeout(() => nameInputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [formMode, activeLang]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setFormMode("idle");
      setEditTarget(null);
      setForm(EMPTY_FORM);
      setDeleteTarget(null);
      setActiveLang("en");
    }
  }, [isOpen]);

  // ── Handlers ──
  const handleStartAdd = () => {
    setForm({ ...EMPTY_FORM, sortOrder: String(items.length + 1) });
    setEditTarget(null);
    setFormMode("add");
    setActiveLang("en");
  };

  const handleStartEdit = useCallback((item: LookupValueDto) => {
    setForm({
      nameI18n: {
        en: item.i18n?.en ?? "",
        vi: item.i18n?.vi ?? "",
        fr: item.i18n?.fr ?? "",
      },
      descriptionI18n: {
        en: item.descriptionI18n?.en ?? "",
        vi: item.descriptionI18n?.vi ?? "",
        fr: item.descriptionI18n?.fr ?? "",
      },
      sortOrder: String(item.sortOrder ?? ""),
    });
    setEditTarget(item);
    setFormMode("edit");
    setActiveLang("en");
  }, []);

  const handleCancelForm = () => {
    setFormMode("idle");
    setEditTarget(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    const primaryName =
      form.nameI18n.en.trim() ||
      form.nameI18n.vi.trim() ||
      form.nameI18n.fr.trim();
    if (!primaryName) return;

    const cleanMap = (m: Record<Locale, string>): I18nMap | undefined => {
      const result: I18nMap = {};
      if (m.en.trim()) result.en = m.en.trim();
      if (m.vi.trim()) result.vi = m.vi.trim();
      if (m.fr.trim()) result.fr = m.fr.trim();
      return Object.keys(result).length > 0 ? result : undefined;
    };

    const sortOrder = form.sortOrder.trim()
      ? parseInt(form.sortOrder.trim(), 10)
      : undefined;

    setIsSaving(true);
    try {
      if (formMode === "add") {
        const payload: CreateLookupValueRequest = {
          valueName: primaryName,
          sortOrder,
          i18n: cleanMap(form.nameI18n),
          descriptionI18n: cleanMap(form.descriptionI18n),
        };
        const created = await onSave(payload);
        onCreated?.(created);
      } else if (formMode === "edit" && editTarget) {
        const payload: UpdateLookupValueRequest = {
          valueName: primaryName,
          sortOrder,
          i18n: cleanMap(form.nameI18n),
          descriptionI18n: cleanMap(form.descriptionI18n),
        };
        await onUpdate(editTarget.valueId, payload);
      }
      setFormMode("idle");
      setEditTarget(null);
      setForm(EMPTY_FORM);
    } catch {
      // Errors handled by parent mutation (toast)
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = useCallback((item: LookupValueDto) => {
    setDeleteTarget(item);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget.valueId);
      // If we were editing the deleted item, close the form
      if (editTarget?.valueId === deleteTarget.valueId) handleCancelForm();
      setDeleteTarget(null);
    } catch {
      // handled by parent
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Form field helpers ──
  const updateName = (value: string) =>
    setForm((f) => ({ ...f, nameI18n: { ...f.nameI18n, [activeLang]: value } }));

  const updateDescription = (value: string) =>
    setForm((f) => ({ ...f, descriptionI18n: { ...f.descriptionI18n, [activeLang]: value } }));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); handleSave(); }
    if (e.key === "Escape") handleCancelForm();
  };

  // Green dot if locale has any content
  const hasContent = (lang: Locale) =>
    form.nameI18n[lang].trim().length > 0 ||
    form.descriptionI18n[lang].trim().length > 0;

  const isFormValid =
    form.nameI18n.en.trim() ||
    form.nameI18n.vi.trim() ||
    form.nameI18n.fr.trim();

  // ── Locale coverage badges for a list item ──
  const LocaleBadges = ({ item }: { item: LookupValueDto }) => (
    <div className="flex gap-0.5">
      {LOCALES.map(({ key, flag }) => {
        const hasName = !!item.i18n?.[key];
        const hasDesc = !!item.descriptionI18n?.[key];
        return (
          <span
            key={key}
            data-tooltip-content={`${flag} name: ${item.i18n?.[key] || "—"} | description: ${item.descriptionI18n?.[key] || "—"}`}
            data-tooltip-id="my-tooltip"
            className={cn(
              "text-[10px] px-1 py-0 rounded leading-4 border select-none",
              hasName
                ? hasDesc
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-blue-50 border-blue-200 text-blue-600"
                : "bg-gray-50 border-gray-200 text-gray-300"
            )}
          >
            {key.toUpperCase()}
          </span>
        );
      })}
    </div>
  );

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        title={`Manage ${entityLabel}s`}
        width="900px"
        footer={
          <div className="flex justify-end w-full">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        }
      >
        {/* ── Split layout: list left | form right ── */}
        <div className="flex h-[500px] overflow-hidden">

          {/* ════ Left panel — item list ════ */}
          <div
            className={cn(
              "flex flex-col border-r border-gray-200 transition-all duration-200",
              formMode !== "idle" ? "w-[390px] shrink-0" : "flex-1"
            )}
          >
            {/* List header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <span className="text-sm font-semibold text-gray-700">
                {items.length} {entityLabel}{items.length !== 1 ? "s" : ""}
              </span>
              {formMode === "idle" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleStartAdd}
                >
                  <Plus size={13} className="mr-1" />
                  Add {entityLabel}
                </Button>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-100 shrink-0">
              <span className="text-[10px] text-gray-400 font-medium">
                Locale coverage:
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                name + desc
              </span>
              <span className="flex items-center gap-1 text-[10px] text-blue-500">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                name only
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                missing
              </span>
            </div>

            {/* List body */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  Loading…
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 py-8">
                  <TagIcon size={28} className="opacity-30" />
                  <p className="text-sm">No {entityLabel.toLowerCase()}s yet.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleStartAdd}
                  >
                    <Plus size={13} className="mr-1" />
                    Add first {entityLabel}
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const isActive = editTarget?.valueId === item.valueId;
                    return (
                      <li
                        key={item.valueId}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 group transition-colors",
                          isActive
                            ? "bg-indigo-50 border-l-2 border-indigo-500"
                            : "hover:bg-gray-50 border-l-2 border-transparent"
                        )}
                      >
                        {/* Sort order / drag handle placeholder */}
                        <span className="text-xs text-gray-300 w-5 text-center font-mono shrink-0 group-hover:hidden">
                          {item.sortOrder}
                        </span>
                        <GripVertical
                          size={14}
                          className="text-gray-300 shrink-0 hidden group-hover:block cursor-grab"
                        />

                        {/* Code badge */}
                        <span className="font-mono text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0">
                          {item.valueCode}
                        </span>

                        {/* Names */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {item.valueName}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-400 truncate">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Locale coverage badges */}
                        <div className="shrink-0 hidden sm:block">
                          <LocaleBadges item={item} />
                        </div>

                        {/* Actions */}
                        <div
                          className={cn(
                            "flex items-center gap-0.5 shrink-0 transition-opacity",
                            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )}
                        >
                          <button
                            type="button"
                            data-tooltip-content={`Edit ${entityLabel}`}
                            data-tooltip-id="my-tooltip"
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 rounded hover:bg-white hover:shadow-sm text-gray-400 hover:text-indigo-600 transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            data-tooltip-content={`Delete ${entityLabel}`}
                            data-tooltip-id="my-tooltip"
                            onClick={() => handleDeleteClick(item)}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* ════ Right panel — form (shown when adding / editing) ════ */}
          {formMode !== "idle" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Form header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                <h3 className="text-sm font-semibold text-gray-800">
                  {formMode === "add" ? `New ${entityLabel}` : `Edit ${entityLabel}`}
                  {editTarget && (
                    <span className="ml-2 font-mono text-[11px] text-gray-400 font-normal">
                      #{editTarget.valueId}
                    </span>
                  )}
                </h3>

                {/* Language tabs */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                  {LOCALES.map(({ key, flag, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveLang(key)}
                      className={cn(
                        "relative flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                        activeLang === key
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      <span>{flag}</span>
                      <span>{label}</span>
                      {hasContent(key) && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* Locale hint */}
                <p className="text-xs text-gray-400">
                  Editing <span className="font-semibold text-gray-600">{LOCALES.find(l => l.key === activeLang)?.flag} {activeLang.toUpperCase()}</span>.
                  Switch tabs to fill other languages.
                  {activeLang === "en" && (
                    <span className="text-indigo-500"> EN name is required.</span>
                  )}
                </p>

                {/* Name */}
                <ALInput
                  ref={nameInputRef}
                  title={`Name (${activeLang.toUpperCase()})`}
                  required={activeLang === "en"}
                  placeholder={getNamePlaceholder(activeLang, entityLabel)}
                  value={form.nameI18n[activeLang]}
                  onChange={(e) => updateName(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                {/* Description */}
                <ALInput
                  title={`Description (${activeLang.toUpperCase()})`}
                  placeholder={getDescPlaceholder(activeLang)}
                  value={form.descriptionI18n[activeLang]}
                  onChange={(e) => updateDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                {/* Sort order */}
                <ALInput
                  title="Sort Order"
                  type="number"
                  placeholder="e.g. 1"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sortOrder: e.target.value }))
                  }
                  onKeyDown={handleKeyDown}
                />

                {/* Translation summary */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Translation summary
                    </span>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-3 py-1.5 text-left font-medium text-gray-400 w-12">
                          Locale
                        </th>
                        <th className="px-3 py-1.5 text-left font-medium text-gray-400">
                          Name
                        </th>
                        <th className="px-3 py-1.5 text-left font-medium text-gray-400">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {LOCALES.map(({ key, flag, label }) => (
                        <tr
                          key={key}
                          className={cn(
                            "border-b border-gray-50 cursor-pointer transition-colors",
                            activeLang === key
                              ? "bg-indigo-50"
                              : "hover:bg-gray-50"
                          )}
                          onClick={() => setActiveLang(key)}
                        >
                          <td className="px-3 py-1.5 font-medium text-gray-600">
                            {flag} {label}
                          </td>
                          <td className="px-3 py-1.5 text-gray-700 max-w-[130px] truncate">
                            {form.nameI18n[key].trim() || (
                              <span className="text-gray-300 italic">empty</span>
                            )}
                          </td>
                          <td className="px-3 py-1.5 text-gray-500 max-w-[130px] truncate">
                            {form.descriptionI18n[key].trim() || (
                              <span className="text-gray-300 italic">empty</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Form actions */}
              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelForm}
                  disabled={isSaving}
                >
                  <X size={13} className="mr-1" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  isLoading={isSaving}
                  disabled={!isFormValid || isSaving}
                >
                  <Check size={13} className="mr-1" />
                  {formMode === "add" ? `Create ${entityLabel}` : "Save Changes"}
                </Button>
              </div>
            </div>
          )}

          {/* ════ Right panel — idle empty state ════ */}
          {formMode === "idle" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 bg-gray-50/40">
              <div className="flex items-center gap-1.5">
                <Pencil size={16} className="opacity-30" />
                <span className="text-sm">Select an item to edit</span>
              </div>
              <p className="text-xs text-gray-300">or</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartAdd}
              >
                <Plus size={13} className="mr-1" />
                Add {entityLabel}
              </Button>
            </div>
          )}
        </div>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <ALConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        variant="delete"
        title={`Delete ${entityLabel}`}
        message={`Are you sure you want to delete "${deleteTarget?.valueName}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </>
  );
};

export default LookupManagerModal;
// LookupManagerModalProps is already exported via `export interface` above — no duplicate export needed.

// ─── Placeholder helpers ─────────────────────────────────────

function getNamePlaceholder(lang: Locale, entity: string): string {
  const map: Record<Locale, string> = {
    en: `e.g. ${entity === "Zone" ? "Garden" : "VIP"}`,
    vi: `ví dụ: ${entity === "Zone" ? "Vườn" : "VIP"}`,
    fr: `ex : ${entity === "Zone" ? "Jardin" : "VIP"}`,
  };
  return map[lang];
}

function getDescPlaceholder(lang: Locale): string {
  const map: Record<Locale, string> = {
    en: "Short description shown in dropdowns…",
    vi: "Mô tả ngắn hiển thị trong dropdown…",
    fr: "Courte description affichée dans les menus…",
  };
  return map[lang];
}
