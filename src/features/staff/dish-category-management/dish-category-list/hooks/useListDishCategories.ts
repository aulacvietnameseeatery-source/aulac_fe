"use client";

import { useState, useEffect } from "react";
import { listCategoryService } from "../services/listCategoryService";
import { DishCategory, CategoryFilters, PagedResult } from "../types";

/**
 * Hook to fetch paginated dish categories
 */
export const useDishCategories = (filters: CategoryFilters) => {
  const [result, setResult] = useState<PagedResult<DishCategory>>({
    pageData: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    totalPage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await listCategoryService.getCategories(filters);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [filters.search, filters.isDisabled, filters.pageIndex, filters.pageSize]);

  return { 
    categories: result.pageData, 
    totalItems: result.totalCount,
    totalPages: result.totalPage,
    pageIndex: result.pageIndex,
    pageSize: result.pageSize,
    isLoading, 
    error, 
    refetch: fetchCategories 
  };
};

/**
 * Hook to fetch all dish categories (without pagination)
 */
export const useAllDishCategories = (includeDisabled: boolean = false) => {
  const [categories, setCategories] = useState<DishCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await listCategoryService.getAllCategories(includeDisabled);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [includeDisabled]);

  return { categories, isLoading, error, refetch: fetchCategories };
};

/**
 * Hook to toggle category status
 */
export const useToggleCategoryStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async (id: number, isDisabled: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await listCategoryService.toggleCategoryStatus(id, isDisabled);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to toggle status";
      setError(errorMessage);
      console.error("Error toggling status:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { toggleStatus, isLoading, error };
};
