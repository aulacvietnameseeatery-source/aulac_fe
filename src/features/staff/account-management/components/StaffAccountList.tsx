'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown, Eye, Edit, RotateCcw, Plus } from 'lucide-react';
import {
  StaffAccount,
  StaffAccountFilters,
  Role,
  AccountStatus,
} from '../types/staff-account.types';
import { staffAccountService } from '../services/staff-account.service';

export default function StaffAccountList() {
  const [filters, setFilters] = useState<StaffAccountFilters>({
    pageIndex: 1,
    pageSize: 20,
  });

  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [roles, setRoles] = useState<Role[]>([]);
  const [statuses, setStatuses] = useState<AccountStatus[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  // Fetch roles and statuses on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setIsLoadingFilters(true);
      try {
        const [rolesData, statusesData] = await Promise.all([
          staffAccountService.getAllRoles(),
          staffAccountService.getAccountStatuses(),
        ]);
        setRoles(rolesData);
        setStatuses(statusesData);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch staff accounts when filters change
  useEffect(() => {
    const fetchStaffAccounts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await staffAccountService.getStaffAccounts(filters);
        setStaffList(result.pageData || []);
        setTotalItems(result.totalCount || 0);
        setTotalPages(result.totalPage || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch staff accounts');
        console.error('Error fetching staff accounts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffAccounts();
  }, [filters]);

  const handleAddAccount = () => {
    console.log('Add account');
    // TODO: Open add account modal
  };

  const handleView = (id: number) => {
    console.log('View:', id);
    // TODO: Open view modal
  };

  const handleEdit = (id: number) => {
    console.log('Edit:', id);
    // TODO: Open edit modal
  };

  const handleResetPassword = async (id: number) => {
    if (!confirm('Are you sure you want to reset this account password?')) {
      return;
    }
    
    try {
      await staffAccountService.resetStaffPassword(id);
      alert('Password has been reset successfully. User will need to change password on next login.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reset password');
      console.error('Error resetting password:', err);
    }
  };

  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search, pageIndex: 1 });
  };

  const handleRoleChange = (roleId?: number) => {
    setFilters({ ...filters, roleId, pageIndex: 1 });
  };

  const handleStatusChange = (accountStatus?: number) => {
    setFilters({ ...filters, accountStatus, pageIndex: 1 });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters({ ...filters, pageSize, pageIndex: 1 });
  };

  const handlePageChange = (pageIndex: number) => {
    setFilters({ ...filters, pageIndex });
  };

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 1: return 'Active';
      case 2: return 'Inactive';
      case 3: return 'Locked';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number): string => {
    switch (status) {
      case 1: return 'bg-gray-800'; // Active
      case 2: return 'bg-gray-200'; // Inactive
      case 3: return 'bg-red-500'; // Locked
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="w-full h-full relative overflow-y-auto px-4 pb-10">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-neutral-900 font-['Manrope']">
            Staff Account List
          </h1>
          <button
            onClick={handleAddAccount}
            className="flex items-center gap-2 px-6 py-3 bg-blue-950 text-white rounded-lg shadow-md hover:bg-blue-900 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-bold tracking-tight">Add Account</span>
          </button>
        </div>

        {/* Filters */}
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
                  onChange={(e) => handleSearchChange(e.target.value)}
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
                  onChange={(e) => handleRoleChange(e.target.value ? Number(e.target.value) : undefined)}
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
                  onChange={(e) => handleStatusChange(e.target.value ? Number(e.target.value) : undefined)}
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 text-center text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
                    No.
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
                    <tr
                      key={staff.accountId}
                      className="border-t border-zinc-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-5 text-base text-neutral-900 text-center font-['Manrope']">
                        {(filters.pageIndex - 1) * filters.pageSize + index + 1}
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
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleView(staff.accountId)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-5 h-5 text-slate-900" />
                          </button>
                          <button
                            onClick={() => handleEdit(staff.accountId)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5 text-slate-900" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(staff.accountId)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title="Reset Password"
                          >
                            <RotateCcw className="w-5 h-5 text-slate-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-zinc-200 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-black text-base font-normal font-['Lexend']">
                  Page size:
                </span>
                <select
                  value={filters.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-3 py-1 border border-stone-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-['Lexend']"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <span className="text-slate-600 text-sm font-bold font-['Lexend']">
                Total: {totalItems} items
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={filters.pageIndex === 1}
                onClick={() => handlePageChange(filters.pageIndex - 1)}
                className="px-3 py-1.5 border border-stone-200 rounded text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-['Lexend']"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1.5 rounded text-base font-medium transition-colors font-['Lexend'] ${
                      page === filters.pageIndex
                        ? 'bg-blue-950 text-white'
                        : 'border border-stone-200 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                disabled={filters.pageIndex >= totalPages}
                onClick={() => handlePageChange(filters.pageIndex + 1)}
                className="px-3 py-1.5 border border-stone-200 rounded text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-['Lexend']"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
