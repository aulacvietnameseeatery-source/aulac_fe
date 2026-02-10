"use client";

import React, { useState, useMemo } from 'react';
import { Edit, Plus, Search, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDishCategories, useToggleCategoryStatus } from '../hooks/useDishCategories';

export default function DishCategoryList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch categories from API
  const { categories, isLoading, error, refetch } = useDishCategories(true);
  const { toggleStatus } = useToggleCategoryStatus();

  // Filter categories based on search and status
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = category.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           category.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && !category.isDisabled) ||
                           (statusFilter === 'inactive' && category.isDisabled);
      
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

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

  if (error) {
    return (
      <div className="w-full min-h-screen bg-[#F8F9FA] p-6 flex items-center justify-center">
        <div className="text-red-600 text-lg">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-slate-900 text-2xl font-bold font-['Inter'] leading-8 mb-1">
                Dish Category List
              </h1>
              <p className="text-slate-600 text-sm font-normal font-['Inter']">
                Manage and organize your restaurant menu categories efficiently.
              </p>
            </div>
            <button
              onClick={handleAddCategory}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium font-['Inter']">
                Add New Category
              </span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-md relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-normal font-['Inter'] text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40 h-10 pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-sm font-medium font-['Inter'] text-slate-700 outline-none cursor-pointer appearance-none transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 text-center text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-600">
                      Loading categories...
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-600">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                  <tr
                    key={category.categoryId}
                    className="border-t border-zinc-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-5 text-base text-neutral-900 text-center font-['Manrope']">
                      {category.categoryId}
                    </td>
                    <td className="px-6 py-5 text-base text-neutral-900 font-['Manrope']">
                      {category.categoryName}
                    </td>
                    <td className="px-6 py-5 text-base text-neutral-900 font-['Manrope']">
                      {category.description || '-'}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleToggleStatus(category.categoryId, category.isDisabled)}
                          className="relative inline-block w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
                          style={{ backgroundColor: !category.isDisabled ? '#1f2937' : '#e5e7eb' }}
                        >
                          <span
                            className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                            style={{
                              transform: !category.isDisabled ? 'translateX(16px)' : 'translateX(0)',
                              border: !category.isDisabled ? '1px solid white' : '1px solid #d1d5db'
                            }}
                          />
                        </button>
                        <span className="ml-3 text-sm text-slate-600 font-['Inter']">
                          {!category.isDisabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category.categoryId)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5 text-slate-900" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
