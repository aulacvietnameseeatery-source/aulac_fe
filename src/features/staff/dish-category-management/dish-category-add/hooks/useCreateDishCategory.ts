"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createCategoryService } from "../services/createCategoryService";
import { CreateDishCategoryRequest } from "../types";

/**
 * Hook to create a new category
 */
export const useCreateDishCategory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (request: CreateDishCategoryRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await createCategoryService.createCategory(request);
      toast.success("Category created successfully");
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create category";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error creating category:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createCategory, isLoading, error };
};
