"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ALInput } from "@/components/ui/al-input";
import { ALCombobox } from "@/components/ui/al-combobox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Supplier, Ingredient } from "../supplier-edit/types";
import { ingredientService, Ingredient as IngredientSimple } from "../supplier-add/services/ingredientService";

interface SupplierModalProps {
    isOpen: boolean;
    mode: "add" | "edit" | "view";
    supplier?: Supplier | null;
    onClose: () => void;
    onSubmit: (data: SupplierFormData) => void;
    isSubmitting?: boolean;
}

export interface SupplierFormData {
    supplierName: string;
    phone: string;
    email: string;
    ingredientIds: number[];
}

const initialFormData: SupplierFormData = {
    supplierName: "",
    phone: "",
    email: "",
    ingredientIds: [],
};

export const SupplierModal: React.FC<SupplierModalProps> = ({
    isOpen,
    mode,
    supplier,
    onClose,
    onSubmit,
    isSubmitting = false,
}) => {
    const t = useTranslations(mode === "add" ? "Supplier.Add" : mode === "edit" ? "Supplier.Edit" : "Supplier.Detail");
    const tCommon = useTranslations("Supplier");
    
    const [formData, setFormData] = useState<SupplierFormData>(initialFormData);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [availableIngredients, setAvailableIngredients] = useState<IngredientSimple[]>([]);
    const [isLoadingIngredients, setIsLoadingIngredients] = useState(true);

    // Load ingredients
    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                setIsLoadingIngredients(true);
                const data = await ingredientService.getAllIngredients();
                setAvailableIngredients(data);
            } catch (error) {
                console.error("Failed to load ingredients:", error);
            } finally {
                setIsLoadingIngredients(false);
            }
        };
        if (isOpen) {
            fetchIngredients();
        }
    }, [isOpen]);

    // Initialize form data
    useEffect(() => {
        if (mode === "edit" && supplier) {
            setFormData({
                supplierName: supplier.supplierName,
                phone: supplier.phone || "",
                email: supplier.email || "",
                ingredientIds: supplier.ingredients?.map((i: Ingredient) => i.ingredientId) || [],
            });
        } else if (mode === "view" && supplier) {
            setFormData({
                supplierName: supplier.supplierName,
                phone: supplier.phone || "",
                email: supplier.email || "",
                ingredientIds: supplier.ingredients?.map((i: Ingredient) => i.ingredientId) || [],
            });
        } else {
            setFormData(initialFormData);
        }
        setErrors({});
    }, [mode, supplier, isOpen]);

    const handleChange = (field: keyof SupplierFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.supplierName.trim()) {
            newErrors.supplierName = t("validation.nameRequired");
        } else if (formData.supplierName.length > 200) {
            newErrors.supplierName = t("validation.nameMaxLength");
        }

        if (formData.phone) {
            if (formData.phone.length > 50) {
                newErrors.phone = t("validation.phoneMaxLength");
            } else if (!/^\d+$/.test(formData.phone.trim())) {
                newErrors.phone = t("validation.phoneInvalid");
            }
        }

        if (formData.email) {
            if (formData.email.length > 150) {
                newErrors.email = t("validation.emailMaxLength");
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = t("validation.emailInvalid");
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode === "view") {
            onClose();
            return;
        }

        if (!validateForm()) {
            return;
        }

        onSubmit(formData);
    };

    const handleToggleIngredient = (ingredientId: number) => {
        if (mode === "view") return;

        if (formData.ingredientIds.includes(ingredientId)) {
            setFormData(prev => ({
                ...prev,
                ingredientIds: prev.ingredientIds.filter(id => id !== ingredientId)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                ingredientIds: [...prev.ingredientIds, ingredientId]
            }));
        }
    };

    // Get selected ingredients data
    const selectedIngredients = availableIngredients.filter(ing =>
        formData.ingredientIds.includes(ing.ingredientId)
    );

    const getTitle = () => {
        if (mode === "add") return t("title");
        if (mode === "edit") return t("title");
        return t("title");
    };

    const isViewMode = mode === "view";

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            title={getTitle()}
            width="660px"
            footer={
                <div className="flex items-center gap-3 w-full">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={onClose}
                        disabled={isSubmitting && !isViewMode}
                    >
                        {isViewMode ? tCommon("close") || "Close" : t("cancel")}
                    </Button>
                    {!isViewMode && (
                        <Button
                            type="submit"
                            form="supplier-form"
                            variant="primary"
                            className="w-full"
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                        >
                            {mode === "add" ? t("saveButton") : t("saveButton")}
                        </Button>
                    )}
                </div>
            }
        >
            <form id="supplier-form" onSubmit={handleSubmit}>
                <div className="space-y-5 p-5">
                    {/* Supplier Name */}
                    <ALInput
                        title={t("supplierName")}
                        required={!isViewMode}
                        placeholder={isViewMode ? "" : t("supplierNamePlaceholder")}
                        value={formData.supplierName}
                        onChange={(e) => handleChange("supplierName", e.target.value)}
                        error={errors.supplierName}
                        disabled={isViewMode}
                    />

                    {/* Phone & Email row */}
                    <div className="grid grid-cols-2 gap-4">
                        <ALInput
                            title={t("phone")}
                            placeholder={isViewMode ? "" : t("phonePlaceholder")}
                            value={formData.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            error={errors.phone}
                            disabled={isViewMode}
                        />
                        <ALInput
                            title={t("email")}
                            type="email"
                            placeholder={isViewMode ? "" : t("emailPlaceholder")}
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            error={errors.email}
                            disabled={isViewMode}
                        />
                    </div>

                    {/* Ingredients Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                {t("ingredients")}
                            </h5>
                            <div className="grow border-t border-gray-100" />
                        </div>

                        {isLoadingIngredients ? (
                            <div className="text-sm text-gray-500 p-4">Loading ingredients...</div>
                        ) : (
                            <>
                                {!isViewMode && (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-60 overflow-y-auto">
                                        {availableIngredients.length === 0 ? (
                                            <div className="text-sm text-gray-500">No ingredients available</div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {availableIngredients.map((ingredient) => (
                                                    <label
                                                        key={ingredient.ingredientId}
                                                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.ingredientIds.includes(ingredient.ingredientId)}
                                                            onChange={() => handleToggleIngredient(ingredient.ingredientId)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-700">
                                                            {ingredient.ingredientName} ({ingredient.unit})
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Display selected ingredients as badges */}
                                {(isViewMode || formData.ingredientIds.length > 0) && (
                                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        {selectedIngredients.length === 0 ? (
                                            <span className="text-sm text-gray-400 italic">No ingredients assigned yet.</span>
                                        ) : (
                                            selectedIngredients.map(ingredient => (
                                                <div 
                                                    key={ingredient.ingredientId} 
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm"
                                                >
                                                    <span className="font-medium">
                                                        {ingredient.ingredientName} ({ingredient.unit})
                                                    </span>
                                                    {!isViewMode && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleIngredient(ingredient.ingredientId)}
                                                            className="p-0.5 hover:bg-blue-200 rounded-full transition-colors text-blue-500 hover:text-blue-800"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </form>
        </Dialog>
    );
};
