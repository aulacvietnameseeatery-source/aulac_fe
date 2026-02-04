import React, { useState } from 'react';
import { Button } from '../button';
import { Input } from '../input';
import { Select } from '../select';
import { X } from 'lucide-react';
import type { TableColumn } from '@/types/table.types';
import type { FilterState } from '@/hooks/table/useTableFiltering';

const FILTER_OPERATOR_OPTIONS = {
    common: [
        { label: '(Trống)', value: 'isNull' },
        { label: '(Không trống)', value: 'notNull' }
    ],
    number: [
        { label: 'Bằng', value: 'equals' },
        { label: 'Khác', value: 'different' },
        { label: 'Lớn hơn', value: 'greater' },
        { label: 'Nhỏ hơn', value: 'less' },
        { label: 'Lớn hơn hoặc bằng', value: 'greaterOrEqual' },
        { label: 'Nhỏ hơn hoặc bằng', value: 'lessOrEqual' }
    ],
    text: [
        { label: 'Chứa', value: 'contains' },
        { label: 'Không chứa', value: 'notContains' },
        { label: 'Bắt đầu bằng', value: 'startsWith' },
        { label: 'Kết thúc bằng', value: 'endsWith' },
        { label: 'Bằng', value: 'equals' },
        { label: 'Khác', value: 'notequal' }
    ]
} as const;

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

    const getFilterOperatorOptions = () => {
        const isNumericOrDate = column.filterType === 'number' || column.filterType === 'date';
        const specificOptions = isNumericOrDate
            ? FILTER_OPERATOR_OPTIONS.number
            : FILTER_OPERATOR_OPTIONS.text;

        return [...FILTER_OPERATOR_OPTIONS.common, ...specificOptions];
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
        <div className="p-4 min-w-[300px] max-w-[350px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-base">Lọc {column.header}</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {column.filterType === 'select' ? (
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Giá trị</label>
                        <Select
                            value={localState.value}
                            options={column.filterOptions || []}
                            onChange={(val) => setLocalState(prev => ({ 
                                ...prev, 
                                value: String(val),
                                operator: 'selected' 
                            }))}
                            placeholder="Chọn giá trị..."
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Điều kiện</label>
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
                                <label className="text-sm font-medium">Giá trị</label>
                                <Input
                                    type={column.filterType === 'number' ? 'number' : column.filterType === 'date' ? 'date' : 'text'}
                                    value={localState.value}
                                    onChange={(e) => setLocalState(prev => ({ 
                                        ...prev, 
                                        value: e.target.value 
                                    }))}
                                    placeholder="Nhập giá trị lọc"
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
                    >
                        Bỏ lọc
                    </Button>
                    <div className="flex gap-2 flex-1">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleApply}
                            className="flex-1"
                        >
                            Áp dụng
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
