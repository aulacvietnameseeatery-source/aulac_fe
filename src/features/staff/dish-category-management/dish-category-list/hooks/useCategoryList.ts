"use client";

import { useState, useEffect, useCallback } from "react";
import { DishCategory, CategoryFilters, StatusFilter } from "../types";
import { listCategoryService } from "../services/listCategoryService";

export const useCategoryList = () => {
  // Filters State
  const [filters, setFilters] = useState<{
    searchTerm: string;
    statusFilter: StatusFilter;
  }>({
    searchTerm: '',
    statusFilter: 'all',
  });

  // Pagination State
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    totalPage: 0,
  });

  // Data State
  const [categories, setCategories] = useState<DishCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const apiFilters: CategoryFilters = {
        search: filters.searchTerm || undefined,
        isDisabled: filters.statusFilter === 'all' ? undefined : filters.statusFilter === 'inactive',
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      };

      const result = await listCategoryService.getCategories(apiFilters);
      
      setCategories(result.pageData);
      setPagination(prev => ({
        ...prev,
        totalCount: result.totalCount,
        totalPage: result.totalPage,
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters.searchTerm, filters.statusFilter, pagination.pageIndex, pagination.pageSize]);

  // Fetch on dependency changes
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Action Handlers
  const onSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  const onStatusFilterChange = (value: StatusFilter) => {
    setFilters(prev => ({ ...prev, statusFilter: value }));
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  const onPageChange = (page: number) => {
    setPagination(prev => ({ ...prev, pageIndex: page }));
  };

  const onPageSizeChange = (size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size, pageIndex: 1 }));
  };

  const refresh = () => {
    fetchCategories();
  };

  return {
    categories,
    isLoading,
    pagination,
    filters,
    actions: {
      onSearchChange,
      onStatusFilterChange,
      onPageChange,
      onPageSizeChange,
      refresh,
    },
  };
};
