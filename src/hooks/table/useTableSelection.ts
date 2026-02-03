import { useState, useMemo, useCallback } from 'react';

export type SelectionMode = 'single' | 'multiple';

interface UseTableSelectionParams<T> {
    data: T[];
    selectionMode: SelectionMode;
    getRowKey: (item: T) => string | number;
    onSelectionChange?: (items: T[]) => void;
}

export const useTableSelection = <T>({
    data,
    selectionMode,
    getRowKey,
    onSelectionChange
}: UseTableSelectionParams<T>) => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());
    const [activeRowKey, setActiveRowKey] = useState<string | number | null>(null);

    const selectedItems = useMemo(
        () => data.filter(item => selectedKeys.has(getRowKey(item))),
        [data, selectedKeys, getRowKey]
    );

    const isRowChecked = useCallback(
        (item: T) => selectedKeys.has(getRowKey(item)),
        [selectedKeys, getRowKey]
    );

    /**
     * Quản lý chọn tất cả hoặc bỏ chọn tất cả. Tạo Set mới chứa keys nếu checked = true
     * Create by: DatND (15/1/2026)
     */
    const handleSelectAllChange = useCallback((items: T[], checked: boolean) => {
        const next = new Set<string | number>();
        if (checked) {
            items.forEach(item => next.add(getRowKey(item)));
        }
        setSelectedKeys(next);
        
        const newSelectedItems = checked ? items : [];
        onSelectionChange?.(newSelectedItems);
    }, [getRowKey, onSelectionChange]);

    /**
     * Quản lý bật/tắt chọn một dòng. Mode single sẽ clear all, mode multiple sẽ add/delete key
     * Create by: DatND (15/1/2026)
     */
    const toggleRowSelection = useCallback((item: T, checked: boolean) => {
        const key = getRowKey(item);
        setSelectedKeys(prev => {
            const next = new Set(prev);

            if (selectionMode === 'single') {
                next.clear();
                if (checked) next.add(key);
            } else {
                if (checked) next.add(key);
                else next.delete(key);
            }

            return next;
        });

        // Calculate selected items for callback
        setTimeout(() => {
            const newSelectedItems = data.filter(item => {
                const itemKey = getRowKey(item);
                if (selectionMode === 'single') {
                    return checked && itemKey === key;
                }
                return selectedKeys.has(itemKey) || (checked && itemKey === key);
            });
            onSelectionChange?.(newSelectedItems);
        }, 0);
    }, [selectionMode, getRowKey, data, selectedKeys, onSelectionChange]);

    const unselectAll = useCallback(() => {
        setSelectedKeys(new Set());
        onSelectionChange?.([]);
    }, [onSelectionChange]);

    const setActiveRow = useCallback((item: T | null) => {
        setActiveRowKey(item ? getRowKey(item) : null);
    }, [getRowKey]);

    const isActiveRow = useCallback((item: T) => {
        return activeRowKey === getRowKey(item);
    }, [activeRowKey, getRowKey]);

    return {
        selectedKeys,
        activeRowKey,
        selectedItems,
        isRowChecked,
        isActiveRow,
        handleSelectAllChange,
        toggleRowSelection,
        unselectAll,
        setActiveRow
    };
};
