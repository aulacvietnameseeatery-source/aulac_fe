"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDishCategories, useToggleCategoryStatus } from '../hooks/useListDishCategories';
import ListHeader from './ListHeader';
import FilterBar from './FilterBar';
import CategoryTable from './CategoryTable';
import { StatusFilter, CategoryFilters } from '../types';

export default function DishCategoryList() {
  const router = useRouter();
  const [filters, setFilters] = useState<CategoryFilters>({
    pageIndex: 1,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Build filters for API call
  const apiFilters: CategoryFilters = {
    search: searchQuery || undefined,
    isDisabled: statusFilter === 'all' ? undefined : statusFilter === 'inactive',
    pageIndex: filters.pageIndex,
    pageSize: filters.pageSize,
  };

  // Fetch categories from API
  const { categories, totalItems, totalPages, isLoading, error, refetch } = useDishCategories(apiFilters);
  const { toggleStatus } = useToggleCategoryStatus();

  const handleEdit = (id: number) => {
    router.push(`/dashboard/dish-category/edit/${id}`);
  };

  const handleAddCategory = () => {
    router.push('/dashboard/dish-category/add');
  };

  const handleToggleStatus = async (id: number, currentDisabled: boolean) => {
    try {
      await toggleStatus(id, !currentDisabled);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('Failed to update category status');
    }
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    setFilters({ ...filters, pageIndex: 1 });
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setFilters({ ...filters, pageIndex: 1 });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters({ ...filters, pageSize, pageIndex: 1 });
  };

  const handlePageChange = (pageIndex: number) => {
    setFilters({ ...filters, pageIndex });
  };

  if (error) {
    return (
      <div className="w-full bg-[#F8F9FA] p-6 flex items-center justify-center">
        <div className="text-red-600 text-lg">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F8F9FA] p-6">
      <div className="max-w-[1400px] mx-auto">
        <ListHeader onAddCategory={handleAddCategory} />
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
        />
        <div className="mt-6">
          <CategoryTable
            categories={categories}
            isLoading={isLoading}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            pageIndex={filters.pageIndex}
            pageSize={filters.pageSize}
          />
          
          {/* Pagination */}
          <div className="bg-white rounded-b-xl border-t border-zinc-200 px-6 py-4 flex justify-between items-center">
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

