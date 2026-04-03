"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ALInput } from "@/components/ui/al-input";
import { ALCombobox } from "@/components/ui/al-combobox";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { CouponDetailDto } from "../coupon-list/types/coupon.types";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";

interface CouponModalProps {
    isOpen: boolean;
    mode: "add" | "edit" | "view";
    coupon?: CouponDetailDto | null;
    onClose: () => void;
    onSubmit: (data: CouponFormData) => void;
    onEdit?: () => void;
    isSubmitting?: boolean;
}

export interface CouponFormData {
    couponCode: string;
    couponName: string;
    description: string;
    startTime: string;
    endTime: string;
    discountValue: number;
    maxUsage: number | null;
    type: string;
    couponStatus: string;
}

const initialFormData: CouponFormData = {
    couponCode: "",
    couponName: "",
    description: "",
    startTime: "",
    endTime: "",
    discountValue: 0,
    maxUsage: null,
    type: "FIXED_AMOUNT",
    couponStatus: "ACTIVE",
};

export const CouponModal: React.FC<CouponModalProps> = ({
    isOpen,
    mode,
    coupon,
    onClose,
    onSubmit,
    onEdit,
    isSubmitting = false,
}) => {
    const t = useTranslations(mode === "add" ? "Coupon.Add" : mode === "edit" ? "Coupon.Edit" : "Coupon.Detail");
    const tCommon = useTranslations("Coupon");
    
    const [formData, setFormData] = useState<CouponFormData>(initialFormData);    const [discountValueRaw, setDiscountValueRaw] = useState<string>("");    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Type options
    const typeOptions = [
        { value: "FIXED_AMOUNT", label: t("type.fixedAmount") },
        { value: "PERCENT", label: t("type.percent") },
    ];

    // Status options
    const statusOptions = [
        { value: "ACTIVE", label: t("status.active") },
        { value: "DISABLED", label: t("status.disabled") },
        { value: "SCHEDULED", label: t("status.scheduled") },
        { value: "EXPIRED", label: t("status.expired") },
    ];

    // Format datetime for input
    const formatDateTimeForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    // Initialize form data
    useEffect(() => {
        if ((mode === "edit" || mode === "view") && coupon) {
            setFormData({
                couponCode: coupon.couponCode.replace(/\s/g, "").toUpperCase(),
                couponName: coupon.couponName,
                description: coupon.description || "",
                startTime: formatDateTimeForInput(coupon.startTime),
                endTime: formatDateTimeForInput(coupon.endTime),
                discountValue: coupon.discountValue,
                maxUsage: coupon.maxUsage,
                type: coupon.type,
                couponStatus: coupon.couponStatus,
            });
            setDiscountValueRaw(coupon.discountValue > 0 ? String(coupon.discountValue) : "");
        } else {
            setFormData(initialFormData);
            setDiscountValueRaw("");
        }
        setErrors({});
    }, [mode, coupon, isOpen]);

    const handleChange = (field: keyof CouponFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.couponCode.trim()) {
            newErrors.couponCode = t("validation.codeRequired");
        } else if (formData.couponCode.length > 50) {
            newErrors.couponCode = t("validation.codeMaxLength");
        }

        if (!formData.couponName.trim()) {
            newErrors.couponName = t("validation.nameRequired");
        } else if (formData.couponName.length > 200) {
            newErrors.couponName = t("validation.nameMaxLength");
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = t("validation.descriptionMaxLength");
        }

        if (!formData.startTime) {
            newErrors.startTime = t("validation.startTimeRequired");
        }

        if (!formData.endTime) {
            newErrors.endTime = t("validation.endTimeRequired");
        }

        if (formData.startTime && formData.endTime) {
            if (new Date(formData.endTime) <= new Date(formData.startTime)) {
                newErrors.endTime = t("validation.endTimeAfterStart");
            }
        }

        if (!formData.discountValue || formData.discountValue <= 0) {
            newErrors.discountValue = t("validation.discountValueRequired");
        } else if (formData.type === "PERCENT") {
            if (formData.discountValue < 0 || formData.discountValue > 100) {
                newErrors.discountValue = t("validation.percentMax");
            }
        }

        if (formData.maxUsage !== null && formData.maxUsage !== undefined && formData.maxUsage < 1) {
            newErrors.maxUsage = t("validation.maxUsageMin");
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
            width="800px"
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
                    {isViewMode && onEdit && (
                        <PermissionGuard permission={Permissions.EditCoupon}>
                            <Button
                                type="button"
                                variant="primary"
                                className="w-full"
                                onClick={onEdit}
                            >
                                {tCommon("edit") || "Edit"}
                            </Button>
                        </PermissionGuard>
                    )}
                    {!isViewMode && (
                        <Button
                            type="submit"
                            form="coupon-form"
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
            <form id="coupon-form" onSubmit={handleSubmit}>
                <div className="space-y-5 p-5">
                    {/* Code & Name row */}
                    <div className="grid grid-cols-2 gap-4">
                        <ALInput
                            title={t("couponCode")}
                            required={!isViewMode}
                            placeholder={isViewMode ? "" : t("couponCodePlaceholder")}
                            value={formData.couponCode}
                            onChange={(e) => handleChange("couponCode", e.target.value.replace(/\s/g, "").toUpperCase())}
                            error={errors.couponCode}
                            readOnly={isViewMode}
                        />
                        <ALInput
                            title={t("couponName")}
                            required={!isViewMode}
                            placeholder={isViewMode ? "" : t("couponNamePlaceholder")}
                            value={formData.couponName}
                            onChange={(e) => handleChange("couponName", e.target.value)}
                            error={errors.couponName}
                            readOnly={isViewMode}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("description")}
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder={isViewMode ? "" : t("descriptionPlaceholder")}
                            readOnly={isViewMode}
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                                errors.description ? 'border-red-500' : 'border-gray-300'
                            } ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    {/* Type & Discount Value row */}
                    <div className="grid grid-cols-2 gap-4">
                        <ALCombobox
                            title={t("type.label")}
                            required={!isViewMode}
                            options={typeOptions}
                            value={formData.type}
                            onChange={(val) => handleChange("type", val as string)}
                            disabled={isViewMode}
                        />
                        <ALInput
                            title={t("discountValue")}
                            required={!isViewMode}
                            type="text"
                            inputMode="decimal"
                            placeholder={isViewMode ? "" : t("discountValuePlaceholder")}
                            value={discountValueRaw}
                            onChange={(e) => {
                                const raw = e.target.value.replace(',', '.');
                                if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
                                    setDiscountValueRaw(raw);
                                    const parsed = raw === "" || raw === "." ? 0 : parseFloat(raw);
                                    handleChange("discountValue", isNaN(parsed) ? 0 : parsed);
                                }
                            }}
                            error={errors.discountValue}
                            readOnly={isViewMode}
                        />
                    </div>

                    {/* Date range row */}
                    <div className="grid grid-cols-2 gap-4">
                        <ALInput
                            title={t("startTime")}
                            required={!isViewMode}
                            type="datetime-local"
                            value={formData.startTime}
                            onChange={(e) => handleChange("startTime", e.target.value)}
                            error={errors.startTime}
                            readOnly={isViewMode}
                        />
                        <ALInput
                            title={t("endTime")}
                            required={!isViewMode}
                            type="datetime-local"
                            value={formData.endTime}
                            onChange={(e) => handleChange("endTime", e.target.value)}
                            error={errors.endTime}
                            readOnly={isViewMode}
                        />
                    </div>

                    {/* Max Usage & Status row */}
                    <div className="grid grid-cols-2 gap-4">
                        <ALInput
                            title={t("maxUsage")}
                            type="number"
                            placeholder={isViewMode ? "" : t("maxUsagePlaceholder")}
                            value={formData.maxUsage?.toString() || ""}
                            onChange={(e) => handleChange("maxUsage", e.target.value ? parseInt(e.target.value) : null)}
                            error={errors.maxUsage}
                            readOnly={isViewMode}
                            min={1}
                        />
                        <ALCombobox
                            title={t("status.label")}
                            required={!isViewMode}
                            options={statusOptions}
                            value={formData.couponStatus}
                            onChange={(val) => handleChange("couponStatus", val as string)}
                            disabled={isViewMode}
                        />
                    </div>

                    {/* Usage info (view mode only) */}
                    {isViewMode && coupon && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>{t("usedCount")}:</strong> {coupon.usedCount || 0}</p>
                                {coupon.createdAt && (
                                    <p><strong>{t("createdAt")}:</strong> {new Date(coupon.createdAt).toLocaleString()}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </Dialog>
    );
};
