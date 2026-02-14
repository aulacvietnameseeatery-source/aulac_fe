import { useState, useEffect, useCallback, useRef } from "react";
import { DishManagementDto } from "../types/dish-types";
import { staffDishService, DishStatusOption } from "../services/dish-service";
import { toast } from "sonner";
import type { TableDataChangeParams } from "@/types/table-data-change.types";

/**
 * Data-fetching hook for dishes.
 * Driven by BaseTable's onDataChange - BaseTable owns search/pagination/filter state.
 *
 * Column filter mapping:
 *   - filters['categoryName'] -> category (API param)
 *   - filters['status']       -> status   (API param, mapped to statusId)
 */
export const useDishList = () => {
    const [dishes, setDishes] = useState<DishManagementDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    // Track current page/pageSize for global row numbering in columns
    const [paginationInfo, setPaginationInfo] = useState({ page: 1, pageSize: 10 });

    // Filter options loaded once on mount (for column filterOptions)
    const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
    const [statusOptions, setStatusOptions] = useState<DishStatusOption[]>([]);
    const [isLoadingFilters, setIsLoadingFilters] = useState(true);

    // Dedup + latest-request tracking
    const latestParamsRef = useRef<TableDataChangeParams>({});
    const lastFetchHashRef = useRef("");
    const fetchIdRef = useRef(0);

    // Fetch filter options once on mount
    useEffect(() => {
        const initFilters = async () => {
            setIsLoadingFilters(true);
            try {
                const [cats, stats] = await Promise.all([
                    staffDishService.getAllCategories(),
                    staffDishService.getDishStatuses(),
                ]);
                setCategoryOptions(cats);
                setStatusOptions(stats);
            } catch (error) {
                console.error("Failed to fetch filters", error);
            } finally {
                setIsLoadingFilters(false);
            }
        };
        initFilters();
    }, []);

    /** Called by BaseTable's onDataChange */
    const handleDataChange = useCallback(async (params: TableDataChangeParams) => {
        const hash = JSON.stringify(params);
        if (hash === lastFetchHashRef.current) return;
        lastFetchHashRef.current = hash;
        latestParamsRef.current = params;

        const currentFetchId = ++fetchIdRef.current;
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;

        setPaginationInfo({ page, pageSize });
        setIsLoading(true);

        try {
            // Extract column-filter values
            const category = params.filters?.["categoryName"]?.value || undefined;
            const status = params.filters?.["status"]?.value
                ? Number(params.filters["status"].value)
                : undefined;

            const data = await staffDishService.getDishes({
                pageIndex: page,
                pageSize,
                search: params.search || "",
                category: category || "All",
                status: status || "All",
                sortBy: "CreatedAt",
                isDescending: true,
            });

            if (currentFetchId === fetchIdRef.current) {
                setDishes(data.pageData);
                setTotalCount(data.totalCount);
            }
        } catch (error: any) {
            if (currentFetchId === fetchIdRef.current) {
                console.error("Failed to fetch dishes:", error);
                toast.error(error.message || "Error loading dishes");
            }
        } finally {
            if (currentFetchId === fetchIdRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    /** Re-fetch with the last known params */
    const refresh = useCallback(() => {
        lastFetchHashRef.current = "";
        handleDataChange(latestParamsRef.current);
    }, [handleDataChange]);

    return {
        dishes,
        isLoading,
        totalCount,
        paginationInfo,
        onDataChange: handleDataChange,
        refresh,
        updateDishLocally: (updatedDish: DishManagementDto) => {
            setDishes(prev => prev.map(dish => dish.dishId === updatedDish.dishId ? updatedDish : dish));
        },
        filterOptions: {
            categories: categoryOptions,
            statuses: statusOptions,
            isLoading: isLoadingFilters,
        },
    };
};
