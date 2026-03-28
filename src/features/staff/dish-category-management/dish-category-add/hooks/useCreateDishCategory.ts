"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createCategoryService } from "../services/createCategoryService";
import { CreateDishCategoryRequest } from "../types";
import { ApiClientError } from "@/lib/api-error";

/**
 * Hook to create a new category
 */
export const useCreateDishCategory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("DishCategory.List");

  const createCategory = async (request: CreateDishCategoryRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await createCategoryService.createCategory(request);
      toast.success(t("notifications.createSuccess"));
      return data;
    } catch (err) {
      const apiErr = err as ApiClientError;
      const errorMessage =
        apiErr.status === 409
          ? t("notifications.nameAlreadyExists")
          : apiErr instanceof Error
          ? apiErr.message
          : t("notifications.actionError");
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
