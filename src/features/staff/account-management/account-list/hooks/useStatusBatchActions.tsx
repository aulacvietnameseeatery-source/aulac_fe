
import { BatchAction } from '@/types/table.types';
import { StaffAccount } from '@/features/staff/account-management/account-list/types/staff-account.types';

interface UseStatusBatchActionsProps {
    t: (key: string) => string;
    onUpdate: (items: StaffAccount[], status: "ACTIVE" | "INACTIVE") => void;
}

export const useStatusBatchActions = ({ t, onUpdate }: UseStatusBatchActionsProps): BatchAction[] => {
    return [
        {
            label: t('batchActions.activate'),
            icon: 'check',
            variant: 'success',
            buttonType: 'solid',
            className: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
            action: (items) => onUpdate(items as StaffAccount[], "ACTIVE"),
        },
        {
            label: t('batchActions.deactivate'),
            icon: 'close',
            variant: 'danger',
            buttonType: 'solid',
            className: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
            action: (items) => onUpdate(items as StaffAccount[], "INACTIVE"),
        },
    ];
};
