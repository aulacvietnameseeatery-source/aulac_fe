export interface DishCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
  isDisabled: boolean;
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
