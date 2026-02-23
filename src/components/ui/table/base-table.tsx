'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import { useTableColumnSizing } from '@/hooks/table/useTableColumnSizing';
import { useTableFiltering } from '@/hooks/table/useTableFiltering';
import type { TableColumn, BatchAction } from '@/types/table.types';
import type { SortStateItem } from '@/hooks/table/useTableSorting';
import type { FilterState } from '@/hooks/table/useTableFiltering';
import { cn } from '@/lib/utils';
import { NoDataState } from '@/components/ui/table/no-data-state';
import { TablePagination } from '@/components/ui/table/table-pagination';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { FilterPopup } from '@/components/ui/table/filter-popup';
import '@/styles/components/table.css';
import { useTranslations } from 'next-intl';



// ========== CONSTANTS ==========
const CHECKBOX_COLUMN_WIDTH = 40;
const SEARCH_DEBOUNCE_MS = 1000;
const DEFAULT_COLUMN_WIDTH = 160;

/**
 * Cấu hình các operator cho filter
 * Created by: DatND (18/1/2026)
 */
const OPERATOR_LABELS: Record<string, string> = {
    contains: 'Chứa',
    notContains: 'Không chứa',
    equals: 'Bằng',
    notequal: 'Khác',
    different: 'Khác',
    startsWith: 'Bắt đầu bằng',
    endsWith: 'Kết thúc bằng',
    greater: 'Lớn hơn',
    less: 'Nhỏ hơn',
    greaterOrEqual: 'Lớn hơn hoặc bằng',
    lessOrEqual: 'Nhỏ hơn hoặc bằng',
    isNull: 'Trống',
    notNull: 'Không trống',
    selected: 'Đã chọn',
};

// ========== PROPS & TYPES ==========
interface BaseTableProps<T> {
    data: T[];
    columns: TableColumn[];
    loading?: boolean;
    searchPlaceholder?: string;
    showAddButton?: boolean;
    addButtonText?: string;
    batchActions?: BatchAction[];
    rowsPerPageOptions?: number[];
    defaultRowsPerPage?: number;
    selectionMode?: 'single' | 'multiple';
    activeRowKey?: string | number | null;
    rowKey?: string;
    total?: number;
    onAdd?: () => void;
    onEdit?: (item: T, rowIndex: number) => void;
    onRefresh?: () => void;
    onSelectionChange?: (items: T[]) => void;
    onDataChange?: (params: {
        search?: string;
        filters?: Record<string, FilterState>;
        sort?: SortStateItem[];
        page?: number;
        pageSize?: number;
    }) => void;
    // Render props for customization
    renderTitle?: () => React.ReactNode;
    renderToolbarAppend?: (props: { unselectAll: () => void; selectedItems: T[]; batchActions?: BatchAction[] }) => React.ReactNode;
    renderCell?: (field: string, value: any, item: T, column: TableColumn, rowIndex: number) => React.ReactNode;
    renderHeader?: (field: string, column: TableColumn) => React.ReactNode;
    renderActionColumn?: (item: T, rowIndex: number) => React.ReactNode;
    renderNoData?: () => React.ReactNode;
    renderPaginationAppend?: () => React.ReactNode;
}

