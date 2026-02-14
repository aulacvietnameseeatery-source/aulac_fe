import { useState, useEffect, useCallback } from "react";
import { DishManagementDto, DishStatusCode, GetDishesParams } from "../types/dish-types";
import { staffDishService, DishStatusOption } from "../services/dish-service";
import { toast } from "sonner";

export const useDishList = () => {
    const [dishes, setDishes] = useState<DishManagementDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // State cho Filter Options (Dữ liệu từ Backend)
    const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
    const [statusOptions, setStatusOptions] = useState<DishStatusOption[]>([]);
    const [isLoadingFilters, setIsLoadingFilters] = useState(true);

    const [pagination, setPagination] = useState({
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        totalPage: 0,
    });

    const [filters, setFilters] = useState({
        search: "",
        category: "All",
        status: "All" as number | "All", // Sửa lại type để linh hoạt hơn (number vì ID từ DB là 42,43...)
        sortBy: "CreatedAt",
        isDescending: true,
    });

    // 1. Fetch Dishes (Gọi mỗi khi filter/page thay đổi)
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

            const data = await staffDishService.getDishes(params);

            setDishes(data.pageData);
            setPagination(prev => ({
                ...prev,
                totalCount: data.totalCount,
                totalPage: data.totalPage,
            }));
        } catch (error: any) {
            console.error("Failed to fetch dishes:", error);
            toast.error(error.message || "Lỗi tải danh sách món");
        } finally {
            setIsLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize, filters]);

    // 2. Fetch Filter Options (Chỉ gọi 1 lần khi Mount)
    useEffect(() => {
        const initFilters = async () => {
            setIsLoadingFilters(true);
            try {
                const [cats, stats] = await Promise.all([
                    staffDishService.getAllCategories(),
                    staffDishService.getDishStatuses()
                ]);
                setCategoryOptions(cats);
                setStatusOptions(stats);
            } catch (error) {
                console.error("Failed to fetch filters", error);
                // Không toast lỗi ở đây để tránh spam, chỉ log
            } finally {
                setIsLoadingFilters(false);
            }
        };
        initFilters();
    }, []);

    // Trigger fetch dishes
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

    const onStatusChange = (value: number | "All") => {
        setFilters(prev => ({ ...prev, status: value }));
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    return {
        dishes,
        isLoading,
        pagination,
        filters,
        // Expose thêm options ra ngoài
        filterOptions: {
            categories: categoryOptions,
            statuses: statusOptions,
            isLoading: isLoadingFilters
        },
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