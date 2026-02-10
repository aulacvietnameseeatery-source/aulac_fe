import { Search, ChevronDown } from 'lucide-react';
import { Role, AccountStatus, StaffAccountFilters as Filters } from '../types/staff-account.types';

interface StaffAccountFiltersProps {
  filters: Filters;
  roles: Role[];
  statuses: AccountStatus[];
  isLoadingFilters: boolean;
  onSearchChange: (search: string) => void;
  onRoleChange: (roleId?: number) => void;
  onStatusChange: (accountStatus?: number) => void;
}

export default function StaffAccountFilters({
  filters,
  roles,
  statuses,
  isLoadingFilters,
  onSearchChange,
  onRoleChange,
  onStatusChange,
}: StaffAccountFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-2 font-['Manrope']">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email or phone"
              value={filters.search || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-['Manrope']"
            />
          </div>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-2 font-['Manrope']">
            Role
          </label>
          <div className="relative">
            <select
              value={filters.roleId || ''}
              onChange={(e) => onRoleChange(e.target.value ? Number(e.target.value) : undefined)}
              disabled={isLoadingFilters}
              className="w-full px-4 py-3 border border-stone-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-['Manrope'] disabled:opacity-50"
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-2 font-['Manrope']">
            Status
          </label>
          <div className="relative">
            <select
              value={filters.accountStatus || ''}
              onChange={(e) => onStatusChange(e.target.value ? Number(e.target.value) : undefined)}
              disabled={isLoadingFilters}
              className="w-full px-4 py-3 border border-stone-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-['Manrope'] disabled:opacity-50"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status.valueId} value={status.valueId}>
                  {status.valueName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
