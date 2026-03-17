// features/staff/ingredient-management/components/ingredient-actions.tsx
import React from "react";

import { IngredientDto } from "../types/ingredient-types";

interface IngredientActionsProps {
    ingredient: IngredientDto;
    onEdit: (item: IngredientDto) => void;
    onDelete: (item: IngredientDto) => void;
    onAdjustStock: (item: IngredientDto) => void;
    onHistory: (item: IngredientDto) => void;
}

import { TableActionColumn, TableAction } from "@/components/ui/table/table-action-column";

export const IngredientActions: React.FC<IngredientActionsProps> = ({
    ingredient,
    onEdit,
    onDelete,
    onAdjustStock,
    onHistory,
}) => {
    const actions: TableAction<IngredientDto>[] = [
        { action: "edit", onClick: onEdit },
        { action: "delete", onClick: onDelete },
        { action: "adjust-stock", onClick: onAdjustStock },
        { action: "history", onClick: onHistory }
    ];

    return <TableActionColumn actions={actions} item={ingredient} />;
};