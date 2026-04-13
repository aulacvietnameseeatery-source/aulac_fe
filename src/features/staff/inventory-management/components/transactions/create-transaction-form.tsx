"use client";

import React, { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALCard } from "@/components/ui/al-card";
import { ALInput } from "@/components/ui/al-input";
import { ALCombobox } from "@/components/ui/al-combobox";
import { ALFileUploader } from "@/components/ui/al-file-uploader";
import { useImageProcessing } from "@/hooks/use-image-processing";
import { LOOKUP_TYPE, useLookupCrud, LookupCombobox } from "@/features/lookup";
import { listSupplierService } from "@/features/staff/supplier-management/supplier-list/services/listSupplierService";
import { createSupplierService } from "@/features/staff/supplier-management/supplier-add/services/createSupplierService";
import { SupplierModal, type SupplierFormData } from "@/features/staff/supplier-management/components/supplier-modal";
import IngredientModal from "@/features/staff/ingredient-management/components/ingredient-modal";
import { ingredientService as ingredientMgmtService } from "@/features/staff/ingredient-management/services/ingredient-service";
import type { SaveIngredientRequest, SupplierBasicDto } from "@/features/staff/ingredient-management/types/ingredient-types";
import {
  useCreateTransactionMutation,
  useSubmitTransactionMutation,
  useInventoryItemsQuery,
} from "../../hooks/use-inventory-queries";
import { processInvoiceImage } from "../../services/invoice-scanner";
import type {
  CreateInventoryTransactionRequest,
  TransactionItemRequest,
} from "../../types/inventory.types";
import { InventoryTxTypeCode } from "@/types/status-codes";

interface ItemRow extends TransactionItemRequest {
  _key: string;
  _name?: string;
  _unitName?: string;
  _searchText?: string;
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
  const queryClient = useQueryClient();

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

  const [isTypeExpanded, setIsTypeExpanded] = useState(true);
  const [selectedTypeCode, setSelectedTypeCode] = useState<string>("");
  const [typeLvId, setTypeLvId] = useState<number | "">("");
  const [exportReasonLvId, setExportReasonLvId] = useState<number | "">("");
  const [supplierId, setSupplierId] = useState<number | "">("");
  const [stockCheckAreaNote, setStockCheckAreaNote] = useState("");
  const [note, setNote] = useState("");
  const [pendingEvidenceFiles, setPendingEvidenceFiles] = useState<File[]>([]);
  const { processFiles } = useImageProcessing();
  const [items, setItems] = useState<ItemRow[]>([]);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const aiUploadInputRef = useRef<HTMLInputElement | null>(null);

  // Freeform supplier search (AI may fill non-existing supplier name)
  const [supplierSearchText, setSupplierSearchText] = useState("");

  // Modal state for quick-add supplier
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [supplierModalPrefill, setSupplierModalPrefill] = useState<Partial<SupplierFormData>>({});
  const [aiSupplierPrefill, setAiSupplierPrefill] = useState<Partial<SupplierFormData>>({});
  const [isSubmittingSupplier, setIsSubmittingSupplier] = useState(false);

  // Modal state for quick-add ingredient
  const [ingredientModalOpen, setIngredientModalOpen] = useState(false);
  const [ingredientModalPrefillName, setIngredientModalPrefillName] = useState("");
  const [ingredientModalTargetKey, setIngredientModalTargetKey] = useState<string | null>(null);
  const [isSubmittingIngredient, setIsSubmittingIngredient] = useState(false);

