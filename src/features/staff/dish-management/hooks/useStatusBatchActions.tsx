import { BatchAction } from "@/types/table.types";
import { DishManagementDto } from "../types/dish-types";

interface UseStatusBatchActionsProps {
    t: (key: string) => string;
    onUpdate: (selectedDishes: DishManagementDto[], newStatus: "AVAILABLE" | "HIDDEN") => void;
}

export const useStatusBatchActions = ({ t, onUpdate }: UseStatusBatchActionsProps): BatchAction[] => {
    return [
        {
            label: t("batchActions.makeAvailable"),
            icon: "check",
            variant: "success",
            buttonType: "solid",
            className: "text-white",
            action: (items) => onUpdate(items as DishManagementDto[], "AVAILABLE"),
        },
        {
            label: t("batchActions.makeHidden"),
            icon: "close",
            variant: "danger",
            buttonType: "solid",
            className: "text-white",
            action: (items) => onUpdate(items as DishManagementDto[], "HIDDEN"),
        },
    ];
};
