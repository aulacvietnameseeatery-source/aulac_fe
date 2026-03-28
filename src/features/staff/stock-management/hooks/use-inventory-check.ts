import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "@/routing"
import { stockService } from "../services/stock.service";
import type { IngredientDto } from "@/features/staff/ingredient-management/types/ingredient-types";
import type { AuditItemState } from "../types/stock.types";

export function useInventoryCheck() {
    const router = useRouter();
    const [ingredients, setIngredients] = useState<IngredientDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [auditData, setAuditData] = useState<Record<number, AuditItemState>>({});

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const data = await stockService.getAllIngredientsForAudit();
                setIngredients(data);

                const initialAuditData: Record<number, AuditItemState> = {};
                data.forEach((item) => {
                    const safeQty = item.quantityOnHand ?? 0;
                    initialAuditData[item.ingredientId] = {
                        actualQty: String(safeQty),
                        reason: ""
                    };
                });
                setAuditData(initialAuditData);
            } catch (error) {
                console.error("Failed to fetch ingredients:", error);
                toast.error("Không thể tải danh sách nguyên liệu để kiểm kê.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchIngredients();
    }, []);

    const filteredIngredients = useMemo(() => {
        return ingredients.filter(i =>
            i.ingredientName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [ingredients, searchQuery]);

    const handleQtyChange = (id: number, val: string) => {
        setAuditData(prev => ({
            ...prev,
            [id]: { ...prev[id], actualQty: val }
        }));
    };

    const handleReasonChange = (id: number, val: string) => {
        setAuditData(prev => ({
            ...prev,
            [id]: { ...prev[id], reason: val }
        }));
    };

    const handleSubmit = async () => {
        const changedItems = ingredients.filter(item => {
            const auditState = auditData[item.ingredientId];
            if (!auditState || auditState.actualQty === "") return false;
            const actual = Number(auditState.actualQty);
            return actual !== item.quantityOnHand;
        });

        if (changedItems.length === 0) {
            toast.info("Kho đang khớp 100%, không có độ lệch nào để cập nhật!");
            return;
        }

        const missingReason = changedItems.find(item => !auditData[item.ingredientId].reason.trim());
        if (missingReason) {
            toast.error(`Vui lòng nhập lý do chênh lệch cho: ${missingReason.ingredientName}`);
            return;
        }

        if (!window.confirm(`Xác nhận chốt kiểm kê? Sẽ cập nhật tồn kho cho ${changedItems.length} nguyên liệu.`)) {
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(`Đang cập nhật ${changedItems.length} bản ghi...`);

        try {
            const promises = changedItems.map(item => {
                const actual = Number(auditData[item.ingredientId].actualQty);
                const variance = actual - item.quantityOnHand;
                const reason = auditData[item.ingredientId].reason;

                return stockService.adjustStock(item.ingredientId, {
                    quantity: variance,
                    note: `[Kiểm kê kho] ${reason}`
                });
            });

            await Promise.all(promises);

            toast.success("Chốt kiểm kê thành công!", { id: toastId });
            router.push("/dashboard/ingredients");
        } catch (error) {
            console.error("Audit submit error:", error);
            toast.error("Có lỗi xảy ra khi cập nhật tồn kho. Vui lòng thử lại.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        ingredients,
        filteredIngredients,
        isLoading,
        isSubmitting,
        searchQuery,
        setSearchQuery,
        auditData,
        handleQtyChange,
        handleReasonChange,
        handleSubmit,
        router
    };
}