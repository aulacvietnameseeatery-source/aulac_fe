"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ALInput } from "@/components/ui/al-input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";

import type { DishCategory } from "../types";

interface DishCategoryModalProps {
    isOpen: boolean;
    mode: "add" | "edit";
    category?: DishCategory | null;
    onClose: () => void;
    onSubmit: (data: SaveCategoryRequest) => void;
    isSubmitting?: boolean;
}

export interface SaveCategoryRequest {
    categoryName: string;
    description?: string;
    isDisabled: boolean;
}

export interface CategoryFormData {
    categoryName: string;
    description: string;
    isDisabled: boolean;
}

const initialFormData: CategoryFormData = {
    categoryName: "",
    description: "",
    isDisabled: false,
};

const DishCategoryModal: React.FC<DishCategoryModalProps> = ({
    isOpen,
    mode,
    category,
    onClose,
    onSubmit,
    isSubmitting = false,
}) => {
    const t = useTranslations("DishCategory");
    const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (mode === "edit" && category) {
            setFormData({
                categoryName: category.categoryName,
                description: category.description || "",
                isDisabled: category.isDisabled,
            });
        } else {
            setFormData(initialFormData);
        }
        setErrors({});
    }, [mode, category, isOpen]);

    const handleChange = (field: keyof CategoryFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.categoryName.trim()) {
            newErrors.categoryName = t("Add.validation.nameRequired");
        } else if (formData.categoryName.length > 100) {
            newErrors.categoryName = t("Add.validation.nameMaxLength");
        }

        if (formData.description && formData.description.length > 100) {
            newErrors.description = t("Add.validation.descriptionMaxLength");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submitData: SaveCategoryRequest = {
            categoryName: formData.categoryName.trim(),
            description: formData.description.trim() || undefined,
            isDisabled: formData.isDisabled,
        };

        onSubmit(submitData);
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            title={mode === "add" ? t("Add.title") : t("Edit.title")}
            width="600px"
            footer={
                <div className="flex items-center gap-3 w-full">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        {t("List.cancel")}
                    </Button>
                    <Button
                        type="submit"
                        form="category-form"
                        variant="primary"
                        className="w-full"
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                    >
                        {mode === "add" ? t("Add.saveButton") : t("Edit.saveButton")}
                    </Button>
                </div>
            }
        >
            <form id="category-form" onSubmit={handleSubmit}>
                <div className="space-y-5 p-5">
                    {/* Category Name */}
                    <ALInput
                        title={t("Add.categoryName")}
                        required
                        placeholder={t("Add.categoryNamePlaceholder")}
                        value={formData.categoryName}
                        onChange={(e) => handleChange("categoryName", e.target.value)}
                        error={errors.categoryName}
                    />

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            {t("Add.description")}
                        </label>
                        <textarea
                            className={`w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.description ? "border-red-500" : "border-gray-300"
                            }`}
                            rows={3}
                            placeholder={t("Add.descriptionPlaceholder")}
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            disabled={isSubmitting}
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500">{errors.description}</p>
                        )}
                    </div>

                    {/* Status Toggle (only for edit mode) */}
                    {mode === "edit" && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                                <h5 className="text-sm font-semibold text-gray-900">
                                    {t("Edit.status")}
                                </h5>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {t("Edit.statusDescription")}
                                </p>
                            </div>
                            <Switch
                                checked={!formData.isDisabled}
                                onChange={(checked) => handleChange("isDisabled", !checked)}
                                disabled={isSubmitting}
                            />
                        </div>
                    )}
                </div>
            </form>
        </Dialog>
    );
};

export default DishCategoryModal;
