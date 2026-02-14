import React from 'react';
import { useTranslations } from 'next-intl';
import { Select, SelectOption } from '../select';
import { Button } from '../button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface TablePaginationProps {
    totalCount: number;
    pageSize: number;
    pageSizes: number[];
    pageInfo: string;
    hasPrev: boolean;
    hasNext: boolean;
    onPageSizeChange: (value: number) => void;
    onPageChange: (action: 'first' | 'prev' | 'next' | 'last') => void;
    children?: React.ReactNode;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
    totalCount,
    pageSize,
    pageSizes,
    pageInfo,
    hasPrev,
    hasNext,
    onPageSizeChange,
    onPageChange,
    children
}) => {
    const t = useTranslations('common.table.pagination');

    const pageSizeOptions: SelectOption[] = pageSizes.map(size => ({
        label: size.toString(),
        value: size
    }));

    return (
        <div className="flex flex-row justify-between items-center px-4 py-2 bg-gray-100 rounded-b min-h-[44px]">
            <div className="flex items-center sticky left-4">
                <span className="text-navy-DEFAULT text-sm">{t('total')}</span>
                <span className="ml-1 font-bold text-gray-900 text-sm">{totalCount}</span>
            </div>

            <div className="flex items-center justify-end gap-4 sticky right-4 min-w-[350px]">
                <span className="text-sm text-navy-DEFAULT">{t('pageSize')}</span>
                <div className="w-20">
                    <Select
                        value={pageSize}
                        options={pageSizeOptions}
                        onChange={(val) => onPageSizeChange(typeof val === 'number' ? val : Number(val))}
                    />
                </div>
                <span className="font-bold text-sm">{pageInfo}</span>
                <div className="flex items-center gap-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!hasPrev}
                        onClick={() => onPageChange('first')}
                        className="h-8 w-8"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!hasPrev}
                        onClick={() => onPageChange('prev')}
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!hasNext}
                        onClick={() => onPageChange('next')}
                        className="h-8 w-8"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!hasNext}
                        onClick={() => onPageChange('last')}
                        className="h-8 w-8"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
                {children}
            </div>
        </div>
    );
};
