"use client";

import { useState, useEffect } from "react";
import { dishCategoryService } from "../services/dishCategoryService";
import { DishCategory, CreateDishCategoryRequest, UpdateDishCategoryRequest } from "../types";

/**
 * Hook to fetch all dish categories
 */
export const useDishCategories = (includeDisabled: boolean = false) => {
  const [categories, setCategories] = useState<DishCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dishCategoryService.getAllCategories(includeDisabled);
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
      const data = await dishCategoryService.getCategoryById(id);
      setCategory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load category");
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
 * Hook to create a new category
 */
export const useCreateDishCategory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (request: CreateDishCategoryRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dishCategoryService.createCategory(request);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create category";
      setError(errorMessage);
      console.error("Error creating category:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createCategory, isLoading, error };
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
      const data = await dishCategoryService.updateCategory(id, request);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update category";
      setError(errorMessage);
      console.error("Error updating category:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateCategory, isLoading, error };
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
      const data = await dishCategoryService.toggleCategoryStatus(id, isDisabled);
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
