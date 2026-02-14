import type { FilterState } from '@/hooks/table/useTableFiltering';
import type { SortStateItem } from '@/hooks/table/useTableSorting';

/**
 * Params emitted by BaseTable's onDataChange callback.
 * Used as the standard interface between BaseTable and data-fetching hooks.
 */
export interface TableDataChangeParams {
  search?: string;
  filters?: Record<string, FilterState>;
  sort?: SortStateItem[];
  page?: number;
  pageSize?: number;
}
