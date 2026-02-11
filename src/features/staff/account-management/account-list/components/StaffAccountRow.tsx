import { StaffAccount } from '../types/staff-account.types';
import StaffAccountActions from './StaffAccountActions';

interface StaffAccountRowProps {
  staff: StaffAccount;
  index: number;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onResetPassword: (id: number) => void;
}

const getStatusColor = (status: number): string => {
  switch (status) {
    case 1: return 'bg-gray-800'; // Active
    case 2: return 'bg-gray-200'; // Inactive
    case 3: return 'bg-red-500'; // Locked
    default: return 'bg-gray-200';
  }
};

export default function StaffAccountRow({
  staff,
  index,
  onView,
  onEdit,
  onResetPassword,
}: StaffAccountRowProps) {
  return (
    <tr className="border-t border-zinc-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-5 text-base text-neutral-900 text-center font-['Manrope']">
        {index}
      </td>
      <td className="px-6 py-5 text-base text-neutral-900 font-['Manrope']">
        {staff.fullName}
      </td>
      <td className="px-6 py-5 text-base text-neutral-900 font-['Manrope']">
        {staff.roleName}
      </td>
      <td className="px-6 py-5 text-base text-neutral-900 font-['Manrope']">
        {staff.phone || '-'}
      </td>
      <td className="px-6 py-5 text-base text-neutral-900 font-['Manrope']">
        {staff.email || '-'}
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <div
            className={`relative w-9 h-5 rounded-full transition-colors ${getStatusColor(staff.accountStatus)}`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full border transition-transform ${
                staff.accountStatus === 1
                  ? 'right-0.5 border-white'
                  : 'left-0.5 border-gray-300'
              }`}
            />
          </div>
          <span className="text-base text-neutral-900 font-['Manrope']">
            {staff.accountStatusName}
          </span>
        </div>
      </td>
      <td className="px-6 py-5">
        <StaffAccountActions
          accountId={staff.accountId}
          onView={onView}
          onEdit={onEdit}
          onResetPassword={onResetPassword}
        />
      </td>
    </tr>
  );
}
