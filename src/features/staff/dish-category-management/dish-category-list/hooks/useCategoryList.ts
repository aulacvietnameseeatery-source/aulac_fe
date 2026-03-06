"use client";

import { useState, useCallback } from "react";
import { DishCategory, CategoryFilters } from "../types";
import { listCategoryService } from "../services/listCategoryService";
import type { FilterState } from '@/hooks/table/useTableFiltering';
import type { SortStateItem } from '@/hooks/table/useTableSorting';

export const useCategoryList = () => {
  // Data State
  const [categories, setCategories] = useState<DishCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    pageSize: 10,
  });

  // Fetch categories from API - compatible with BaseTable onDataChange
  const onDataChange = useCallback((params: {
    search?: string;
    filters?: Record<string, FilterState>;
    sort?: SortStateItem[];
    page?: number;
    pageSize?: number;
  }) => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const apiFilters: CategoryFilters = {
          search: params.search || undefined,
          isDisabled: params.filters?.isDisabled?.value !== undefined ? params.filters.isDisabled.value === 'true' : undefined,
          pageIndex: params.page || 1,
          pageSize: params.pageSize || 10,
        };

        const result = await listCategoryService.getCategories(apiFilters);
        
        setCategories(result.pageData);
        setTotalCount(result.totalCount);
        setPaginationInfo({
          page: params.page || 1,
          pageSize: params.pageSize || 10,
        });
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh function
  const refresh = useCallback(() => {
    // Trigger a re-fetch by calling onDataChange with current pagination
    onDataChange({
      page: paginationInfo.page,
      pageSize: paginationInfo.pageSize,
    });
  }, [paginationInfo, onDataChange]);

  // Update category locally (for optimistic updates)
  const updateCategoryLocally = useCallback((updatedCategory: DishCategory) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.categoryId === updatedCategory.categoryId ? updatedCategory : cat
      )
    );
  }, []);

  return {
    categories,
    isLoading,
    totalCount,
    paginationInfo,
    onDataChange,
    refresh,
    updateCategoryLocally,
  };
};
