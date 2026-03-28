export interface CategoryI18n {
  vi: string;
  en: string;
  fr: string;
}

export interface DishCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
  isDisabled: boolean;
  nameI18n: CategoryI18n;
  descriptionI18n: CategoryI18n;
}

export type StatusFilter = 'all' | 'active' | 'inactive';

export interface CategoryFilters {
  search?: string;
  isDisabled?: boolean;
  pageIndex: number;
  pageSize: number;
}

export interface CategoryTableProps {
  categories: DishCategory[];
  isLoading: boolean;
  onEdit: (id: number) => void;
  onToggleStatus: (id: number, currentDisabled: boolean) => void;
}

export interface PagedResult<T> {
  pageData: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
}
