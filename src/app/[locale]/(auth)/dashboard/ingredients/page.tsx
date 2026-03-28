"use client";

import React, { Suspense, useCallback, useMemo, useState, useRef, useEffect } from "react";
import { Loader2, Plus, AlertTriangle, Download, Upload } from "lucide-react";
import { useRouter } from "@/routing"
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { Button } from "@/components/ui/button";

import { useIngredientList } from "@/features/staff/ingredient-management/hooks/use-ingredient-list";
import { IngredientDto, SupplierBasicDto } from "@/features/staff/ingredient-management/types/ingredient-types";
import { IngredientActions } from "@/features/staff/ingredient-management/components/ingredient-actions";
import IngredientModal from "@/features/staff/ingredient-management/components/ingredient-modal";
import { AdjustStockModal } from "@/features/staff/ingredient-management/components/adjust-stock-modal";
import { ingredientService } from "@/features/staff/ingredient-management/services/ingredient-service";
import { format } from "date-fns";
import { listSupplierService } from "@/features/staff/supplier-management/supplier-list";
import { excelUtils } from "@/lib/excel-utils";
import {api} from "@/lib/http";
import {ApiResponse} from "@/types/api-response.types";

const IngredientListContent = () => {

    const t = useTranslations("Ingredient.List");
    const router = useRouter();

    const {
        ingredients,
        isLoading,
        totalCount,
        paginationInfo,
        onDataChange,
        refresh,
    } = useIngredientList();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<IngredientDto | null>(null);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isExportingAll, setIsExportingAll] = useState(false);

    const [availableSuppliers, setAvailableSuppliers] = useState<SupplierBasicDto[]>([]);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const res = await listSupplierService.getSuppliers({ pageIndex: 1, pageSize: 1000, search: "" });
                const mappedSuppliers: SupplierBasicDto[] = res.pageData.map((s: any) => ({
                    supplierId: s.supplierId || s.id,
                    supplierName: s.supplierName || s.name,
                    phone: s.phone,
                    email: s.email
                }));
                setAvailableSuppliers(mappedSuppliers);
            } catch (error) {
                console.error("Failed to fetch suppliers", error);
            }
        };
        fetchSuppliers();
    }, []);

    const handleCreate = () => {
        setModalMode("add");
        setSelectedIngredient(null);
        setIsCreateModalOpen(true);
    };

    const handleEdit = (item: IngredientDto) => {
        setModalMode("edit");
        setSelectedIngredient(item);
        setIsCreateModalOpen(true);
    };

    const handleAdjustStock = (item: IngredientDto) => {
        setSelectedIngredient(item);
        setIsAdjustModalOpen(true);
    };

    const handleHistory = (item: IngredientDto) => {
        router.push(`/dashboard/ingredients/${item.ingredientId}/history`);
    };

    const handleDelete = async (item: IngredientDto) => {
        if (!window.confirm(t("notifications.deleteConfirm", { name: item.ingredientName }))) return;
        try {
            await ingredientService.deleteIngredient(item.ingredientId);
            toast.success(t("notifications.deleteSuccess"));
            refresh();
        } catch (error: any) {
            toast.error(error.response?.data?.userMessage || t("notifications.deleteError"));
        }
    };

    const handleSaveIngredient = async (submitData: any) => {
        setIsSubmitting(true);
        try {
            if (modalMode === "add") {
                await ingredientService.createIngredient(submitData);
                toast.success(t("notifications.createSuccess"));
            } else if (selectedIngredient) {
                await ingredientService.updateIngredient(selectedIngredient.ingredientId, submitData);
                toast.success(t("notifications.updateSuccess"));
            }
            setIsCreateModalOpen(false);
            refresh();
        } catch (error: any) {
            toast.error(error.response?.data?.userMessage || t("notifications.actionError"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownloadTemplate = () => {
        const link = document.createElement("a");
        link.href = "/templates/ingredient_template.xlsx";
        link.download = "Ingredient_Import_Template.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = () => {
        if (!ingredients || ingredients.length === 0) {
            toast.error(t("notifications.noDataExport"));
            return;
        }
        excelUtils.exportToExcel(ingredients, `Ingredients_Page_${format(new Date(), "yyyyMMdd")}.xlsx`);
        toast.success(t("notifications.exportSuccess"));
    };

    const handleExportAll = async () => {
        setIsExportingAll(true);
        const toastId = toast.loading(t("notifications.exportingAll") || "Đang xuất toàn bộ dữ liệu...");
        try {
            const response = await api.get<ApiResponse<IngredientDto[]>>("/api/ingredients/all");

            const allData = response.data || [];

            if (!Array.isArray(allData) || allData.length === 0) {
                toast.error(t("notifications.noDataExport"), { id: toastId });
                return;
            }
            excelUtils.exportToExcel(allData, `All_Ingredients_${format(new Date(), "yyyyMMdd")}.xlsx`);
            toast.success(t("notifications.exportSuccess"), { id: toastId });
        } catch (error) {
            console.error("Export All Error:", error);
            toast.error(t("notifications.exportError") || "Lỗi khi xuất dữ liệu", { id: toastId });
        } finally {
            setIsExportingAll(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const rawData = await excelUtils.importFromExcel(file);
            const validRecords = rawData
                .map(excelUtils.mapExcelRowToRequest)
                .filter(req => req.ingredientName && req.ingredientName.trim() !== "");

            if (validRecords.length === 0) {
                toast.error(t("notifications.invalidExcel"));
                return;
            }

            let successCount = 0;
            for (const record of validRecords) {
                try {
                    await ingredientService.createIngredient(record);
                    successCount++;
                } catch (err) {
                    console.error(`Failed to import`, err);
                }
            }

            toast.success(t("notifications.importSuccess", { success: successCount, total: validRecords.length }));
            refresh();
        } catch (error) {
            toast.error(t("notifications.readExcelError"));
            console.error(error);
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const columns: TableColumn[] = useMemo(() => [
        {
            field: "ingredientName",
            header: t("table.ingredientName"),
            width: "250px",
            filterType: "text" as const,
            cellRender: ({ item }: { item: IngredientDto }) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.ingredientName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">IMG</div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 line-clamp-1">{item.ingredientName}</span>
                        <span className="text-xs text-gray-500">{t("table.unit")}: {item.unitName || "-"}</span>
                    </div>
                </div>
            ),
        },
        {
            field: "typeName",
            header: t("table.category"),
            width: "150px",
            cellRender: ({ value }: { value: string }) => (
                <span className="text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-md text-xs whitespace-nowrap">
                    {value || t("table.uncategorized")}
                </span>
            ),
        },
        {
            field: "suppliers",
            header: t("table.suppliers"),
            width: "200px",
            cellRender: ({ item }: { item: IngredientDto }) => (
                <div className="flex flex-wrap gap-1">
                    {item.suppliers && item.suppliers.length > 0 ? (
                        item.suppliers.map(s => (
                            <span key={s.supplierId} className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 whitespace-nowrap">
                                {s.supplierName}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-gray-400">-</span>
                    )}
                </div>
            ),
        },
        {
            field: "quantityOnHand",
            header: t("table.inStock"),
            align: "right" as const,
            width: "120px",
            cellRender: ({ item }: { item: IngredientDto }) => {
                const isLowStock = item.quantityOnHand <= item.minStockLevel;
                return (
                    <div className="flex flex-col items-end">
                        <span className={`font-bold text-sm ${isLowStock ? 'text-red-600' : 'text-emerald-600'}`}>
                            {item.quantityOnHand} <span className="text-xs font-normal text-gray-500">{item.unitName}</span>
                        </span>
                        {isLowStock && (
                            <span className="flex items-center text-[10px] text-red-500 font-medium mt-0.5 whitespace-nowrap">
                                <AlertTriangle className="w-3 h-3 mr-0.5" /> {t("table.lowStock")}
                            </span>
                        )}
                    </div>
                );
            },
        },
    ], [t]);

    const handleGlobalRenderCell = useCallback((value: any, item: any, column: TableColumn, rowIndex: number) => {
        const content = column.cellRender ? column.cellRender({ value, item, column, rowIndex }) : value;
        return column.align ? <div style={{ textAlign: column.align }}>{content}</div> : content;
    }, []);

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <BaseTable<IngredientDto>
                data={ingredients}
                loading={isLoading}
                columns={columns}
                rowKey="ingredientId"
                total={totalCount}
                onDataChange={onDataChange}
                onRefresh={refresh}
                searchPlaceholder={t("searchPlaceholder")}
                defaultRowsPerPage={10}
                rowsPerPageOptions={[10, 20, 50]}
                renderTitle={() => (
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center w-full gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                                {t("title")}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">{t("description")}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">

                            <Button variant="outline"  onClick={handleDownloadTemplate}>
                                <Download className="mr-2 h-4 w-4" /> Mẫu Import
                            </Button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                            />
                            <Button
                                variant="outline"
                                className="flex-1 md:flex-none shadow-sm bg-white whitespace-nowrap"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isImporting}
                            >
                                {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                {isImporting ? t("importing") : t("import")}
                            </Button>

                            <Button variant="outline" className="flex-1 md:flex-none shadow-sm bg-white whitespace-nowrap" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" /> {t("export")}
                            </Button>

                            <Button
                                variant="outline"
                                className="flex-1 md:flex-none shadow-sm bg-white whitespace-nowrap border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                                onClick={handleExportAll}
                                disabled={isExportingAll}
                            >
                                {isExportingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                Export All
                            </Button>

                            <Button
                                onClick={handleCreate} className="flex-1 md:flex-none shadow-md whitespace-nowrap bg-gray-900 text-white hover:bg-gray-800">
                                <Plus className="mr-2 h-4 w-4" /> {t("addNew")}
                            </Button>
                        </div>
                    </div>
                )}
                renderCell={handleGlobalRenderCell}
                renderActionColumn={(item) => (
                    <IngredientActions
                        ingredient={item}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAdjustStock={handleAdjustStock}
                        onHistory={handleHistory}
                    />
                )}
            />

            <IngredientModal
                isOpen={isCreateModalOpen}
                mode={modalMode}
                ingredient={selectedIngredient}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleSaveIngredient}
                isSubmitting={isSubmitting}
                availableSuppliers={availableSuppliers}
            />

            <AdjustStockModal
                isOpen={isAdjustModalOpen}
                ingredient={selectedIngredient}
                onClose={() => setIsAdjustModalOpen(false)}
                onSuccess={() => {
                    setIsAdjustModalOpen(false);
                    refresh();
                }}
            />
        </div>
    );
};

export default function IngredientListPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>}>
            <IngredientListContent />
        </Suspense>
    );
}