"use client";

import React from "react";
import { Eye, Edit } from "lucide-react";
import { CustomerListDto } from "../types/customer-types";
import { useTranslations } from "next-intl";
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';

interface CustomerActionsProps {
    customer: CustomerListDto;
    onView: (customer: CustomerListDto) => void;
    onEdit: (customer: CustomerListDto) => void;
}

export const CustomerActions = ({ customer, onView, onEdit }: CustomerActionsProps) => {
    const t = useTranslations("Customer.List.actions");

    const handleAction = (e: React.MouseEvent, action: (item: CustomerListDto) => void) => {
        e.stopPropagation();
        action(customer);
    };

    return (
        <div className="flex justify-end items-center gap-3">
            <PermissionGuard permission={Permissions.ViewAccount}>
                <button
                    className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
                    title={t("view")}
                    onClick={(e) => handleAction(e, onView)}
                >
                    <Eye size={18} />
                </button>
            </PermissionGuard>

            <PermissionGuard permission={Permissions.EditAccount}>
                <button
                    className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
                    title={t("edit")}
                    onClick={(e) => handleAction(e, onEdit)}
                >
                    <Edit size={18} />
                </button>
            </PermissionGuard>
        </div>
    );
};