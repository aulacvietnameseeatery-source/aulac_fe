import { Eye, Edit, RotateCcw } from 'lucide-react';
interface StaffAccountActionsProps {
  accountId: number;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onResetPassword: (id: number) => void;
}

export default function StaffAccountActions({
  accountId,
  onView,
  onEdit,
  onResetPassword,
}: StaffAccountActionsProps) {
  return (
    <div className="flex justify-end items-center gap-2">
      <button
        onClick={() => onView(accountId)}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        data-tooltip-content="View Details"
        data-tooltip-id="my-tooltip"
      >
        <Eye className="w-5 h-5 text-slate-900" />
      </button>
      <button
        onClick={() => onEdit(accountId)}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        data-tooltip-content="Edit"
        data-tooltip-id="my-tooltip"
      >
        <Edit className="w-5 h-5 text-slate-900" />
      </button>
      <button
        onClick={() => onResetPassword(accountId)}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        data-tooltip-content="Reset Password"
        data-tooltip-id="my-tooltip"

      >
        <RotateCcw className="w-5 h-5 text-slate-500" />
      </button>
    </div>
  );
}
