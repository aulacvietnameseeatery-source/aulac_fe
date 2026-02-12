// features/admin/dish-management/dish-list/components/DishActions.tsx
"use client";

import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { DishManagementDto } from "../types/dish-types";
import { useTranslations } from "next-intl";
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';

interface DishActionsProps {
    dish: DishManagementDto;
    onView: (dish: DishManagementDto) => void;
    onEdit: (dish: DishManagementDto) => void;
    onDelete: (dish: DishManagementDto) => void;
}

export const DishActions = ({
                                dish,
                                onView,
                                onEdit,
                                onDelete
                            }: DishActionsProps) => {
    const t = useTranslations("Dish.List");

    const handleAction = (
        e: React.MouseEvent,
        action: (item: DishManagementDto) => void
    ) => {
        e.stopPropagation();
        action(dish);
    };

    return (
        <div className="flex justify-end items-center gap-3">
            {/* Xem chi tiết món ăn */}
            <PermissionGuard permission={Permissions.ViewDish}>
                <button
                    className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
                    title={t("actions.view")}
                    onClick={(e) => handleAction(e, onView)}
                >
                    <Eye size={18} />
                </button>
            </PermissionGuard>

            {/* Chỉnh sửa món ăn */}
            <PermissionGuard permission={Permissions.EditDish}>
                <button
                    className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
                    title={t("actions.edit")}
                    onClick={(e) => handleAction(e, onEdit)}
                >
                    <Edit size={18} />
                </button>
            </PermissionGuard>

            {/* Xóa món ăn */}
            <PermissionGuard permission={Permissions.DeleteDish}>
                <button
                    className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                    title={t("actions.delete")}
                    onClick={(e) => handleAction(e, onDelete)}
                >
                    <Trash2 size={18} />
                </button>
            </PermissionGuard>
        </div>
    );
};