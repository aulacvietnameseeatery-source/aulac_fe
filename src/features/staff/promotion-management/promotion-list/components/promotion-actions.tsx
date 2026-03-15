"use client";

import React from "react";
import { Eye, Edit } from "lucide-react";
import { useTranslations } from "next-intl";
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';
import { PromotionListDTO } from "../types/promotion-types";

interface PromotionActionsProps {
    promotion: PromotionListDTO;
    onView: (promo: PromotionListDTO) => void;
    onEdit: (promo: PromotionListDTO) => void;
}

export const PromotionActions = ({ promotion, onView, onEdit }: PromotionActionsProps) => {
    const t = useTranslations("Promotion.List");

    const handleAction = (e: React.MouseEvent, action: (item: PromotionListDTO) => void) => {
        e.stopPropagation();
        action(promotion);
    };

    return (
        <div className="flex justify-end items-center gap-3">
            <PermissionGuard permission={Permissions.ViewPromotion}>
                <button
                    className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
                    data-tooltip-content={t("actions.view")}
                    data-tooltip-id="my-tooltip"
                    onClick={(e) => handleAction(e, onView)}
                >
                    <Eye size={18} />
                </button>
            </PermissionGuard>

            <PermissionGuard permission={Permissions.UpdatePromotion}>
                <button
                    className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
                    data-tooltip-content={t("actions.edit")}
                    data-tooltip-id="my-tooltip"
                    onClick={(e) => handleAction(e, onEdit)}
                >
                    <Edit size={18} />
                </button>
            </PermissionGuard>
        </div>
    );
};