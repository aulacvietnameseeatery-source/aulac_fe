"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ALInput } from "@/components/ui/al-input";
import { ALCombobox } from "@/components/ui/al-combobox";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { CouponDetailDto } from "../coupon-list/types/coupon.types";
import { PermissionGuard } from "@/components/permission-guard";
import { dateUtils } from "@/lib/date-utils";
import { fromZonedTime } from "date-fns-tz";
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

    // Format datetime for input (in Swiss timezone)
    const formatDateTimeForInput = (dateString: string) => {
        if (!dateString) return "";
        return dateUtils.formatLocal(dateString, "yyyy-MM-dd'T'HH:mm");
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

        // For active coupons, only validate editable fields (couponName, description, endTime)
        const skipLockedFields = isActiveCoupon;

        if (!skipLockedFields) {
            if (!formData.couponCode.trim()) {
                newErrors.couponCode = t("validation.codeRequired");
            } else if (formData.couponCode.trim().length < 3) {
                newErrors.couponCode = t("validation.codeMinLength");
            } else if (formData.couponCode.length > 50) {
                newErrors.couponCode = t("validation.codeMaxLength");
            }

            if (!formData.couponName.trim()) {
                newErrors.couponName = t("validation.nameRequired");
            } else if (formData.couponName.length > 200) {
                newErrors.couponName = t("validation.nameMaxLength");
            }

            if (!formData.startTime) {
                newErrors.startTime = t("validation.startTimeRequired");
            }

            if (!formData.discountValue || formData.discountValue <= 0) {
                newErrors.discountValue = t("validation.discountValueRequired");
            } else if (formData.type === "PERCENT") {
                if (formData.discountValue < 0 || formData.discountValue > 100) {
                    newErrors.discountValue = t("validation.percentMax");
                }
            }
        }

        // For active coupons, couponName is still editable — validate it separately
        if (skipLockedFields) {
            if (!formData.couponName.trim()) {
                newErrors.couponName = t("validation.nameRequired");
            } else if (formData.couponName.length > 200) {
                newErrors.couponName = t("validation.nameMaxLength");
            }
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = t("validation.descriptionMaxLength");
        }

        if (!formData.endTime) {
            newErrors.endTime = t("validation.endTimeRequired");
        }

        if (formData.endTime) {
            const now = dateUtils.getSwissNow();
            // formData.endTime is in Swiss timezone (from formatDateTimeForInput), convert to UTC for comparison
            const endTimeUtc = fromZonedTime(formData.endTime, "Europe/Zurich");
            const startTimeUtc = formData.startTime ? fromZonedTime(formData.startTime, "Europe/Zurich") : null;
            if (endTimeUtc <= now) {
                newErrors.endTime = t("validation.endTimeInPast");
            } else if (startTimeUtc && endTimeUtc <= startTimeUtc) {
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
    const isExpiredCoupon = mode === "edit" && coupon != null && (() => {
        const now = dateUtils.getSwissNow().getTime();
        const end = new Date(coupon.endTime.endsWith('Z') ? coupon.endTime : `${coupon.endTime}Z`).getTime();
        return now > end;
    })();
    // Active coupon: started but not yet expired (regardless of usedCount)
    const isActiveCoupon = mode === "edit" && coupon != null && !isExpiredCoupon && (() => {
        const now = dateUtils.getSwissNow().getTime();
        const start = new Date(coupon.startTime.endsWith('Z') ? coupon.startTime : `${coupon.startTime}Z`).getTime();
        const end = new Date(coupon.endTime.endsWith('Z') ? coupon.endTime : `${coupon.endTime}Z`).getTime();
        return now >= start && now <= end;
    })();
    // Fields that are always locked (view or expired)
    const isLockedField = isViewMode || isExpiredCoupon;

    const getComputedStatus = useCallback((): string => {
        if (!coupon) return "";
        if (coupon.couponStatus === "DISABLED") return "DISABLED";
        const now = dateUtils.getSwissNow().getTime();
        const start = new Date(coupon.startTime.endsWith('Z') ? coupon.startTime : `${coupon.startTime}Z`).getTime();
        const end = new Date(coupon.endTime.endsWith('Z') ? coupon.endTime : `${coupon.endTime}Z`).getTime();
        if (now < start) return "SCHEDULED";
        if (now > end) return "EXPIRED";
        return "ACTIVE";
    }, [coupon]);

    const statusColorMap: Record<string, string> = {
        ACTIVE: "bg-green-100 text-green-700",
        SCHEDULED: "bg-blue-100 text-blue-700",
        DISABLED: "bg-gray-100 text-gray-600",
        EXPIRED: "bg-red-100 text-red-700",
    };

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
                    {!isViewMode && !isExpiredCoupon && (
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
                    {/* Status badge (view mode only) */}
                    {isViewMode && coupon && (() => {
                        const status = getComputedStatus();
                        const tDetail = tCommon;
                        const labelMap: Record<string, string> = {
                            ACTIVE: tDetail("Detail.status.active"),
                            SCHEDULED: tDetail("Detail.status.scheduled"),
                            DISABLED: tDetail("Detail.status.disabled"),
                            EXPIRED: tDetail("Detail.status.expired"),
                        };
                        return (
                            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                                <div>
                                    <p className="text-base font-bold text-[#1A3A51]">{coupon.couponName}</p>
                                    {coupon.description && <p className="text-sm text-slate-500 mt-0.5">{coupon.description}</p>}
                                </div>
                                <span className={`px-3 py-1 font-bold rounded-md text-sm whitespace-nowrap ${
                                    statusColorMap[status] ?? "bg-gray-100 text-gray-600"
                                }`}>
                                    {labelMap[status] ?? status}
                                </span>
                            </div>
                        );
                    })()}

                    {/* Warning for used coupon in edit mode */}
                    {isActiveCoupon && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-700 font-medium">
                                {tCommon("Edit.notifications.activeCouponPartialEdit")}
                            </p>
                        </div>
                    )}

                    {/* Warning for expired coupon in edit mode */}
                    {isExpiredCoupon && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 font-medium">
                                {tCommon("Edit.notifications.expiredCouponNoEdit")}
                            </p>
                        </div>
                    )}

                    {/* Code & Name row */}
                    <div className="grid grid-cols-2 gap-4">
                        <ALInput
                            title={t("couponCode")}
                            required={!isLockedField && !isActiveCoupon}
                            placeholder={isLockedField || isActiveCoupon ? "" : t("couponCodePlaceholder")}
                            value={formData.couponCode}
                            onChange={(e) => handleChange("couponCode", e.target.value.replace(/\s/g, "").toUpperCase())}
                            error={errors.couponCode}
                            readOnly={isLockedField || isActiveCoupon}
                        />
                        <ALInput
                            title={t("couponName")}
                            required={!isLockedField}
                            placeholder={isLockedField ? "" : t("couponNamePlaceholder")}
                            value={formData.couponName}
                            onChange={(e) => handleChange("couponName", e.target.value)}
                            error={errors.couponName}
                            readOnly={isLockedField}
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
                            placeholder={isLockedField ? "" : t("descriptionPlaceholder")}
                            readOnly={isLockedField}
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                                errors.description ? 'border-red-500' : 'border-gray-300'
                            } ${isLockedField ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    {/* Type & Discount Value row */}
                    <div className="grid grid-cols-2 gap-4">
                        <ALCombobox
                            title={t("type.label")}
                            required={!isLockedField && !isActiveCoupon}
                            options={typeOptions}
                            value={formData.type}
                            onChange={(val) => handleChange("type", val as string)}
                            disabled={isLockedField || isActiveCoupon}
                        />
                        <ALInput
                            title={t("discountValue")}
                            required={!isLockedField && !isActiveCoupon}
                            type="number"
                            step="0.5"
                            placeholder={isLockedField || isActiveCoupon ? "" : t("discountValuePlaceholder")}
                            value={discountValueRaw}
                            onChange={(e) => {
                                const val = e.target.value;
                                setDiscountValueRaw(val);
                                handleChange("discountValue", val === "" ? 0 : Number(val));
                            }}
                            error={errors.discountValue}
                            readOnly={isLockedField || isActiveCoupon}
                        />
                    </div>

                    {/* Date range row */}
                    <div className="grid grid-cols-2 gap-4">
                        <ALInput
                            title={t("startTime")}
                            required={!isLockedField && !isActiveCoupon}
                            type="datetime-local"
                            value={formData.startTime}
                            onChange={(e) => handleChange("startTime", e.target.value)}
                            error={errors.startTime}
                            readOnly={isLockedField || isActiveCoupon}
                        />
                        <ALInput
                            title={t("endTime")}
                            required={!isLockedField}
                            type="datetime-local"
                            value={formData.endTime}
                            onChange={(e) => handleChange("endTime", e.target.value)}
                            error={errors.endTime}
                            readOnly={isLockedField}
                        />
                    </div>

                    {/* Max Usage */}
                    <div>
                        <ALInput
                            title={t("maxUsage")}
                            type="number"
                            step="1"
                            min={1}
                            placeholder={isLockedField ? "" : t("maxUsagePlaceholder")}
                            value={formData.maxUsage?.toString() || ""}
                            onKeyDown={(e) => {
                                const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
                                if (allowed.includes(e.key)) return;
                                if (/^\d$/.test(e.key)) return;
                                e.preventDefault();
                            }}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                handleChange("maxUsage", val ? parseInt(val) : null);
                            }}
                            error={errors.maxUsage}
                            readOnly={isLockedField || isActiveCoupon}
                        />
                    </div>

                    {/* Usage info (view mode only) */}
                    {isViewMode && coupon && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>{t("usedCount")}:</strong> {coupon.usedCount || 0}</p>
                                {coupon.createdAt && (
                                    <p><strong>{t("createdAt")}:</strong> {dateUtils.formatLocal(coupon.createdAt, "dd/MM/yyyy HH:mm")}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </Dialog>
    );
};
