import { BatchAction } from '@/types/table.types';
import { DishCategory } from '../types';

interface UseStatusBatchActionsProps {
    t: (key: string) => string;
    onUpdate: (items: DishCategory[], isDisabled: boolean) => void;
}

export const useStatusBatchActions = ({ t, onUpdate }: UseStatusBatchActionsProps): BatchAction[] => {
    return [
        {
            label: t('batchActions.activate'),
            icon: 'check',
            variant: 'success',
            buttonType: 'solid',
            className: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
            action: (items) => onUpdate(items as DishCategory[], false), // false = active
        },
        {
            label: t('batchActions.deactivate'),
            icon: 'close',
            variant: 'danger',
            buttonType: 'solid',
            className: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
            action: (items) => onUpdate(items as DishCategory[], true), // true = disabled
        },
    ];
};
