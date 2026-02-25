import { BatchAction } from "@/types/table.types";
import { DishManagementDto } from "../types/dish-types";
import { DishStatusCode } from "@/types/status-codes";

interface UseStatusBatchActionsProps {
    t: (key: string) => string;
    onUpdate: (selectedDishes: DishManagementDto[], newStatus: DishStatusCode) => void;
}

export const useStatusBatchActions = ({ t, onUpdate }: UseStatusBatchActionsProps): BatchAction[] => {
    return [
        {
            label: t("batchActions.makeAvailable"),
            icon: "check",
            variant: "success",
            buttonType: "solid",
            className: "text-white",
            action: (items) => onUpdate(items as DishManagementDto[], DishStatusCode.AVAILABLE),
        },
        {
            label: t("batchActions.makeHidden"),
            icon: "close",
            variant: "danger",
            buttonType: "solid",
            className: "text-white",
            action: (items) => onUpdate(items as DishManagementDto[], DishStatusCode.HIDDEN),
        },
    ];
};
