"use client";

import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";
import { CategoryHeader } from './CategoryHeader';
import { CategoryActions } from './CategoryActions';
import { useCategoryList } from '../hooks/useCategoryList';
import { useToggleCategoryStatus } from '../hooks/useListDishCategories';
import { DishCategory } from '../types';

export default function DishCategoryList() {
  const router = useRouter();
  
  // Logic Hook
  const { categories, isLoading, pagination, filters, actions } = useCategoryList();
  const { toggleStatus } = useToggleCategoryStatus();

  // Action Handlers
  const handleEdit = (category: DishCategory) => {
    router.push(`/dashboard/dish-category/edit/${category.categoryId}`);
  };

  const handleCreate = () => {
    router.push('/dashboard/dish-category/add');
  };

  const handleToggleStatus = async (category: DishCategory) => {
    try {
      await toggleStatus(category.categoryId, !category.isDisabled);
      toast.success(`Category ${!category.isDisabled ? 'disabled' : 'enabled'} successfully`);
      actions.refresh();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update category status');
    }
  };

  // Handler for the Pagination Component
  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    if (page !== pagination.pageIndex) {
      actions.onPageChange(page);
    }
    if (pageSize !== pagination.pageSize) {
      actions.onPageSizeChange(pageSize);
    }
  }, [pagination.pageIndex, pagination.pageSize, actions]);

  // Status Badge Render
  const renderStatusBadge = (isDisabled: boolean) => {
    if (!isDisabled) {
      return (
        <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium border border-green-200">
          Active
        </span>
      );
    }
    return (
      <span className="bg-gray-50 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">
        Inactive
      </span>
    );
  };

  // Table Columns Config
  const columns: TableColumn[] = useMemo(() => [
    {
      field: 'id',
      header: 'No.',
      width: '80px',
      align: 'center',
      sortable: false,
      cellRender: ({ rowIndex }) =>
        (pagination.pageIndex - 1) * pagination.pageSize + rowIndex + 1,
    },
    {
      field: 'categoryName',
      header: 'Name',
      sortable: false,
      width: '250px',
    },
    {
      field: 'description',
      header: 'Description',
      sortable: false,
      cellRender: ({ value }) => value || <span className="text-gray-400 italic">-</span>,
    },
    {
      field: 'isDisabled',
      header: 'Status',
      align: 'center',
      width: '120px',
      sortable: false,
      cellRender: ({ value }) => renderStatusBadge(value),
    },
  ], [pagination.pageIndex, pagination.pageSize]);

  const handleGlobalRenderCell = useCallback(( value: any, item: DishCategory, column: TableColumn, rowIndex: number) => {
    const content = column.cellRender 
      ? column.cellRender({ value, item, column, rowIndex }) 
      : value;

    if (column.align) {
      return (
        <div style={{ textAlign: column.align }}>
          {content}
        </div>
      );
    }
    return content;
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <div className="p-6 pb-2 md:p-8 md:pb-4">
        <CategoryHeader 
          searchTerm={filters.searchTerm}
          isLoading={isLoading}
          onSearchChange={actions.onSearchChange}
          onCreateClick={handleCreate}
          statusFilter={filters.statusFilter}
          onStatusFilterChange={actions.onStatusFilterChange}
        />
      </div>
      
      <BaseTable<DishCategory>
        data={categories}
        loading={isLoading}
        columns={columns}
        rowKey="categoryId"
        total={categories.length}
        onRefresh={actions.refresh}
        renderCell={handleGlobalRenderCell}
        renderActionColumn={(item) => (
          <CategoryActions 
            category={item}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
          />
        )}
      />

      <Pagination 
        current={pagination.pageIndex}
        pageSize={pagination.pageSize}
        total={pagination.totalCount}
        onChange={handlePaginationChange}
        pageSizeOptions={[10, 20, 50, 100]}
      />
    </div>
  );
}

