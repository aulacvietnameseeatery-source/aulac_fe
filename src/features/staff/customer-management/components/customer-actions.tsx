"use client";

import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { CustomerListDto } from "../types/customer-types";
import { useTranslations } from "next-intl";
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';

interface CustomerActionsProps {
    customer: CustomerListDto;
    onView: (customer: CustomerListDto) => void;
    onEdit: (customer: CustomerListDto) => void;
    onDelete: (customer: CustomerListDto) => void;
}

export const CustomerActions = ({ customer, onView, onEdit, onDelete }: CustomerActionsProps) => {
    const t = useTranslations("Customer.List.actions");

    const handleAction = (e: React.MouseEvent, action: (item: CustomerListDto) => void) => {
        e.stopPropagation();
        action(customer);
    };

    return (
        <div className="flex justify-end items-center gap-3">
            <PermissionGuard permission={Permissions.ViewCustomer}>
                <button
                    className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
                    data-tooltip-content={t("view")}
                    data-tooltip-id="my-tooltip"
                    onClick={(e) => handleAction(e, onView)}
                >
                    <Eye size={18} />
                </button>
            </PermissionGuard>

            <PermissionGuard permission={Permissions.UpdateCustomer}>
                <button
                    className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
                    data-tooltip-content={t("edit")}
                    data-tooltip-id="my-tooltip"
                    onClick={(e) => handleAction(e, onEdit)}
                >
                    <Edit size={18} />
                </button>
            </PermissionGuard>

            <PermissionGuard permission={Permissions.DeleteCustomer}>
                <button
                    className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                    data-tooltip-content={t("delete")}
                    data-tooltip-id="my-tooltip"
                    onClick={(e) => handleAction(e, onDelete)}
                >
                    <Trash2 size={18} />
                </button>
            </PermissionGuard>
        </div>
    );
};