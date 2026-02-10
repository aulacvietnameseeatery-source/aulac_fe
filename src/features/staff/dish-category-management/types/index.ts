export interface DishCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
  isDisabled: boolean;
}

export interface CreateDishCategoryRequest {
  categoryName: string;
  description?: string;
  isDisabled?: boolean;
}

export interface UpdateDishCategoryRequest {
  categoryName: string;
  description?: string;
  isDisabled: boolean;
}