export function BaseTable<T>({
    data,
    columns,
    loading = false,
    searchPlaceholder = 'Tìm kiếm',
    showAddButton = true,
    addButtonText = 'Thêm',
    batchActions = [],
    rowsPerPageOptions = [10, 20, 30, 50, 100],
    defaultRowsPerPage = 10,
    selectionMode = 'multiple',
    activeRowKey: externalActiveRowKey,
    rowKey = 'id',
    total = 0,
    onAdd,
    onEdit,
    onRefresh,
    onSelectionChange,
    onDataChange,
    renderTitle,
    renderToolbarAppend,
    renderCell,
    renderHeader,
    renderActionColumn,
    renderNoData,
    renderPaginationAppend,
}: BaseTableProps<T>) {
    const t = useTranslations('common.table');

    const operatorLabels = useMemo<Record<string, string>>(() => ({
        contains: t('operator.contains'),
        notContains: t('operator.notContains'),
        equals: t('operator.equals'),
        notequal: t('operator.notequal'),
        different: t('operator.different'),
        startsWith: t('operator.startsWith'),
        endsWith: t('operator.endsWith'),
        greater: t('operator.greater'),
        less: t('operator.less'),
        greaterOrEqual: t('operator.greaterOrEqual'),
        lessOrEqual: t('operator.lessOrEqual'),
        isNull: t('operator.isNull'),
        notNull: t('operator.notNull'),
        selected: t('operator.selected'),
    }), [t]);

    // ========== COMPOSABLES ==========
    const {
        filters,
        applyFilter,
        clearFilter,
        clearAllFilters,
        hasActiveFilters,
        isFilterActive,
        getFilterState: getFilterStateFromComposable,
        updateFilterState
    } = useTableFiltering();

    const getRowKey = useCallback((item: any): string | number => {
        const key = item?.[rowKey];
        return key ?? JSON.stringify(item);
    }, [rowKey]);

    const {
        columnWidths,
        initWidths,
        getColumnWidth,
        startResize,
    } = useTableColumnSizing({
        getInitialWidth: (field) => {
            const col = columns.find(c => c.field === field);
            if (col?.width) {
                return parseInt(col.width);
            }
            return DEFAULT_COLUMN_WIDTH;
        }
    });

    const {
        selectedKeys,
        activeRowKey,
        selectedItems,
        isRowChecked,
        isActiveRow,
        handleSelectAllChange,
        toggleRowSelection,
        unselectAll,
        setActiveRow
    } = useTableSelection({
        data,
        selectionMode,
        getRowKey,
        onSelectionChange
    });

    // ========== REACTIVE STATE ==========
    const [searchQuery, setSearchQuery] = useState('');
    const [pageSize, setPageSize] = useState(defaultRowsPerPage ?? 10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortState, setSortState] = useState<SortStateItem[]>([]);
    const [pinnedColumns, setPinnedColumns] = useState<string[]>([]);

    /**
     * Single popover state - tracks which column and type (filter/sort) is open
     * This ensures only one popover is open at a time across all columns
     * @property {string} field - The column field that has an active popover
     * @property {'filter' | 'sort'} type - The type of popover (filter or sort menu)
     */
    const [activePopover, setActivePopover] = useState<{
        field: string;
        type: 'filter' | 'sort';
    } | null>(null);

    const searchDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ========== COMPUTED PROPERTIES ==========
    const orderedColumns = useMemo(() => {
        const pinned = columns.filter(col => pinnedColumns.includes(col.field));
        const rest = columns.filter(col => !pinnedColumns.includes(col.field));
        return [...pinned, ...rest];
    }, [columns, pinnedColumns]);

    const stickyOffsets = useMemo(() => {
        const offsets: Record<string, number> = {};
        let left = CHECKBOX_COLUMN_WIDTH;

        orderedColumns.forEach(col => {
            if (pinnedColumns.includes(col.field)) {
                offsets[col.field] = left;
                left += getColumnWidth(col.field);
            }
        });

        return offsets;
    }, [orderedColumns, pinnedColumns, getColumnWidth]);

    const selectAllChecked = useMemo(
        () => data.length > 0 && data.every(item => selectedKeys.has(getRowKey(item))),
        [data, selectedKeys, getRowKey]
    );

    const columnStyles = useMemo(() => {
        const map: Record<string, React.CSSProperties> = {};

        orderedColumns.forEach(column => {
            const width = getColumnWidth(column.field);
            const isPinned = pinnedColumns.includes(column.field);

            map[column.field] = {
                width: `${width}px`,
                minWidth: `${width}px`,
                maxWidth: `${width}px`,
                ...(isPinned && { left: `${stickyOffsets[column.field]}px` }),
            };
        });

        return map;
    }, [orderedColumns, getColumnWidth, pinnedColumns, stickyOffsets]);

    // ========== HELPERS ==========
    const isPinned = useCallback((column: TableColumn) => pinnedColumns.includes(column.field), [pinnedColumns]);

    const getFilterState = useCallback((column: TableColumn): FilterState => {
        return getFilterStateFromComposable(column.field, column.filterType);
    }, [getFilterStateFromComposable]);

    const getSortDirection = useCallback((field: string) => {
        return sortState.find(item => item.field === field)?.direction ?? null;
    }, [sortState]);

    const getFilterLabel = useCallback((field: string, filter: FilterState) => {
        const column = columns.find(col => col.field === field);
        if (!column) return null;

        let valueLabel = '';
        if (filter.operator === 'isNull' || filter.operator === 'notNull') {
            valueLabel = '';
        } else if (column.filterType === 'select' && column.filterOptions) {
            const option = column.filterOptions.find(opt => opt.value === filter.value);
            valueLabel = option ? option.label : filter.value;
        } else {
            valueLabel = filter.value;
        }

        return {
            header: column.header,
            operatorLabel: operatorLabels[filter.operator] || filter.operator,
            valueLabel
        };
    }, [columns]);

    const filterLabels = useMemo(() =>
        Object.entries(filters).map(([field, filter]) => ({
            field,
            filter,
            label: getFilterLabel(field, filter)
        }))
        , [filters, getFilterLabel]);

    const totalCount = useMemo(() => total || data.length, [total, data.length]);

    const pageInfo = useMemo(() => {
        const totalRecs = totalCount;
        if (!totalRecs) return '0 - 0';

        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, totalRecs);
        return `${start} - ${end}`;
    }, [currentPage, pageSize, totalCount]);

    const emitDataChange = useCallback(() => {
        onDataChange?.({
            search: searchQuery,
            filters,
            sort: sortState,
            page: currentPage,
            pageSize
        });
    }, [searchQuery, filters, sortState, currentPage, pageSize, onDataChange]);

    // ========== HANDLERS ==========
    const handleBatchAction = useCallback((action: BatchAction) => {
        if (selectedItems.length) {
            action.action(selectedItems);
        }
    }, [selectedItems]);

    const handleRowClick = useCallback((item: T, rowIndex: number) => {
        setActiveRow(item);
        if (selectionMode === 'single') {
            toggleRowSelection(item, !isRowChecked(item));
        }
    }, [setActiveRow, selectionMode, toggleRowSelection, isRowChecked]);

    const handleEdit = useCallback((item: T, rowIndex: number) => {
        onEdit?.(item, rowIndex);
    }, [onEdit]);

    const handleSort = useCallback((field: string, direction: 'asc' | 'desc' | null) => {
        if (direction === null) {
            setSortState(prev => prev.filter(s => s.field !== field));
        } else {
            setSortState(prev => {
                const next = prev.filter(s => s.field !== field);
                next.push({ field, direction });
                return next;
            });
        }
        setActivePopover(null); // Close popover after sorting
        emitDataChange();
    }, [emitDataChange]);

    // ========== POPOVER CONTROL HANDLERS ==========
    /**
     * Opens the filter popover for a specific column
     * Automatically closes any other open popovers
     */
    const openFilterPopover = useCallback((field: string) => {
        setActivePopover({ field, type: 'filter' });
    }, []);

    /**
     * Opens the sort popover for a specific column
     * Automatically closes any other open popovers
     */
    const openSortPopover = useCallback((field: string) => {
        setActivePopover({ field, type: 'sort' });
    }, []);

    /**
     * Checks if a specific popover is currently open
     * @param field - The column field to check
     * @param type - The type of popover to check ('filter' or 'sort')
     * @returns true if the specified popover is open
     */
    const isPopoverOpen = useCallback((field: string, type: 'filter' | 'sort') => {
        return activePopover?.field === field && activePopover?.type === type;
    }, [activePopover]);

    const handleApplyFilter = useCallback((field: string, state: FilterState) => {
        applyFilter(field, state);
        setCurrentPage(1);
        setActivePopover(null); // Close popover after applying
        emitDataChange();
    }, [applyFilter, emitDataChange]);

    const handleClearFilter = useCallback((field: string) => {
        clearFilter(field);
        setCurrentPage(1);
        setActivePopover(null); // Close popover after clearing
        emitDataChange();
    }, [clearFilter, emitDataChange]);

    const handleClearAllFilters = useCallback(() => {
        clearAllFilters();
        setCurrentPage(1);
        emitDataChange();
    }, [clearAllFilters, emitDataChange]);

    const togglePin = useCallback((field: string) => {
        setPinnedColumns(prev => {
            const pinned = new Set(prev);
            if (pinned.has(field)) {
                pinned.delete(field);
            } else {
                pinned.add(field);
            }
            return Array.from(pinned);
        });
    }, []);

    const handlePageChange = useCallback((action: 'first' | 'prev' | 'next' | 'last') => {
        const totalPages = Math.ceil(totalCount / pageSize);

        switch (action) {
            case 'first':
                setCurrentPage(1);
                break;
            case 'prev':
                setCurrentPage(prev => Math.max(1, prev - 1));
                break;
            case 'next':
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                break;
            case 'last':
                setCurrentPage(totalPages);
                break;
        }
    }, [totalCount, pageSize]);

    // ========== EFFECTS ==========
    useEffect(() => {
        emitDataChange();
    }, [currentPage, emitDataChange])

    useEffect(() => {
        if (searchDebounceTimeoutRef.current) {
            clearTimeout(searchDebounceTimeoutRef.current);
        }
        searchDebounceTimeoutRef.current = setTimeout(() => {
            setCurrentPage(1);
            emitDataChange();
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            if (searchDebounceTimeoutRef.current) {
                clearTimeout(searchDebounceTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
        emitDataChange();
    }, [pageSize]);

    useEffect(() => {
        if (externalActiveRowKey !== undefined) {
            const item = data.find(item => getRowKey(item) === externalActiveRowKey);
            setActiveRow(item || null);
        }
    }, [externalActiveRowKey, data, getRowKey, setActiveRow]);

    useEffect(() => {
        initWidths(columns.map(col => col.field));
        emitDataChange();
    }, []);

    // ========== RENDER ==========
    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-row justify-between items-center mb-4">
                {renderTitle?.()}
            </div>
            <div className="body-layout-list">
                <div className="body-list">
                    <div className="form-list flex flex-column">
                        <div className="flex flex-column w-full">
                            {/* Toolbar */}
                            <div className="condition-box flex flex-row items-center w-full">
                                <div className="flex gap-2 items-center">
                                    <div className="ms-input ms-editor w-full flex items-center gap-4 search-input-list max-h-4" style={{ height: 'auto' }}>
                                        <div className="flex-1 flex items-center input-container border pointer">
                                            <div className="mi icon16 icon left search"></div>
                                            <input
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="ms-input-item flex w-full"
                                                placeholder={searchPlaceholder}
                                                type="text"
                                                autoComplete="on"
                                            />
                                        </div>
                                    </div>

                                    {hasActiveFilters && selectedItems.length === 0 && (
                                        <div>
                                            <div className="filter-conditions h-full">
                                                {filterLabels.map(({ filter, field, label }) => (
                                                    label && (
                                                        <div key={field} className="filter-item">
                                                            <div className="lable-value-filter">
                                                                <span>{label.header}</span>
                                                                {label.operatorLabel && filter.operator !== 'selected' && (
                                                                    <span style={{ color: '#009B71' }}>
                                                                        {label.operatorLabel}
                                                                    </span>
                                                                )}
                                                                <span style={filter.operator === 'selected' ? { color: '#009B71' } : {}}>
                                                                    {label.valueLabel}
                                                                </span>
                                                            </div>
                                                            <div
                                                                className="mi icon16 pointer close"
                                                                onClick={() => handleClearFilter(field as string)}
                                                            ></div>
                                                        </div>
                                                    )
                                                ))}
                                                <div className="delete-all-filter" onClick={handleClearAllFilters}>
                                                    {t('clearFilter')}
                                                </div>
                                            </div>
                                        </div>

                                    )}

                                    {selectedItems.length > 0 && (
                                        <div className="feature-batch flex">
                                            <div className="selected-count">
                                                {t('selected')} <span className="font-bold">{selectedItems.length}</span>
                                            </div>
                                            <div className="unselected" onClick={unselectAll}>{t('unselect')}</div>

                                            {batchActions.map((action) => (
                                                <button
                                                    key={action.label}
                                                    className={cn(
                                                        "ms-button",
                                                        `btn-outline-${action.variant || 'neutral'}`
                                                    )}
                                                    onClick={() => handleBatchAction(action)}
                                                >
                                                    <div
                                                        className={cn(
                                                            "icon left mi icon16",
                                                            action.icon,
                                                            action.variant === 'success' && 'green',
                                                            action.variant === 'danger' && 'red'
                                                        )}
                                                    ></div>
                                                    <div className="text text-nowrap pl-1">{action.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {renderToolbarAppend?.({ unselectAll, selectedItems, batchActions })}
                                </div>

                                {selectedItems.length === 0 && (
                                    <div className="action flex items-center flex-row">
                                        <button
                                            className="ms-button btn-outline-neutral only-icon"
                                            onClick={onRefresh}
                                            title={t('refresh')}
                                        >
                                            <div className="icon reload mi icon16">&nbsp;</div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="voucher-body-grid">
                        <div className="ms-grid-viewer flex flex-col has-paging flex-box">
                            <div 
                                className={cn("ms-content-table sticky-1", !loading && "scroller")}
                                style={loading ? { overflow: 'hidden' } : undefined}
                            >
                                <div className="grid-scroll">
                                    <table className="ms-table table-resizable">
                                        {/* Table Header */}
                                        <thead className="ms-thead">
                                            <tr className="ms-tr">
                                                <th className="ms-th multiple-cell sticky ms-th-col" rowSpan={0} scope="col">
                                                    <Checkbox
                                                        checked={selectAllChecked}
                                                        onCheckedChange={(checked) => handleSelectAllChange(data, checked)}
                                                    />
                                                </th>

                                                {orderedColumns.map((column) => (
                                                    <th
                                                        key={column.field}
                                                        className={cn(
                                                            "ms-col-th ms-th",
                                                            isPinned(column) && "lock"
                                                        )}
                                                        style={columnStyles[column.field]}
                                                    >
                                                        <div className="ms-th-content flex-row">
                                                            {/* Sort Menu with Popover - Wraps entire header for clickable area */}
                                                            <Popover
                                                                open={isPopoverOpen(column.field, 'sort')}
                                                                onOpenChange={(open: boolean) => {
                                                                    if (open) {
                                                                        openSortPopover(column.field);
                                                                    } else {
                                                                        setActivePopover(null);
                                                                    }
                                                                }}
                                                            >
                                                                <PopoverTrigger asChild>
                                                                    <div className="th-trigger" role="button" tabIndex={0}>
                                                                        <div className="menu-wrapper">
                                                                            <div className="menu-button-container">
                                                                                <div className="ms-th-title flex flex-between">
                                                                                    <div className="w-full">
                                                                                        <div
                                                                                            className={cn(
                                                                                                "caption_arrow_wrap",
                                                                                                column.align === 'center' ? 'justify-center' :
                                                                                                    column.align === 'right' ? 'justify-end' :
                                                                                                        'justify-start'
                                                                                            )}
                                                                                            style={{ textAlign: column.align || 'left' }}
                                                                                        >
                                                                                            {isPinned(column) && (
                                                                                                <div className="mi icon16 pinned"></div>
                                                                                            )}
                                                                                            <span className="caption-btn flex">
                                                                                                {renderHeader ? renderHeader(column.field, column) : column.header}
                                                                                            </span>
                                                                                            {getSortDirection(column.field) === 'asc' && (
                                                                                                <div className="ms-th-title-icon justify-center">
                                                                                                    <div className="mi icon16 arrow-up"></div>
                                                                                                </div>
                                                                                            )}
                                                                                            {getSortDirection(column.field) === 'desc' && (
                                                                                                <div className="ms-th-title-icon justify-center">
                                                                                                    <div className="mi icon16 arrow-down"></div>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </PopoverTrigger>
                                                                <PopoverContent align="start" className="p-0 w-auto">
                                                                    <ul className="menu-wrapper-menu" role="menu">
                                                                        {column.sortable !== false && (
                                                                            <>
                                                                                <li
                                                                                    className="menu-wrapper-item flex menu-wrapper-item-icon"
                                                                                    role="menuitem"
                                                                                    tabIndex={-1}
                                                                                    onClick={() => handleSort(column.field, null)}
                                                                                >
                                                                                    <div className="mi icon16 menu-item-ic empty"></div>
                                                                                    <div className="menu-item-content">{t('sort.none')}</div>
                                                                                </li>
                                                                                <li
                                                                                    className={cn(
                                                                                        "menu-wrapper-item flex menu-wrapper-item-icon",
                                                                                        getSortDirection(column.field) === 'asc' && 'checked'
                                                                                    )}
                                                                                    role="menuitem"
                                                                                    tabIndex={-1}
                                                                                    onClick={() => handleSort(column.field, 'asc')}
                                                                                >
                                                                                    <div className="mi icon16 menu-item-ic arrow-up"></div>
                                                                                    <div className="menu-item-content">{t('sort.asc')}</div>
                                                                                </li>
                                                                                <li
                                                                                    className={cn(
                                                                                        "menu-wrapper-item flex menu-wrapper-item-icon",
                                                                                        getSortDirection(column.field) === 'desc' && 'checked'
                                                                                    )}
                                                                                    role="menuitem"
                                                                                    tabIndex={-1}
                                                                                    onClick={() => handleSort(column.field, 'desc')}
                                                                                >
                                                                                    <div className="mi icon16 menu-item-ic arrow-down"></div>
                                                                                    <div className="menu-item-content">{t('sort.desc')}</div>
                                                                                </li>
                                                                                <div className="menu-border"></div>
                                                                            </>
                                                                        )}
                                                                        {column.pinnable !== false && (
                                                                            <>
                                                                                <li
                                                                                    className={cn(
                                                                                        "menu-wrapper-item flex menu-wrapper-item-icon",
                                                                                        pinnedColumns.includes(column.field) && 'checked'
                                                                                    )}
                                                                                    role="menuitem"
                                                                                    tabIndex={-1}
                                                                                    onClick={() => togglePin(column.field)}
                                                                                >
                                                                                    <div className="mi icon16 menu-item-ic pin"></div>
                                                                                    <div className="menu-item-content">{t('pin')}</div>
                                                                                </li>
                                                                                <li
                                                                                    className="menu-wrapper-item flex menu-wrapper-item-icon"
                                                                                    role="menuitem"
                                                                                    tabIndex={-1}
                                                                                    onClick={() => togglePin(column.field)}
                                                                                >
                                                                                    <div className="mi icon16 menu-item-ic unpin"></div>
                                                                                    <div className="menu-item-content">{t('unpin')}</div>
                                                                                </li>
                                                                            </>
                                                                        )}
                                                                    </ul>
                                                                </PopoverContent>
                                                            </Popover>

                                                            {/* Filter Button with Popover */}
                                                            <div className="ms-th-title-icon justify-center">
                                                                {column.filterType && (
                                                                    <Popover
                                                                        open={isPopoverOpen(column.field, 'filter')}
                                                                        onOpenChange={(open: boolean) => {
                                                                            if (open) {
                                                                                openFilterPopover(column.field);
                                                                            } else {
                                                                                setActivePopover(null);
                                                                            }
                                                                        }}

                                                                    >
                                                                        <PopoverTrigger asChild>
                                                                            <button
                                                                                className="filter-btn"
                                                                                type="button"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <div
                                                                                    className={cn(
                                                                                        "mi icon16",
                                                                                        !isFilterActive(column.field) ? "filter--default" : "filter--active"
                                                                                    )}
                                                                                ></div>
                                                                            </button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent align="end" className="p-0">
                                                                            <FilterPopup
                                                                                column={column}
                                                                                filterState={getFilterState(column)}
                                                                                onApply={(state) => handleApplyFilter(column.field, state)}
                                                                                onClear={() => handleClearFilter(column.field)}
                                                                                onClose={() => setActivePopover(null)}
                                                                            />
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                )}
                                                            </div>

                                                            <div
                                                                className="ms-resize"
                                                                onMouseDown={(e) => {
                                                                    e.stopPropagation();
                                                                    startResize(column.field, e.clientX);
                                                                }}
                                                            />
                                                        </div>
                                                    </th>
                                                ))}

                                                {renderActionColumn && (
                                                    <th
                                                        className="ms-th widget-title"
                                                        rowSpan={0}
                                                        scope="col"
                                                        style={{ width: '100px', minWidth: '100px' }}
                                                    />
                                                )}
                                            </tr>
                                        </thead>

                                        {/* Table Body */}
                                        <tbody className={`ms-tbody data ${loading ? 'loading' : ''}`}>
                                            {loading ? (
                                                // Loading Skeleton
                                                Array.from({ length: pageSize }).map((_, n) => (
                                                    <tr key={`shimmer-${n}`} className="ms-tr">
                                                        <td style={{ width: '40px', minWidth: '40px', borderRight: '1px dotted rgb(193, 196, 204)' }}>
                                                            <div className="shimmer"></div>
                                                        </td>
                                                        {orderedColumns.map((column) => (
                                                            <td
                                                                key={`shimmer-${column.field}`}
                                                                style={{
                                                                    ...columnStyles[column.field],
                                                                    borderRight: '1px dotted rgb(193, 196, 204)'
                                                                }}
                                                            >
                                                                <div className="shimmer"></div>
                                                            </td>
                                                        ))}
                                                        {renderActionColumn && (
                                                            <td
                                                                className="sticky"
                                                                style={{
                                                                    width: '100px',
                                                                    minWidth: '100px',
                                                                    maxWidth: '100px',
                                                                    borderRight: '1px dotted rgb(193, 196, 204)'
                                                                }}
                                                            >
                                                                <div className="shimmer"></div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            ) : (
                                                // Actual Data
                                                data.map((item, rowIndex) => {
                                                    const key = getRowKey(item);
                                                    const isActive = isActiveRow(item);
                                                    const isChecked = isRowChecked(item);

                                                    return (
                                                        <tr
                                                            key={key}
                                                            className={cn(
                                                                "ms-tr",
                                                                isActive && "row-selected",
                                                                isChecked && "row-checked"
                                                            )}
                                                            onClick={() => handleRowClick(item, rowIndex)}
                                                        >
                                                            <td
                                                                className="ms-td multiple-cell sticky ms-col-td-multiple"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Checkbox
                                                                    checked={isChecked}
                                                                    onCheckedChange={(checked) => toggleRowSelection(item, checked)}
                                                                />
                                                            </td>

                                                            {orderedColumns.map((column) => (
                                                                <td
                                                                    key={column.field}
                                                                    className={cn(
                                                                        "ms-td ms-col-td",
                                                                        isPinned(column) && "lock sticky"
                                                                    )}
                                                                    style={columnStyles[column.field]}
                                                                    onDoubleClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEdit(item, rowIndex);
                                                                    }}
                                                                >
                                                                    <div>
                                                                        {renderCell ? (
                                                                            renderCell(column.field, (item as any)[column.field], item, column, rowIndex)
                                                                        ) : (
                                                                            <div
                                                                                className="text-overflow"
                                                                                title={column.formatter ? column.formatter((item as any)[column.field], item) : (item as any)[column.field]}
                                                                            >
                                                                                <span
                                                                                    className={`text-${column.align || 'left'}`}
                                                                                    style={{ textAlign: column.align || 'left' }}
                                                                                >
                                                                                    <span className="text-view">
                                                                                        <div>
                                                                                            {column.formatter ? column.formatter((item as any)[column.field], item) : (item as any)[column.field]}
                                                                                        </div>
                                                                                    </span>
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            ))}

                                                            {renderActionColumn && (
                                                                <td
                                                                    className="ms-td widget-item sticky"
                                                                    style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}
                                                                >
                                                                    {renderActionColumn(item, rowIndex)}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {data.length === 0 && !loading && (
                                renderNoData ? renderNoData() : <NoDataState />
                            )}

                            {/* Pagination */}
                            <TablePagination
                                totalCount={totalCount}
                                pageSize={pageSize}
                                pageSizes={rowsPerPageOptions}
                                pageInfo={pageInfo}
                                hasPrev={currentPage > 1}
                                hasNext={currentPage * pageSize < totalCount}
                                onPageSizeChange={setPageSize}
                                onPageChange={handlePageChange}
                            >
                                {renderPaginationAppend?.()}
                            </TablePagination>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
