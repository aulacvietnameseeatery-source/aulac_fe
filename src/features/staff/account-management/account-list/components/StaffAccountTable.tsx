import { StaffAccount } from '../types/staff-account.types';
import StaffAccountRow from './StaffAccountRow';

interface StaffAccountTableProps {
  staffList: StaffAccount[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onResetPassword: (id: number) => void;
}

export default function StaffAccountTable({
  staffList,
  isLoading,
  pageIndex,
  pageSize,
  onView,
  onEdit,
  onResetPassword,
}: StaffAccountTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 text-center text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
                No
              </th>
              <th className="px-6 py-4 text-left text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
                Full Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
                Role
              </th>
              <th className="px-6 py-4 text-left text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
                Phone
              </th>
              <th className="px-6 py-4 text-left text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
                Status
              </th>
              <th className="px-6 py-4 text-right text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                  No staff accounts found
                </td>
              </tr>
            ) : (
              staffList.map((staff, index) => (
                <StaffAccountRow
                  key={staff.accountId}
                  staff={staff}
                  index={(pageIndex - 1) * pageSize + index + 1}
                  onView={onView}
                  onEdit={onEdit}
                  onResetPassword={onResetPassword}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
