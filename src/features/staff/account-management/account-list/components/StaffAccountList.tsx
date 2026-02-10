'use client';

import StaffAccountHeader from './StaffAccountHeader';
import StaffAccountFiltersComponent from './StaffAccountFilters';
import StaffAccountTable from './StaffAccountTable';
import StaffAccountPagination from './StaffAccountPagination';
import { useStaffAccounts, useFilterOptions, useStaffActions } from '../../';

export default function StaffAccountList() {
  // Custom hooks
  const {
    staffList,
    totalItems,
    totalPages,
    isLoading,
    error,
    filters,
    handleSearchChange,
    handleRoleChange,
    handleStatusChange,
    handlePageSizeChange,
    handlePageChange,
  } = useStaffAccounts();

  const { roles, statuses, isLoadingFilters } = useFilterOptions();

  const { handleAddAccount, handleView, handleEdit, handleResetPassword } = useStaffActions();

  return (
    <div className="w-full h-full relative overflow-y-auto px-4 pb-10">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <StaffAccountHeader onAddAccount={handleAddAccount} />

        {/* Filters */}
        <StaffAccountFiltersComponent
          filters={filters}
          roles={roles}
          statuses={statuses}
          isLoadingFilters={isLoadingFilters}
          onSearchChange={handleSearchChange}
          onRoleChange={handleRoleChange}
          onStatusChange={handleStatusChange}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Table */}
        <StaffAccountTable
          staffList={staffList}
          isLoading={isLoading}
          pageIndex={filters.pageIndex}
          pageSize={filters.pageSize}
          onView={handleView}
          onEdit={handleEdit}
          onResetPassword={handleResetPassword}
        />

        {/* Pagination */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden mt-0">
          <StaffAccountPagination
            pageIndex={filters.pageIndex}
            pageSize={filters.pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>
    </div>
  );
}
