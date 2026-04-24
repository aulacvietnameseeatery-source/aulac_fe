"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { formatPhoneToDomesticDisplay } from "@/lib/phone-format";
import { isSupportedPhoneNumber } from "@/lib/phone-validation";
import type { CustomerDetailDto } from "../types/customer-types";

export interface CustomerFormData {
    phone: string;
    fullName: string;
    email: string;
    isMember: boolean;
}

interface CustomerModalProps {
    isOpen: boolean;
    mode: "add" | "edit" | "view";
    customer?: CustomerDetailDto | null;
    onClose: () => void;
    onSubmit: (data: CustomerFormData) => void;
    onEdit?: () => void;
    isSubmitting?: boolean;
}

const initialFormData: CustomerFormData = {
    phone: "",
    fullName: "",
    email: "",
    isMember: true,
};

export const CustomerModal: React.FC<CustomerModalProps> = ({
    isOpen,
    mode,
    customer,
    onClose,
    onSubmit,
    onEdit,
    isSubmitting = false,
}) => {
    const tAdd    = useTranslations("Customer.Add");
    const tEdit   = useTranslations("Customer.Edit");
    const tDetail = useTranslations("Customer.Detail");
    const tCommon = useTranslations("Customer");

    const t = mode === "add" ? tAdd : mode === "edit" ? tEdit : tDetail;

    const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

    useEffect(() => {
        if ((mode === "edit" || mode === "view") && customer) {
            setFormData({
                phone: formatPhoneToDomesticDisplay(customer.phone),
                fullName: customer.fullName || "",
                email: customer.email || "",
                isMember: customer.isMember ?? false,
            });
        } else {
            setFormData(initialFormData);
        }
        setErrors({});
    }, [mode, customer, isOpen]);

    const handleChange = (field: keyof CustomerFormData, value: string | boolean | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CustomerFormData, string>> = {};

        if (!formData.phone.trim()) {
            newErrors.phone = t("validation.phoneRequired");
        } else if (formData.phone.trim().length > 15) {
            newErrors.phone = t("validation.phoneMaxLength");
        } else if (!isSupportedPhoneNumber(formData.phone)) {
            newErrors.phone = t("validation.phoneInvalid");
        }

        if (formData.fullName && formData.fullName.length > 100) {
            newErrors.fullName = t("validation.nameMaxLength");
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
        if (!validateForm()) return;
        onSubmit(formData);
    };

    const isViewMode = mode === "view";

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            title={t("title")}
            width="580px"
            footer={
                <div className="flex items-center gap-3 w-full">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={onClose}
                        disabled={isSubmitting && !isViewMode}
                    >
                        {isViewMode ? tCommon("close") : t("cancel")}
                    </Button>
                    {isViewMode && onEdit && (
                        <Button
                            type="button"
                            variant="primary"
                            className="w-full"
                            onClick={onEdit}
                        >
                            {tCommon("edit")}
                        </Button>
                    )}
                    {!isViewMode && (
                        <Button
                            type="submit"
                            form="customer-form"
                            variant="primary"
                            className="w-full"
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                        >
                            {t("saveButton")}
                        </Button>
                    )}
                </div>
            }
        >
            <form id="customer-form" onSubmit={handleSubmit}>
                <div className="space-y-5 p-5">
                    {/* Phone + Full Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {t("fields.phone")} {!isViewMode && <span className="text-red-500">*</span>}
                            </label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                placeholder={isViewMode ? "" : t("placeholders.phone")}
                                readOnly={isViewMode}
                                className={errors.phone ? "border-red-400" : ""}
                            />
                            {errors.phone && (
                                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {t("fields.fullName")}
                            </label>
                            <Input
                                value={formData.fullName}
                                onChange={(e) => handleChange("fullName", e.target.value)}
                                placeholder={isViewMode ? "" : t("placeholders.fullName")}
                                readOnly={isViewMode}
                                className={errors.fullName ? "border-red-400" : ""}
                            />
                            {errors.fullName && (
                                <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t("fields.email")}
                        </label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            placeholder={isViewMode ? "" : t("placeholders.email")}
                            readOnly={isViewMode}
                            className={errors.email ? "border-red-400" : ""}
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Loyalty Points + Member status – view only */}
                    {isViewMode && (
                        <div className="grid grid-cols-2 gap-4 items-start">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t("fields.loyaltyPoints")}
                                </label>
                                <Input
                                    type="number"
                                    value={customer?.loyaltyPoints ?? 0}
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t("fields.isMember")}
                                </label>
                                <div className="flex items-center h-11">
                                    <Switch
                                        checked={formData.isMember}
                                        onChange={(checked) => handleChange("isMember", checked)}
                                        disabled={isViewMode}
                                        showLabel={true}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Created At – view only */}
                    {isViewMode && customer?.createdAt && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {t("fields.createdAt")}
                            </label>
                            <Input
                                value={new Date(customer.createdAt).toLocaleDateString("vi-VN")}
                                readOnly
                            />
                        </div>
                    )}
                </div>
            </form>
        </Dialog>
    );
};
