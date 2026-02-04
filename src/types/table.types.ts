import type { ReactNode } from 'react';
import type { FilterState, FilterOperator, FilterType } from '@/hooks/table/useTableFiltering';

export interface TableColumn {
    field: string;
    header: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    formatter?: (value: any, row?: any) => string;
    filterType?: FilterType;
    filterOptions?: Array<{ label: string; value: any }>;
    pinnable?: boolean;
    cellRender?: (ctx: { value: any; item: any; column: TableColumn; rowIndex: number }) => ReactNode;
    headerRender?: (ctx: { column: TableColumn }) => ReactNode;
    backendField?: string; // Map frontend field to different backend field name
    valueTransformer?: (value: any) => any; // Transform filter value before sending to backend
}

export interface BatchAction {
    label: string;
    icon: string;
    variant: 'success' | 'danger' | 'neutral';
    action: (selectedItems: any[]) => void;
    shortkey?: string;
}

export type SortDirection = 'asc' | 'desc';
export type FilterStateMap = Record<string, FilterState>;
export type FilterOperatorType = FilterOperator;
