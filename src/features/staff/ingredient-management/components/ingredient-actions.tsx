// features/staff/ingredient-management/components/ingredient-actions.tsx
import React from "react";
import { MoreHorizontal, Pencil, Trash2, PackagePlus, History } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import custom Dropdown của bạn (Hãy điều chỉnh đường dẫn import cho đúng với thư mục của bạn)
import {
    Dropdown,
    DropdownContent,
    DropdownItem,
    DropdownSeparator,
} from "@/components/ui/dropdown";

import { IngredientDto } from "../types/ingredient-types";

interface IngredientActionsProps {
    ingredient: IngredientDto;
    onEdit: (item: IngredientDto) => void;
    onDelete: (item: IngredientDto) => void;
    onAdjustStock: (item: IngredientDto) => void;
    onHistory: (item: IngredientDto) => void;
}

export const IngredientActions: React.FC<IngredientActionsProps> = ({
                                                                        ingredient,
                                                                        onEdit,
                                                                        onDelete,
                                                                        onAdjustStock,
                                                                        onHistory,
                                                                    }) => {

    // Định nghĩa nút Trigger cho Dropdown
    const triggerButton = (
        <Button variant="ghost" size="icon" data-tooltip-content="More Actions" data-tooltip-id="my-tooltip">
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
        </Button>
    );

    return (
        <div className="flex items-center justify-end gap-2">
            {/* Nút Sửa */}
            <Button variant="ghost" size="icon" onClick={() => onEdit(ingredient)} data-tooltip-content="Edit" data-tooltip-id="my-tooltip">
                <Pencil className="w-4 h-4 text-gray-600" />
            </Button>

            {/* Nút Xóa */}
            <Button variant="ghost" size="icon" onClick={() => onDelete(ingredient)} data-tooltip-content="Delete" data-tooltip-id="my-tooltip">
                <Trash2 className="w-4 h-4 text-red-500" />
            </Button>

            {/* Menu Mở rộng cho Kho sử dụng Custom Dropdown */}
            <Dropdown
                trigger={triggerButton}
                align="end"
                className="w-48"
            >
                <DropdownContent>
                    {/* Label mô phỏng chức năng của DropdownMenuLabel */}
                    <div className="px-3 py-1.5 text-sm font-semibold text-gray-900 cursor-default">
                        Inventory Actions
                    </div>

                    <DropdownSeparator />

                    <DropdownItem onClick={() => onAdjustStock(ingredient)}>
                        <PackagePlus className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-700">Adjust Stock</span>
                    </DropdownItem>

                    <DropdownItem onClick={() => onHistory(ingredient)}>
                        <History className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-700">Stock History</span>
                    </DropdownItem>

                </DropdownContent>
            </Dropdown>
        </div>
    );
};