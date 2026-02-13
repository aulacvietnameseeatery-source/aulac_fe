export interface DishCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
  isDisabled: boolean;
}

export interface UpdateDishCategoryRequest {
  categoryName: string;
  description?: string;
  isDisabled: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface EditCategoryFormData {
  categoryName: string;
  description: string;
  isActive: boolean;
}