  const [generatedTransactionCode] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `INV-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  });

  const isIN = selectedTypeCode === InventoryTxTypeCode.IN;
  const isOUT = selectedTypeCode === InventoryTxTypeCode.OUT;
  const isADJUST = selectedTypeCode === InventoryTxTypeCode.ADJUST;
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
  // useEffect(() => {
  //   if (!selectedTypeCode && txTypeLookup.items.length > 0) {
  //     const defaultType = txTypeLookup.items.find((lv) => lv.valueCode === InventoryTxTypeCode.IN);
  //     if (defaultType) {
  //       setSelectedTypeCode(defaultType.valueCode);
  //       setTypeLvId(defaultType.valueId);
  //     }
  //   }
  // }, [selectedTypeCode, txTypeLookup.items]);

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

  const grandTotal = useMemo(
    () => items.reduce((sum, row) => sum + (row.quantity || 0) * (row.unitPrice ?? 0), 0),
    [items],
  );

  const currentDate = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }, []);

  const canSubmit = typeLvId !== "" && items.length > 0 && items.every((i) => i.ingredientId > 0 && i.quantity > 0);

  // Supplier: has unresolved freeform text?
  const supplierUnmatched = supplierId === "" && supplierSearchText.trim().length > 0;

  const openSupplierModal = (prefill?: Partial<SupplierFormData>) => {
    setSupplierModalPrefill({
      ...aiSupplierPrefill,
      supplierName: supplierSearchText || aiSupplierPrefill.supplierName || "",
      ...prefill,
    });
    setSupplierModalOpen(true);
  };

  const handleSupplierModalSubmit = async (data: SupplierFormData) => {
    setIsSubmittingSupplier(true);
    try {
      const created = await createSupplierService.createSupplier({
        supplierName: data.supplierName.trim(),
        phone: data.phone.trim() || undefined,
        email: data.email.trim() || undefined,
        address: data.address.trim() || undefined,
        taxCode: data.taxCode.trim() || undefined,
        ingredientIds: data.ingredientIds,
      });
      await queryClient.invalidateQueries({ queryKey: ["inventory", "create", "suppliers"] });
      setSupplierId(created.supplierId);
      setSupplierSearchText("");
      setSupplierModalOpen(false);
      toast.success(`Đã tạo nhà cung cấp "${data.supplierName}"`);
    } catch {
      toast.error("Không thể tạo nhà cung cấp");
    } finally {
      setIsSubmittingSupplier(false);
    }
  };

  const openIngredientModal = (rowKey: string, prefillName: string) => {
    setIngredientModalTargetKey(rowKey);
    setIngredientModalPrefillName(prefillName);
    setIngredientModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleIngredientModalSubmit = async (data: SaveIngredientRequest, _pendingFiles: File[], _removedIds: number[]) => {
    setIsSubmittingIngredient(true);
    try {
      const created = await ingredientMgmtService.createIngredient(data);
      await queryClient.invalidateQueries({ queryKey: ["inventory", "items"] });
      // Update the row with the newly created ingredient
      if (ingredientModalTargetKey) {
        updateItem(ingredientModalTargetKey, {
          ingredientId: created.ingredientId,
          unitLvId: data.unitLvId,
          _name: created.ingredientName,
          _unitName: undefined,
          _searchText: undefined,
        });
      }
      setIngredientModalOpen(false);
      toast.success(`Đã tạo nguyên liệu "${created.ingredientName}"`);
    } catch {
      toast.error("Không thể tạo nguyên liệu");
    } finally {
      setIsSubmittingIngredient(false);
    }
  };

  // Available suppliers for ingredient modal
  const availableSuppliersForModal: SupplierBasicDto[] = useMemo(
    () =>
      (suppliersData?.pageData ?? []).map((s) => ({
        supplierId: s.supplierId,
        supplierName: s.supplierName,
        phone: s.phone,
        email: s.email,
      })),
    [suppliersData],
  );

  const openAiUpload = () => {
    if (!isIN || isAiAnalyzing) return;
    aiUploadInputRef.current?.click();
  };

  const handleAiUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file || !isIN) return;

    try {
      setIsAiAnalyzing(true);

      const result = await processInvoiceImage({
        imageFile: file,
        systemItems: inventoryItems,
      });

      const autoItems: ItemRow[] = result.items.map((line) => {
        const match = line.matchResult.bestMatch;
        const inv = match
          ? inventoryItems.find((x) => x.ingredientId === match.ingredientId)
          : null;
        return {
          _key: genKey(),
          ingredientId: match?.ingredientId ?? 0,
          quantity: line.extracted.quantity ?? 0,
          unitLvId: match?.unitLvId ?? 0,
          unitPrice: line.extracted.unit_price ?? undefined,
          note: [line.extracted.identifier, line.extracted.batch_number, line.extracted.item_name, line.extracted.notes]
            .filter(Boolean)
            .join(" | ") || undefined,
          _name: inv?.ingredientName ?? line.extracted.item_name ?? undefined,
          _unitName: inv?.unitName ?? line.extracted.unit ?? undefined,
          _searchText: match ? undefined : (line.extracted.item_name ?? undefined),
        };
      });

      if (autoItems.length > 0) {
        setItems((prev) => [...prev, ...autoItems]);
      }

      // Auto-fill supplier from AI header
      setAiSupplierPrefill({
        supplierName: result.header.supplier_name?.trim() || "",
        phone: result.header.supplier_phone?.trim() || "",
        address: result.header.supplier_address?.trim() || "",
        taxCode: result.header.supplier_tax_id?.trim() || "",
      });

      if (result.header.supplier_name && supplierId === "") {
        const supplierName = result.header.supplier_name.trim();
        const existingSupplier = (suppliersData?.pageData ?? []).find(
          (s) => s.supplierName.toLowerCase() === supplierName.toLowerCase()
        );
        if (existingSupplier) {
          setSupplierId(existingSupplier.supplierId);
          setSupplierSearchText("");
          toast.info(`Tự động chọn NCC: ${existingSupplier.supplierName}`);
        } else {
          setSupplierSearchText(supplierName);
        }
      }

      const lineErrors = result.items.flatMap((line) => line.validations).filter((v) => v.severity === "error").length;
      const lineWarnings = result.items.flatMap((line) => line.validations).filter((v) => v.severity === "warning").length;

      const matchedCount = autoItems.filter((i) => i.ingredientId > 0).length;
      const unmatchedCount = autoItems.length - matchedCount;

      if (autoItems.length > 0) {
        if (unmatchedCount > 0) {
          toast.warning(
            `AI đã điền ${autoItems.length} dòng, ${unmatchedCount} dòng chưa khớp hàng trong hệ thống.`,
            {
              description:
                (lineErrors > 0 || lineWarnings > 0
                  ? `${lineErrors} lỗi, ${lineWarnings} cảnh báo. `
                  : "") +
                "Vui lòng chọn mặt hàng thủ công cho các dòng chưa khớp.",
            },
          );
        } else {
          toast.success(
            `AI đã điền ${autoItems.length}/${result.items.length} dòng.`,
            {
              description:
                lineErrors > 0 || lineWarnings > 0
                  ? `${lineErrors} lỗi, ${lineWarnings} cảnh báo cần kiểm tra thủ công.`
                  : "Tất cả dữ liệu đã được phân tích và điền tự động.",
            },
          );
        }
      } else {
        toast.warning("AI không tìm thấy dòng nào để điền.", {
          description: "Vui lòng kiểm tra ảnh và thêm thủ công.",
        });
      }
    } catch {
      toast.error("Phân tích hóa đơn thất bại", {
        description: "Vui lòng thử lại với ảnh rõ hơn.",
      });
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const buildFormData = (): FormData => {
    const requestJson: CreateInventoryTransactionRequest = {
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
    };

    const fd = new FormData();
    fd.append("requestJson", JSON.stringify(requestJson));
    for (const file of pendingEvidenceFiles) {
      fd.append("evidenceFiles", file);
    }
    return fd;
  };

  const handleSaveDraft = () => {
    createMutation.mutate(buildFormData(), {
      onSuccess: () => router.push("/dashboard/inventory/transactions"),
    });
  };

  const handleSaveAndSubmit = () => {
    createMutation.mutate(buildFormData(), {
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
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border transition-all  ${selectedTypeCode === opt.code ? opt.selectedColor : opt.color
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
              {/* Row 1: code + supplier/reason + date + total */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-2.5">
                <div>
                  <ALInput title={t("transactionCode")} value={generatedTransactionCode} readOnly inputSize="sm" className="text-sm" />
                </div>
                <div>
                  <ALCombobox
                    title={t("import.supplier")}
                    options={supplierOptions}
                    value={supplierId === "" ? undefined : String(supplierId)}
                    onChange={(val) => {
                      setSupplierId(val ? Number(val) : "");
                      if (val) setSupplierSearchText("");
                    }}
                    placeholder={t("import.selectSupplier")}
                    searchable
                    clearable
                    inputSize="sm"
                    className="text-sm"
                    disabled={!isIN}
                    searchValue={supplierSearchText}
                    onSearchChange={setSupplierSearchText}
                    state={supplierUnmatched ? "error" : undefined}
                  />
                  {supplierUnmatched && (
                    <p className="text-xs text-red-500 mt-1">
                      Không tìm thấy NCC &quot;{supplierSearchText}&quot;. Chọn lại hoặc{" "}
                      <button
                        type="button"
                        className="underline font-medium hover:text-red-700"
                        onClick={() => openSupplierModal()}
                      >
                        thêm mới ngay
                      </button>
                    </p>
                  )}
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
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#1A3A52]/60">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span className="font-medium">{t("date")}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#1A3A52]">{currentDate}</span>
                  {isIN && grandTotal > 0 && (
                    <div className="mt-1 text-sm">
                      <span className="text-[#1A3A52]/50">{t("grandTotal")}: </span>
                      <span className="text-base font-bold text-[#1A3A52]">{grandTotal.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}</span>
                    </div>
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
            acceptHint={["PNG", "JPG", "WEBP", "HEIC"]}
            maxFiles={4}
            maxSizeBytes={5 * 1024 * 1024}
            variant="image"
            imagePerRow={4}
            processFiles={processFiles}
          />
        </ALCard>
      </div>

      <ALCard variant="default" padding="none" elevation="sm" radius="xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5BA98]/20">
          <h2 className="text-base font-semibold text-[#1A3A52]">{t("items.title")}</h2>
          <div className="flex items-center gap-2">
            {isIN && (
              <>
                <input
                  ref={aiUploadInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAiUploadChange}
                />
                <Button
                  size="sm"
                  variant="translate"
                  onClick={openAiUpload}
                  disabled={isAiAnalyzing}
                  className="border-[#1A3A52]/30 text-[#1A3A52]"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {isAiAnalyzing ? "AI đang phân tích..." : "AI phân tích hóa đơn"}
                </Button>
              </>
            )}

            <Button size="sm" onClick={addItem} className="bg-[#1A3A52] text-white hover:bg-[#1A3A52]/90">
              <Plus className="h-4 w-4 mr-1" />
              {t("items.addItem")}
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="px-5 py-6 text-center text-sm text-[#1A3A52]/40">{t("items.noItems")}</div>
        ) : (
          <div className="divide-y divide-[#D5BA98]/10 max-h-[40vh] overflow-y-auto">
            {items.map((row) => {
              const ingredientUnmatched = row.ingredientId === 0 && (row._searchText ?? "").trim().length > 0;
              return (
              <div key={row._key} className={`px-4 sm:px-5 py-3 ${row.ingredientId === 0 && row._searchText ? "bg-amber-50/50" : ""}`}>
                <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,2fr)_auto] gap-x-2 gap-y-1 items-end">
                  <div>
                    <ALCombobox
                      title={t("items.selectItem")}
                      options={ingredientOptions}
                      value={row.ingredientId > 0 ? String(row.ingredientId) : undefined}
                      onChange={(val) => {
                        selectInventoryItem(row._key, Number(val));
                        if (val) updateItem(row._key, { _searchText: undefined });
                      }}
                      placeholder={t("items.selectItem")}
                      searchable
                      clearable
                      allowCreate
                      onCreateOption={(inputValue) => {
                        updateItem(row._key, {
                          ingredientId: 0,
                          unitLvId: 0,
                          _name: undefined,
                          _unitName: undefined,
                          _searchText: inputValue,
                        });
                        openIngredientModal(row._key, inputValue);
                      }}
                      inputSize="sm"
                      searchValue={row._searchText ?? ""}
                      onSearchChange={(v) => updateItem(row._key, { _searchText: v })}
                      state={ingredientUnmatched ? "error" : undefined}
                    />
                    {ingredientUnmatched && (
                      <p className="text-xs text-red-500 mt-0.5">
                        Không tìm thấy &quot;{row._searchText}&quot;. Chọn lại hoặc{" "}
                        <button
                          type="button"
                          className="underline font-medium hover:text-red-700"
                          onClick={() => openIngredientModal(row._key, row._searchText ?? "")}
                        >
                          thêm mới ngay
                        </button>
                      </p>
                    )}
                  </div>

                  <div>
                    <ALInput
                      title={t("items.quantity")}
                      type="number"
                      inputSize="sm"
                      step="0.001"
                      numberDecimalScale={3}
                      min={0}
                      value={row.quantity || ""}
                      onChange={(e) => updateItem(row._key, { quantity: Number(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <ALInput title={t("items.unit")} value={row._unitName ?? "-"} readOnly inputSize="sm" />
                  </div>

                  <div>
                    <ALInput
                      title={t("items.unitPrice")}
                      type="number"
                      inputSize="sm"
                      step="0.01"
                      numberDecimalScale={2}
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

                  <div>
                    <div className="text-xs text-[#1A3A52]/50 mb-1">{t("items.subtotal")}</div>
                    <div className="h-9 flex items-center text-sm font-medium text-[#1A3A52] tabular-nums">
                      {row.quantity > 0 && row.unitPrice
                        ? (row.quantity * row.unitPrice).toLocaleString("vi-VN", { maximumFractionDigits: 2 })
                        : "—"}
                    </div>
                  </div>

                  <div>
                    <ALInput
                      title={t("items.note")}
                      inputSize="sm"
                      value={row.note ?? ""}
                      onChange={(e) => updateItem(row._key, { note: e.target.value })}
                      maxLength={255}
                    />
                  </div>

                  <div className="flex justify-end items-end">
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
              );
            })}
          </div>
        )}

        {isIN && items.length > 0 && grandTotal > 0 && (
          <div className="flex items-center justify-end px-5 py-3 border-t border-[#D5BA98]/20 bg-[#FDFBF9]/50">
            <div className="text-base">
              <span className="text-[#1A3A52]/60 mr-2">{t("grandTotal")}:</span>
              <span className="text-xl font-bold text-[#1A3A52] tabular-nums">
                {grandTotal.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}
              </span>
            </div>
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

      {/* --- Quick-add Supplier Modal --- */}
      <SupplierModal
        isOpen={supplierModalOpen}
        mode="add"
        onClose={() => setSupplierModalOpen(false)}
        onSubmit={handleSupplierModalSubmit}
        isSubmitting={isSubmittingSupplier}
        supplier={{
          supplierId: 0,
          supplierName: supplierModalPrefill.supplierName ?? "",
          phone: supplierModalPrefill.phone ?? "",
          email: supplierModalPrefill.email ?? "",
          address: supplierModalPrefill.address ?? "",
          taxCode: supplierModalPrefill.taxCode ?? "",
          ingredientIds: [],
          ingredients: [],
          isActive: true,
          createdAt: "",
          updatedAt: "",
        } as any}
      />

      {/* --- Quick-add Ingredient Modal --- */}
      <IngredientModal
        isOpen={ingredientModalOpen}
        mode="add"
        onClose={() => setIngredientModalOpen(false)}
        onSubmit={handleIngredientModalSubmit}
        isSubmitting={isSubmittingIngredient}
        availableSuppliers={availableSuppliersForModal}
        ingredient={{
          ingredientId: 0,
          ingredientName: ingredientModalPrefillName,
          unitLvId: 0,
          unitName: "",
          typeLvId: 0,
          typeName: "",
          minStockLevel: 0,
          currentStock: 0,
          suppliers: [],
          images: [],
          isActive: true,
        } as any}
      />
    </div>
  );
}
