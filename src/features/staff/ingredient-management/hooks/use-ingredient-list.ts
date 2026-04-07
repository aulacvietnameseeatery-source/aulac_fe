import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { IngredientDto, IngredientFilterParams } from "../types/ingredient-types";
import { ingredientService } from "../services/ingredient-service";

export const useIngredientList = () => {
    const t = useTranslations("Ingredient.List.notifications");
    const [ingredients, setIngredients] = useState<IngredientDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // State quản lý Pagination & Filter
    const [paginationInfo, setPaginationInfo] = useState({ page: 1, pageSize: 10 });
    const [filters, setFilters] = useState<Omit<IngredientFilterParams, 'pageIndex' | 'pageSize'>>({
        search: "",
        typeLvId: undefined,
        isLowStock: false,
    });

    // Hàm Fetch Data chính
    const fetchIngredients = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: IngredientFilterParams = {
                pageIndex: paginationInfo.page,
                pageSize: paginationInfo.pageSize,
                search: filters.search,
                typeLvId: filters.typeLvId,
                isLowStock: filters.isLowStock,
            };

            const response = await ingredientService.getIngredients(params);

            // Map dữ liệu vào state
            setIngredients(response.pageData || []);
            setTotalCount(response.totalCount || 0);

        } catch (error: any) {
            console.error("Failed to fetch ingredients:", error);
            toast.error(t("loadError"));
        } finally {
            setIsLoading(false);
        }
    }, [paginationInfo, filters]);

    useEffect(() => {
        fetchIngredients();
    }, [fetchIngredients]);

    // Hàm Refresh
    const refresh = useCallback(() => {
        fetchIngredients();
    }, [fetchIngredients]);

    const onDataChange = useCallback((params: {
        search?: string;
        filters?: Record<string, any>;
        sort?: any[];
        page?: number;
        pageSize?: number;
    }) => {
        setPaginationInfo(prev => ({
            page: params.page ?? prev.page,
            pageSize: params.pageSize ?? prev.pageSize
        }));

        if (params.search !== undefined) {
            setFilters(prev => ({ ...prev, search: params.search }));
        }
    }, []);

    // Handler thay đổi Filter thủ công (Lọc theo Low Stock, Loại nguyên liệu)
    const updateFilter = useCallback((key: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPaginationInfo(prev => ({ ...prev, page: 1 })); // Reset về trang 1 khi đổi filter
    }, []);

    return {
        ingredients,
        isLoading,
        totalCount,
        paginationInfo,
        filters,
        onDataChange,
        updateFilter,
        refresh,
    };
};