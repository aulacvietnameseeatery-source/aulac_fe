import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog } from "@/components/ui/dialog";
import { ALInput } from "@/components/ui/al-input";
import { ALCombobox } from "@/components/ui/al-combobox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IngredientDto } from "../types/ingredient-types";
import { ingredientService } from "../services/ingredient-service";

interface AdjustStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    ingredient: IngredientDto | null;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      onSuccess,
                                                                      ingredient,
                                                                  }) => {
    const t = useTranslations("Ingredient.List.notifications");
    const [type, setType] = useState<"import" | "export">("import");
    const [quantity, setQuantity] = useState<number>(0);
    const [note, setNote] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form mỗi khi mở modal
    React.useEffect(() => {
        if (isOpen) {
            setType("import");
            setQuantity(0);
            setNote("");
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ingredient || quantity <= 0) {
            toast.error(t("adjustStockInvalidQty"));
            return;
        }

        // Nếu xuất kho, số lượng gửi lên API phải là số âm
        const finalQuantity = type === "import" ? quantity : -quantity;

        // Validate xuất kho quá lố
        if (type === "export" && quantity > ingredient.quantityOnHand) {
            toast.error(t("adjustStockExceedError", { quantity: ingredient.quantityOnHand, unit: ingredient.unitName ?? "" }));
            return;
        }

        setIsSubmitting(true);
        try {
            await ingredientService.adjustStock(ingredient.ingredientId, {
                quantity: finalQuantity,
                note: note || (type === "import" ? "Manual Import" : "Manual Export"),
            });
            toast.success(t("adjustStockSuccess"));
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || t("adjustStockError"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!ingredient) return null;

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            title="Adjust Stock"
            width="450px"
            footer={
                <div className="flex gap-2 w-full">
                    <Button variant="outline" className="w-full" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button variant="primary" className="w-full" onClick={handleSubmit} disabled={isSubmitting || quantity <= 0}>
                        {isSubmitting ? "Processing..." : "Confirm"}
                    </Button>
                </div>
            }
        >
            <div className="p-5 space-y-4">
                {/* Info Box */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Ingredient</p>
                    <p className="font-semibold text-gray-900 text-lg">{ingredient.ingredientName}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-500">Current Stock:</span>
                        <span className="font-bold text-blue-600">
              {ingredient.quantityOnHand} {ingredient.unitName}
            </span>
                    </div>
                </div>

                {/* Transaction Type */}
                <ALCombobox
                    title="Transaction Type"
                    required
                    options={[
                        { label: "🟢 Import (Add to stock)", value: "import" },
                        { label: "🔴 Export (Remove from stock)", value: "export" },
                    ]}
                    value={type}
                    onChange={(val) => setType(val as "import" | "export")}
                    searchable={false}
                />

                {/* Quantity */}
                <div className="relative">
                    <ALInput
                        title={`Quantity (${ingredient.unitName})`}
                        required
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={quantity}
                        onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    />
                </div>

                {/* Note */}
                <ALInput
                    title="Reason / Note"
                    placeholder="e.g. Received from supplier, damaged..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>
        </Dialog>
    );
};