"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ALInput } from "@/components/ui/al-input";
import { ALCombobox } from "@/components/ui/al-combobox";
import { ALFileUploader } from "@/components/ui/al-file-uploader";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import type { IngredientDto, SaveIngredientRequest, SupplierBasicDto } from "../types/ingredient-types";
import { useLookupCrud, LookupCombobox } from "@/features/lookup";

interface IngredientModalProps {
    isOpen: boolean;
    mode: "add" | "edit";
    ingredient?: IngredientDto | null;
    onClose: () => void;
    onSubmit: (data: SaveIngredientRequest, pendingFiles: File[], removedImageIds: number[]) => void;
    isSubmitting?: boolean;
    availableSuppliers: SupplierBasicDto[];
}

export interface IngredientFormData {
    ingredientName: string;
    unit: string;
    typeLvId: number | "";
    minStockLevel: number;
    supplierIds: number[];
    images: any[];
}

const initialFormData: IngredientFormData = {
    ingredientName: "",
    unit: "kg",
    typeLvId: "",
    minStockLevel: 0,
    supplierIds: [],
    images: [],
};

const UNIT_OPTIONS = [
    { label: "Kilogram (kg)", value: "kg" },
    { label: "Gram (g)", value: "g" },
    { label: "Liter (l)", value: "l" },
    { label: "Milliliter (ml)", value: "ml" },
    { label: "Piece/Unit (cái/hộp)", value: "pcs" },
];

