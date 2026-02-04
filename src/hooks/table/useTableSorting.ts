import { useState, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortStateItem {
    field: string;
    direction: SortDirection;
}

export const useTableSorting = () => {
    const [sortState, setSortState] = useState<SortStateItem[]>([]);

    /**
     * Sắp xếp đa cột theo thứ tự ưu tiên. Direction null sẽ xóa sort của cột
     * Create by: DatND (15/1/2026)
     */
    const setSort = useCallback((field: string, direction: SortDirection | null) => {
        setSortState(prev => {
            const next = prev.filter(item => item.field !== field);
            if (direction) {
                next.push({ field, direction });
            }
            return next;
        });
    }, []);

    const clearSort = useCallback(() => {
        setSortState([]);
    }, []);

    return { sortState, setSort, clearSort };
};
