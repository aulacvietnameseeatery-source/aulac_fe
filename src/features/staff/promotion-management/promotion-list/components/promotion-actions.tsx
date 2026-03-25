"use client";

import React from "react";

import { Permissions } from '@/types/const';
import { PromotionListDTO } from "../types/promotion-types";

interface PromotionActionsProps {
    promotion: PromotionListDTO;
    onView: (promo: PromotionListDTO) => void;
    onEdit: (promo: PromotionListDTO) => void;
}

import { TableActionColumn, TableAction } from "@/components/ui/table/table-action-column";

export const PromotionActions = ({ promotion, onView, onEdit }: PromotionActionsProps) => {

    const actions: TableAction<PromotionListDTO>[] = [
        { action: "view", onClick: onView, permission: Permissions.ViewPromotion },
        { action: "edit", onClick: onEdit, permission: Permissions.UpdatePromotion }
    ];

    return <TableActionColumn actions={actions} item={promotion} />;
};