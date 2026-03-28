export interface CategoryI18nContent {
  name: string;
  description?: string;
}

export interface CreateDishCategoryRequest {
  i18n: {
    en: CategoryI18nContent;
    vi: CategoryI18nContent;
    fr: CategoryI18nContent;
  };
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
