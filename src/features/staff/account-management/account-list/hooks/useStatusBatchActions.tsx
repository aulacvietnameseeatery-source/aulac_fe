
import { BatchAction } from '@/types/table.types';
import { StaffAccount } from '@/features/staff/account-management/account-list/types/staff-account.types';
import { AccountStatusCode } from '@/types/status-codes';

interface UseStatusBatchActionsProps {
    t: (key: string) => string;
    onUpdate: (items: StaffAccount[], status: AccountStatusCode) => void;
}

export const useStatusBatchActions = ({ t, onUpdate }: UseStatusBatchActionsProps): BatchAction[] => {
    return [
        {
            label: t('batchActions.activate'),
            icon: 'check',
            variant: 'success',
            buttonType: 'solid',
            className: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
            action: (items) => onUpdate(items as StaffAccount[], AccountStatusCode.ACTIVE),
        },
        {
            label: t('batchActions.deactivate'),
            icon: 'close',
            variant: 'danger',
            buttonType: 'solid',
            className: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
            action: (items) => onUpdate(items as StaffAccount[], AccountStatusCode.INACTIVE),
        },
    ];
};
