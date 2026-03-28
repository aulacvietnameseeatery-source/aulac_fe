export interface CategoryI18nContent {
  name: string;
  description?: string;
}

export interface DishCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
  isDisabled: boolean;
  nameI18n: { vi: string; en: string; fr: string };
  descriptionI18n: { vi: string; en: string; fr: string };
}

export interface UpdateDishCategoryRequest {
  i18n: {
    en: CategoryI18nContent;
    vi: CategoryI18nContent;
    fr: CategoryI18nContent;
  };
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
