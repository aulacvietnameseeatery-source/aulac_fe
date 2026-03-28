import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '../button';
import { Input } from '../input';
import { Select } from '../select';
import { X } from 'lucide-react';
import type { TableColumn } from '@/types/table.types';
import type { FilterState } from '@/hooks/table/useTableFiltering';

interface FilterPopupProps {
    column: TableColumn;
    filterState: FilterState;
    onApply: (state: FilterState) => void;
    onClear: () => void;
    onClose: () => void;
}

export const FilterPopup: React.FC<FilterPopupProps> = ({
    column,
    filterState: initialState,
    onApply,
    onClear,
    onClose
}) => {
    const [localState, setLocalState] = useState<FilterState>(initialState);
    const t = useTranslations('common.table.filter');
    const tOp = useTranslations('common.table.operator');

    const getFilterOperatorOptions = () => {
        const commonOpts = [
            { label: tOp('isNull'), value: 'isNull' },
            { label: tOp('notNull'), value: 'notNull' },
        ];
        const isNumericOrDate = column.filterType === 'number' || column.filterType === 'date';
        const specificOptions = isNumericOrDate
            ? [
                { label: tOp('equals'), value: 'equals' },
                { label: tOp('different'), value: 'different' },
                { label: tOp('greater'), value: 'greater' },
                { label: tOp('less'), value: 'less' },
                { label: tOp('greaterOrEqual'), value: 'greaterOrEqual' },
                { label: tOp('lessOrEqual'), value: 'lessOrEqual' },
            ]
            : [
                { label: tOp('contains'), value: 'contains' },
                { label: tOp('notContains'), value: 'notContains' },
                { label: tOp('startsWith'), value: 'startsWith' },
                { label: tOp('endsWith'), value: 'endsWith' },
                { label: tOp('equals'), value: 'equals' },
                { label: tOp('notequal'), value: 'notequal' },
            ];

        return [...commonOpts, ...specificOptions];
    };

    const handleApply = () => {
        onApply(localState);
        onClose();
    };

    const handleClear = () => {
        onClear();
        onClose();
    };

    return (
        <div className="p-4 min-w-75 max-w-87.5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-base">{t('title', { column: column.header })}</h3>
                <button
                    onClick={onClose}
                    data-tooltip-content={t('close')}
                    data-tooltip-id="my-tooltip"
                    aria-label={t('close')}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {column.filterType === 'select' ? (
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">{t('value')}</label>
                        <Select
                            value={localState.value}
                            options={column.filterOptions || []}
                            onChange={(val) => setLocalState(prev => ({
                                ...prev,
                                value: String(val),
                                operator: 'selected'
                            }))}
                            placeholder={t('selectPlaceholder')}
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">{t('condition')}</label>
                            <Select
                                value={localState.operator}
                                options={getFilterOperatorOptions()}
                                onChange={(val) => setLocalState(prev => ({
                                    ...prev,
                                    operator: val as any
                                }))}
                            />
                        </div>

                        {localState.operator !== 'isNull' && localState.operator !== 'notNull' && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">{t('value')}</label>
                                <Input
                                    type={column.filterType === 'number' ? 'number' : column.filterType === 'date' ? 'date' : 'text'}
                                    value={localState.value}
                                    onChange={(e) => setLocalState(prev => ({
                                        ...prev,
                                        value: e.target.value
                                    }))}
                                    placeholder={t('placeholder')}
                                />
                            </div>
                        )}
                    </>
                )}

                <div className="flex justify-between gap-2 mt-2">
                    <Button
                        variant="outline"
                        onClick={handleClear}
                        className="flex-1"
                        data-tooltip-content={t('clear')}
                        data-tooltip-id="my-tooltip"
                    >
                        {t('clear')}
                    </Button>
                    <div className="flex gap-2 flex-1">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1"
                            data-tooltip-content={t('cancel')}
                            data-tooltip-id="my-tooltip"
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleApply}
                            className="flex-1"
                            data-tooltip-content={t('apply')}
                            data-tooltip-id="my-tooltip"
                        >
                            {t('apply')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
