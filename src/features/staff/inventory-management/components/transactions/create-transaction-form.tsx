"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing"
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALCard } from "@/components/ui/al-card";
import { ALInput } from "@/components/ui/al-input";
import { ALCombobox } from "@/components/ui/al-combobox";
import { ALFileUploader } from "@/components/ui/al-file-uploader";
import { LOOKUP_TYPE, useLookupCrud, LookupCombobox } from "@/features/lookup";
import { listSupplierService } from "@/features/staff/supplier-management/supplier-list/services/listSupplierService";
import {
  useCreateTransactionMutation,
  useSubmitTransactionMutation,
  useInventoryItemsQuery,
} from "../../hooks/use-inventory-queries";
import type {
  CreateInventoryTransactionRequest,
  TransactionItemRequest,
} from "../../types/inventory.types";
import { InventoryTxTypeCode } from "@/types/status-codes";

interface ItemRow extends TransactionItemRequest {
  _key: string;
  _name?: string;
  _unitName?: string;
}

const TYPE_OPTIONS = [
  {
    code: InventoryTxTypeCode.IN,
    i18nKey: "import",
    icon: <ArrowDownCircle className="h-4 w-4" />,
    color: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    selectedColor: "border-emerald-500 bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
  },
  {
    code: InventoryTxTypeCode.OUT,
    i18nKey: "export",
    icon: <ArrowUpCircle className="h-4 w-4" />,
    color: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
    selectedColor: "border-red-500 bg-red-100 text-red-800 ring-1 ring-red-300",
  },
  {
    code: InventoryTxTypeCode.ADJUST,
    i18nKey: "stockCheck",
    icon: <RefreshCw className="h-4 w-4" />,
    color: "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100",
    selectedColor: "border-blue-500 bg-blue-100 text-blue-800 ring-1 ring-blue-300",
  },
] as const;

let _counter = 0;
function genKey() {
  return `item_${++_counter}`;
}

