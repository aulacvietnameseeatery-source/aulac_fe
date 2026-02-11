import { Plus } from 'lucide-react';

interface StaffAccountHeaderProps {
  onAddAccount: () => void;
}

export default function StaffAccountHeader({ onAddAccount }: StaffAccountHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-extrabold text-neutral-900 font-['Manrope']">
        Staff Account List
      </h1>
      <button
        onClick={onAddAccount}
        className="flex items-center gap-2 px-6 py-3 bg-blue-950 text-white rounded-lg shadow-md hover:bg-blue-900 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm font-bold tracking-tight">Add Account</span>
      </button>
    </div>
  );
}
