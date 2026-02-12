// features/admin/dish-management/dish-list/hooks/useDishList.ts

import { useState, useEffect, useCallback } from "react";
import { DishManagementDto, DishStatusCode, GetDishesParams } from "../types/dish-types";
import { staffDishService } from "../services/dish-service";
import { toast } from "sonner";

export const useDishList = () => {
    const [dishes, setDishes] = useState<DishManagementDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [pagination, setPagination] = useState({
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        totalPage: 0,
    });

    const [filters, setFilters] = useState({
        search: "",
        category: "All",
        status: "All" as DishStatusCode | "All",
        sortBy: "CreatedAt",
        isDescending: true,
    });

    const fetchDishes = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: GetDishesParams = {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
                search: filters.search,
                category: filters.category,
                status: filters.status,
                sortBy: filters.sortBy,
                isDescending: filters.isDescending,
            };

            // staffDishService.getDishes trả về PagedResult<DishManagementDto>
            const data = await staffDishService.getDishes(params);

            setDishes(data.pageData);
            setPagination(prev => ({
                ...prev,
                totalCount: data.totalCount,
                totalPage: data.totalPage,
            }));
        } catch (error: any) {
            console.error("Failed to fetch dishes:", error);
            toast.error(error.message || "Lỗi khi tải danh sách món ăn");
        } finally {
            setIsLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize, filters]);

    useEffect(() => {
        fetchDishes();
    }, [fetchDishes]);

    // Action Handlers
    const onPageChange = (page: number) => setPagination(prev => ({ ...prev, pageIndex: page }));

    const onPageSizeChange = (size: number) => setPagination(prev => ({ ...prev, pageSize: size, pageIndex: 1 }));

    const onSearchChange = (value: string) => {
        setFilters(prev => ({ ...prev, search: value }));
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    const onCategoryChange = (value: string) => {
        setFilters(prev => ({ ...prev, category: value }));
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    const onStatusChange = (value: DishStatusCode | "All") => {
        setFilters(prev => ({ ...prev, status: value }));
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    return {
        dishes,
        isLoading,
        pagination,
        filters,
        actions: {
            refresh: fetchDishes,
            onPageChange,
            onPageSizeChange,
            onSearchChange,
            onCategoryChange,
            onStatusChange
        },
    };
};