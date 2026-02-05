import { useState, useMemo } from 'react';

export type FilterOperator = 
    | 'contains' 
    | 'notContains' 
    | 'equals' 
    | 'notequal' 
    | 'startsWith' 
    | 'endsWith' 
    | 'greater' 
    | 'less' 
    | 'greaterOrEqual'
    | 'lessOrEqual' 
    | 'different'
    | 'isNull'
    | 'notNull'
    | 'selected';

export type FilterType = 'text' | 'number' | 'date' | 'time' | 'select';

export interface FilterState {
    operator: FilterOperator;
    value: string;
    type: FilterType;
}

export const useTableFiltering = () => {
    const [filters, setFilters] = useState<Record<string, FilterState>>({});

    /**
     * Áp dụng hoặc cập nhật bộ lọc một cột. Merge FilterState vào filters
     * Create by: DatND (15/1/2026)
     */
    const applyFilter = (field: string, state: FilterState) => {
        setFilters(prev => ({ ...prev, [field]: state }));
    };

    /**
     * Xóa bộ lọc của một cột
     * Create by: DatND (15/1/2026)
     */
    const clearFilter = (field: string) => {
        setFilters(prev => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    /**
     * Xóa tất cả bộ lọc
     * Create by: DatND (18/1/2026)
     */
    const clearAllFilters = () => {
        setFilters({});
    };

    /**
     * Kiểm tra xem có filter nào đang active không
     * Create by: DatND (18/1/2026)
     */
    const hasActiveFilters = useMemo(() => Object.keys(filters).length > 0, [filters]);

    /**
     * Kiểm tra xem filter của cột có đang được kích hoạt hay không
     * Create by: DatND (18/1/2026)
     */
    const isFilterActive = (field: string): boolean => {
        return !!filters[field];
    };

    /**
     * Lấy filter state cho một cột, hoặc trả về state mặc định
     * Create by: DatND (18/1/2026)
     */
    const getFilterState = (field: string, filterType?: FilterType): FilterState => {
        const existing = filters[field];
        if (existing) return existing;
        
        const initial: FilterState = {
            operator: filterType === 'number' || filterType === 'date' ? 'equals' : 'contains',
            value: '',
            type: filterType || 'text'
        };
        return initial;
    };

    /**
     * Cập nhật filter state cho một cột mà không trigger reactive
     * Used for temporary UI state updates
     * Create by: DatND (18/1/2026)
     */
    const updateFilterState = (field: string, state: Partial<FilterState>) => {
        setFilters(prev => {
            const current = prev[field] || { operator: 'contains' as FilterOperator, value: '', type: 'text' as const };
            return { ...prev, [field]: { ...current, ...state } };
        });
    };

    return { 
        filters, 
        applyFilter, 
        clearFilter, 
        clearAllFilters, 
        hasActiveFilters, 
        isFilterActive,
        getFilterState,
        updateFilterState
    };
};
