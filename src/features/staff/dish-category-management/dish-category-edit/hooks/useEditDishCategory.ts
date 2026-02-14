"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { editCategoryService } from "../services/editCategoryService";
import { DishCategory, UpdateDishCategoryRequest } from "../types";

/**
 * Hook to fetch a single category by ID
 */
export const useDishCategory = (id: number) => {
  const [category, setCategory] = useState<DishCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await editCategoryService.getCategoryById(id);
      setCategory(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load category";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching category:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  return { category, isLoading, error, refetch: fetchCategory };
};

/**
 * Hook to update a category
 */
export const useUpdateDishCategory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCategory = async (id: number, request: UpdateDishCategoryRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await editCategoryService.updateCategory(id, request);
      toast.success("Category updated successfully");
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update category";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating category:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateCategory, isLoading, error };
};
