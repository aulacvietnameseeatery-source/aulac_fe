export interface CreateDishCategoryRequest {
  categoryName: string;
  description?: string;
  isDisabled?: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface AddCategoryFormData {
  categoryName: string;
  description: string;
  isActive: boolean;
}