const IngredientModal: React.FC<IngredientModalProps> = ({
                                                             isOpen,
                                                             mode,
                                                             ingredient,
                                                             onClose,
                                                             onSubmit,
                                                             isSubmitting = false,
                                                             availableSuppliers = [],
                                                         }) => {
    const [formData, setFormData] = useState<IngredientFormData>(initialFormData);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);

    const typeLookup = useLookupCrud({
        baseUrl: "/api/ingredients/types",
        queryKey: ["ingredients", "types"],
        entityLabel: "Ingredient Type",
    });

    useEffect(() => {
        if (mode === "edit" && ingredient) {
            setFormData({
                ingredientName: ingredient.ingredientName,
                unit: ingredient.unit,
                typeLvId: ingredient.typeLvId || "",
                minStockLevel: ingredient.minStockLevel,
                supplierIds: ingredient.suppliers?.map(s => s.supplierId) || [],
                images: ingredient.imageId ? [{ mediaId: ingredient.imageId, url: ingredient.imageUrl }] : [],
            });
        } else {
            setFormData(initialFormData);
        }
        setPendingFiles([]);
        setRemovedImageIds([]);
    }, [mode, ingredient, isOpen]);

    const handleChange = (field: keyof IngredientFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddSupplier = (supplierIdStr: string) => {
        const supplierId = Number(supplierIdStr);
        if (supplierId && !formData.supplierIds.includes(supplierId)) {
            setFormData(prev => ({ ...prev, supplierIds: [...prev.supplierIds, supplierId] }));
        }
    };

    const handleRemoveSupplier = (supplierId: number) => {
        setFormData(prev => ({
            ...prev,
            supplierIds: prev.supplierIds.filter(id => id !== supplierId)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitData: SaveIngredientRequest = {
            ingredientName: formData.ingredientName,
            unit: formData.unit,
            typeLvId: formData.typeLvId ? Number(formData.typeLvId) : undefined,
            minStockLevel: Number(formData.minStockLevel),
            supplierIds: formData.supplierIds,
            imageId: formData.images.length > 0 ? formData.images[0].mediaId : null,
        };

        onSubmit(submitData, pendingFiles, removedImageIds);
    };

    const supplierOptions = availableSuppliers
        .filter(s => !formData.supplierIds.includes(s.supplierId))
        .map(s => ({
            label: s.supplierName,
            value: String(s.supplierId)
        }));

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            title={mode === "add" ? "Add New Ingredient" : "Edit Ingredient"}
            width="min(95vw, 660px)" // Responsive width cho Dialog
            footer={
                // Chuyển nút Hủy xuống dưới trên mobile, giãn đều trên desktop
                <div className="flex flex-col-reverse sm:flex-row items-center gap-3 w-full">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:flex-1"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="ingredient-form"
                        className="w-full sm:flex-1"
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                    >
                        {mode === "add" ? "Add Ingredient" : "Save Changes"}
                    </Button>
                </div>
            }
        >
            <form id="ingredient-form" onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto">
                <div className="space-y-4 md:space-y-5 p-4 md:p-5">
                    {/* RESPONSIVE: Name + Unit xếp chồng trên mobile (grid-cols-1), dàn hàng ngang trên md (grid-cols-3) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <ALInput
                                title="Ingredient Name"
                                required
                                placeholder="e.g. Wagyu Beef A5"
                                value={formData.ingredientName}
                                onChange={(e) => handleChange("ingredientName", e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <ALCombobox
                                title="Unit"
                                required
                                options={UNIT_OPTIONS}
                                value={formData.unit}
                                onChange={(val) => handleChange("unit", val)}
                                placeholder="Select unit"
                                searchable={true}
                            />
                        </div>
                    </div>

                    {/* RESPONSIVE: Type + Min Stock xếp chồng trên mobile, chia đôi trên máy tính */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LookupCombobox
                            lookup={typeLookup}
                            title="Category"
                            placeholder="Select category"
                            value={formData.typeLvId}
                            onChange={(val) => handleChange("typeLvId", val)}
                        />
                        <ALInput
                            title="Min Stock Level (Alert)"
                            required
                            type="number"
                            min={0}
                            step={0.1}
                            value={formData.minStockLevel}
                            onChange={(e) =>
                                handleChange("minStockLevel", parseFloat(e.target.value) || 0)
                            }
                        />
                    </div>

                    {/* Suppliers Section (Tag UI) */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <h5 className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                Suppliers
                            </h5>
                            <div className="grow border-t border-gray-100" />
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                            <div className="mb-3">
                                <ALCombobox
                                    title=""
                                    options={supplierOptions}
                                    value=""
                                    onChange={(val) => handleAddSupplier(val as string)}
                                    placeholder="Select to add a supplier..."
                                    searchable={true}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {formData.supplierIds.length === 0 && (
                                    <span className="text-sm text-gray-400 italic">No suppliers assigned yet.</span>
                                )}
                                {formData.supplierIds.map(id => {
                                    const supplier = availableSuppliers.find(s => s.supplierId === id);
                                    if (!supplier) return null;
                                    return (
                                        <div key={id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm">
                                            <span className="font-medium">{supplier.supplierName}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSupplier(id)}
                                                className="p-0.5 hover:bg-blue-200 rounded-full transition-colors text-blue-500 hover:text-blue-800"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Media Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <h5 className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                Image
                            </h5>
                            <div className="grow border-t border-gray-100" />
                        </div>

                        <ALFileUploader
                            existingFiles={(formData.images ?? []).map((img) => ({
                                id: img.mediaId,
                                url: img.url,
                                isPrimary: true,
                            }))}
                            onDeleteExisting={(id) => {
                                const numId = Number(id);
                                setRemovedImageIds((prev) => [...prev, numId]);
                                setFormData((prev) => ({
                                    ...prev,
                                    images: prev.images.filter((img) => img.mediaId !== numId),
                                }));
                            }}
                            deletingExistingId={null}
                            pendingFiles={pendingFiles}
                            onPendingChange={setPendingFiles}
                            isUploading={isSubmitting}
                            accept="image/*"
                            acceptHint={["PNG", "JPG", "WEBP"]}
                            maxFiles={1}
                            maxSizeBytes={5 * 1024 * 1024}
                            variant="image"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </form>
        </Dialog>
    );
};

export default IngredientModal;