export function CreateTransactionForm() {
  const t = useTranslations("inventory.create");
  const tCommon = useTranslations("inventory.common");
  const router = useRouter();

  const txTypeLookup = useLookupCrud({
    typeId: LOOKUP_TYPE.InventoryTxType,
    queryKey: ["lookups", "inv-tx-type"],
    entityLabel: "Transaction Type",
  });
  const exportReasonLookup = useLookupCrud({
    typeId: LOOKUP_TYPE.ExportReason,
    queryKey: ["lookups", "export-reason"],
    entityLabel: "Export Reason",
  });

  const { data: itemsData } = useInventoryItemsQuery({ pageSize: 500 });
  const inventoryItems = useMemo(() => itemsData?.pageData ?? [], [itemsData]);
  const ingredientOptions = useMemo(
    () =>
      inventoryItems.map((inv) => ({
        label: `${inv.ingredientName} (${inv.unitName ?? "?"})`,
        value: String(inv.ingredientId),
      })),
    [inventoryItems],
  );

  const { data: suppliersData } = useQuery({
    queryKey: ["inventory", "create", "suppliers"],
    queryFn: () => listSupplierService.getSuppliers({ pageIndex: 1, pageSize: 200 }),
  });
  const supplierOptions = useMemo(
    () =>
      (suppliersData?.pageData ?? []).map((s) => ({
        label: s.supplierName,
        value: String(s.supplierId),
      })),
    [suppliersData],
  );

  const createMutation = useCreateTransactionMutation();
  const submitMutation = useSubmitTransactionMutation();

  const [isTypeExpanded, setIsTypeExpanded] = useState(false);
  const [selectedTypeCode, setSelectedTypeCode] = useState<string>("");
  const [typeLvId, setTypeLvId] = useState<number | "">("");
  const [exportReasonLvId, setExportReasonLvId] = useState<number | "">("");
  const [supplierId, setSupplierId] = useState<number | "">("");
  const [stockCheckAreaNote, setStockCheckAreaNote] = useState("");
  const [note, setNote] = useState("");
  const [pendingEvidenceFiles, setPendingEvidenceFiles] = useState<File[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);

  const [generatedTransactionCode] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `INV-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  });

  const isIN = selectedTypeCode === InventoryTxTypeCode.IN;
  const isOUT = selectedTypeCode === InventoryTxTypeCode.OUT;
  const isADJUST = selectedTypeCode === InventoryTxTypeCode.ADJUST;

  // _OLD: typeComboboxOptions was used by the old ALCombobox type selector — now replaced by inline type cards
  // const typeComboboxOptions = useMemo(
  //   () =>
  //     TYPE_OPTIONS.map((opt) => ({
  //       label: t(`${opt.i18nKey}.title`),
  //       value: opt.code,
  //     })),
  //   [t],
  // );

  const selectedTypeOption = useMemo(
    () => TYPE_OPTIONS.find((opt) => opt.code === selectedTypeCode),
    [selectedTypeCode],
  );

  useEffect(() => {
    if (!selectedTypeCode && txTypeLookup.items.length > 0) {
      const defaultType = txTypeLookup.items.find((lv) => lv.valueCode === InventoryTxTypeCode.IN);
      if (defaultType) {
        setSelectedTypeCode(defaultType.valueCode);
        setTypeLvId(defaultType.valueId);
      }
    }
  }, [selectedTypeCode, txTypeLookup.items]);

  const handleTypeSelect = (code: string) => {
    setSelectedTypeCode(code);
    const match = txTypeLookup.items.find((lv) => lv.valueCode === code);
    setTypeLvId(match?.valueId ?? "");
    setExportReasonLvId("");
    setStockCheckAreaNote("");
    setItems([]);
    setIsTypeExpanded(false);
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { _key: genKey(), ingredientId: 0, quantity: 0, unitLvId: 0 },
    ]);
  };

  const updateItem = (key: string, patch: Partial<ItemRow>) => {
    setItems((prev) => prev.map((row) => (row._key === key ? { ...row, ...patch } : row)));
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((row) => row._key !== key));
  };

  const selectInventoryItem = (key: string, ingredientId: number) => {
    const inv = inventoryItems.find((i) => i.ingredientId === ingredientId);
    if (!inv) return;
    updateItem(key, {
      ingredientId,
      unitLvId: inv.unitLvId,
      _name: inv.ingredientName,
      _unitName: inv.unitName ?? undefined,
    });
  };

  const canSubmit = typeLvId !== "" && items.length > 0 && items.every((i) => i.ingredientId > 0 && i.quantity > 0);

  const buildRequest = (): CreateInventoryTransactionRequest => ({
    typeLvId: typeLvId as number,
    exportReasonLvId: isOUT && exportReasonLvId !== "" ? (exportReasonLvId as number) : undefined,
    supplierId: isIN && supplierId !== "" ? supplierId : undefined,
    stockCheckAreaNote: isADJUST && stockCheckAreaNote ? stockCheckAreaNote : undefined,
    note: note || undefined,
    items: items.map(({ ingredientId, quantity, unitLvId, unitPrice, note: itemNote }) => ({
      ingredientId,
      quantity,
      unitLvId,
      unitPrice: unitPrice ?? undefined,
      note: itemNote ?? undefined,
    })),
  });

  const handleSaveDraft = () => {
    createMutation.mutate(buildRequest(), {
      onSuccess: () => router.push("/dashboard/inventory/transactions"),
    });
  };

  const handleSaveAndSubmit = () => {
    createMutation.mutate(buildRequest(), {
      onSuccess: (data) => {
        submitMutation.mutate(
          { id: data.transactionId },
          { onSuccess: () => router.push("/dashboard/inventory/transactions") },
        );
      },
    });
  };

  return (
    <div className="w-full space-y-4">
      <ALCard variant="default" padding="sm" elevation="sm" radius="xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-[#D5BA98]/10">
            <ArrowLeft className="h-5 w-5 text-[#1A3A52]/70" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-[#1A3A52] font-['Cormorant_Garamond']">{t("title")}</h1>
            <p className="text-sm text-[#1A3A52]/50">{t("description")}</p>
          </div>
        </div>
      </ALCard>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-stretch">
        {/* --- Transaction Type Card: collapsed = full-card selected display; expanded = choose type --- */}
        <ALCard variant="default" padding="sm" elevation="sm" radius="xl" className="xl:col-span-1">
          {isTypeExpanded ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#1A3A52]/60 mb-3">{t("selectType")}</p>
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => handleTypeSelect(opt.code)}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${selectedTypeCode === opt.code ? opt.selectedColor : opt.color
                    }`}
                >
                  {opt.icon}
                  <div className="text-left">
                    <span className="text-xs font-semibold block">{t(`${opt.i18nKey}.title`)}</span>
                    <span className="text-[10px] opacity-80 block">{t(`${opt.i18nKey}.description`)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsTypeExpanded(true)}
              className="w-full h-full flex flex-col items-center justify-center rounded-lg group transition-colors hover:bg-[#D5BA98]/5"
            >
              {selectedTypeOption ? (
                <div className={`w-full h-full justify-center flex flex-col items-center gap-2 p-4 rounded-lg border ${selectedTypeOption.selectedColor}`}>
                  <div className="flex items-center gap-2">
                    {selectedTypeOption.icon}
                    <span className="text-sm font-semibold">{t(`${selectedTypeOption.i18nKey}.title`)}</span>
                  </div>
                  <span className="text-[11px] opacity-70 text-center">{t(`${selectedTypeOption.i18nKey}.description`)}</span>
                  <span className="text-[10px] opacity-40 mt-1">{t("clickToChange")}</span>
                </div>
              ) : (
                <span className="text-sm text-[#1A3A52]/40">{t("selectType")}</span>
              )}
            </button>
          )}
        </ALCard>

        {/* --- Details Card: Row 1 = Code + Supplier + Conditional | Row 2 = Note + Evidence --- */}
        <ALCard variant="default" padding="sm" elevation="sm" radius="xl" className="xl:col-span-2 h-full">
          <div className=" gap-3 items-stretch">
            <div className="xl:col-span-8 space-y-3 flex flex-col">
              {/* Row 1: one line */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
                <div>
                  <ALInput title={t("transactionCode")} value={generatedTransactionCode} readOnly inputSize="sm" className="text-sm" />
                </div>
                <div>
                  <ALCombobox
                    title={t("import.supplier")}
                    options={supplierOptions}
                    value={supplierId === "" ? undefined : String(supplierId)}
                    onChange={(val) => setSupplierId(val ? Number(val) : "")}
                    placeholder={t("import.selectSupplier")}
                    searchable
                    inputSize="sm"
                    className="text-sm"
                    disabled={!isIN}
                  />
                </div>
                <div>
                  {isOUT ? (
                    <LookupCombobox
                      lookup={exportReasonLookup}
                      title={t("export.reason")}
                      required
                      placeholder={t("export.selectReason")}
                      inputSize="sm"
                      comboboxClassName="text-sm"
                      value={exportReasonLvId}
                      onChange={(val) => setExportReasonLvId(val as number | "")}
                    />
                  ) : isADJUST ? (
                    <ALInput
                      title={t("stockCheck.area")}
                      value={stockCheckAreaNote}
                      onChange={(e) => setStockCheckAreaNote(e.target.value)}
                      placeholder={t("stockCheck.areaPlaceholder")}
                      inputSize="sm"
                      maxLength={500}
                    />
                  ) : (
                    <div />
                  )}
                </div>
              </div>

              <div className="flex flex-col flex-1">
                <ALInput
                  title={t("note")}
                  fieldVariant="textarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t("notePlaceholder")}
                  maxLength={500}
                  textareaRows={6}
                  inputSize="sm"
                  wrapperClassName="flex-1"
                  textareaClassName="min-h-24 h-24 resize-none text-sm"
                />
              </div>
            </div>
          </div>
        </ALCard>
        <ALCard variant="default" padding="sm" elevation="sm" radius="xl" className="xl:col-span-1">
          <ALFileUploader
            className="w-full h-full self-stretch"
            title={t("evidenceTitle")}
            existingFiles={[]}
            pendingFiles={pendingEvidenceFiles}
            onPendingChange={setPendingEvidenceFiles}
            isUploading={false}
            accept="image/*"
            acceptHint={["PNG", "JPG", "WEBP"]}
            maxFiles={4}
            maxSizeBytes={5 * 1024 * 1024}
            variant="image"
            imagePerRow={4}
          />
        </ALCard>
      </div>

      <ALCard variant="default" padding="none" elevation="sm" radius="xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5BA98]/20">
          <h2 className="text-base font-semibold text-[#1A3A52]">{t("items.title")}</h2>
          <Button size="sm" onClick={addItem} className="bg-[#1A3A52] text-white hover:bg-[#1A3A52]/90">
            <Plus className="h-4 w-4 mr-1" />
            {t("items.addItem")}
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="px-5 py-6 text-center text-sm text-[#1A3A52]/40">{t("items.noItems")}</div>
        ) : (
          <div className="divide-y divide-[#D5BA98]/10 max-h-[40vh] overflow-y-auto">
            {items.map((row) => (
              <div key={row._key} className="px-4 sm:px-5 py-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                  <div className="sm:col-span-4">
                    <ALCombobox
                      title={t("items.selectItem")}
                      options={ingredientOptions}
                      value={row.ingredientId > 0 ? String(row.ingredientId) : undefined}
                      onChange={(val) => selectInventoryItem(row._key, Number(val))}
                      placeholder={t("items.selectItem")}
                      searchable
                      inputSize="sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <ALInput
                      title={t("items.quantity")}
                      type="number"
                      inputSize="sm"
                      step="0.001"
                      min={0}
                      value={row.quantity || ""}
                      onChange={(e) => updateItem(row._key, { quantity: Number(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <ALInput title={t("items.unit")} value={row._unitName ?? "-"} readOnly inputSize="sm" />
                  </div>

                  <div className="sm:col-span-2">
                    <ALInput
                      title={t("items.unitPrice")}
                      type="number"
                      inputSize="sm"
                      step="0.01"
                      min={0}
                      value={row.unitPrice ?? ""}
                      onChange={(e) =>
                        updateItem(row._key, {
                          unitPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      disabled={!isIN}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <ALInput
                      title={t("items.note")}
                      inputSize="sm"
                      value={row.note ?? ""}
                      onChange={(e) => updateItem(row._key, { note: e.target.value })}
                      maxLength={255}
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeItem(row._key)}
                      className="h-9 w-9 p-0 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ALCard>

      <div className="flex items-center justify-end gap-2.5 flex-wrap">
        <Button variant="outline" onClick={() => router.back()} className="border-[#D5BA98]/50 text-[#1A3A52]/70">
          {tCommon("cancel")}
        </Button>
        <Button
          onClick={handleSaveDraft}
          disabled={!canSubmit}
          isLoading={createMutation.isPending}
          variant="outline"
          className="border-[#1A3A52]/30 text-[#1A3A52]"
        >
          {t("saveAsDraft")}
        </Button>
        <Button
          onClick={handleSaveAndSubmit}
          disabled={!canSubmit}
          isLoading={createMutation.isPending || submitMutation.isPending}
          className="bg-[#1A3A52] text-white hover:bg-[#1A3A52]/90"
        >
          {t("saveAndSubmit")}
        </Button>
      </div>
    </div>
  );
}
