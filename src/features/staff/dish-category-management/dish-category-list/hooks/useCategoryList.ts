"use client";

import { useState, useCallback, useRef } from "react";
import { DishCategory, CategoryFilters } from "../types";
import { listCategoryService } from "../services/listCategoryService";
import type { TableDataChangeParams } from '@/types/table-data-change.types';

export const useCategoryList = () => {
  // Data State
  const [categories, setCategories] = useState<DishCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    pageSize: 10,
  });

  // Dedup + latest-request tracking (same pattern as use-dish-list)
  const latestParamsRef = useRef<TableDataChangeParams>({});
  const lastFetchHashRef = useRef("");
  const fetchIdRef = useRef(0);

  // Fetch categories from API - compatible with BaseTable onDataChange
  const onDataChange = useCallback(async (params: TableDataChangeParams) => {
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
      const apiFilters: CategoryFilters = {
        search: params.search || undefined,
        isDisabled: params.filters?.isDisabled?.value !== undefined ? params.filters.isDisabled.value === 'true' : undefined,
        pageIndex: page,
        pageSize,
      };

      const result = await listCategoryService.getCategories(apiFilters);

      if (currentFetchId === fetchIdRef.current) {
        setCategories(result.pageData);
        setTotalCount(result.totalCount);
      }
    } catch (error) {
      if (currentFetchId === fetchIdRef.current) {
        console.error("Error fetching categories:", error);
        setCategories([]);
        setTotalCount(0);
      }
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Refresh function
  const refresh = useCallback(() => {
    lastFetchHashRef.current = "";
    onDataChange(latestParamsRef.current);
  }, [onDataChange]);

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
