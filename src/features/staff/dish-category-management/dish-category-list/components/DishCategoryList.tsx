"use client";

import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { CategoryHeader } from './CategoryHeader';
import { CategoryActions } from './CategoryActions';
import { useCategoryList } from '../hooks/useCategoryList';
import { useToggleCategoryStatus } from '../hooks/useListDishCategories';
import { DishCategory } from '../types';
import { Switch } from "@/components/ui/switch";

export default function DishCategoryList() {
  const router = useRouter();
  const t = useTranslations("DishCategory.List");
  
  // Logic Hook
  const { categories, isLoading, totalCount, paginationInfo, onDataChange, refresh, updateCategoryLocally } = useCategoryList();
  const { toggleStatus } = useToggleCategoryStatus();

  // State for toggling status
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Action Handlers
  const handleEdit = (category: DishCategory) => {
    router.push(`/dashboard/dish-category/edit/${category.categoryId}`);
  };

  const handleCreate = () => {
    router.push('/dashboard/dish-category/add');
  };

  // Handle Status Toggle with optimistic update
  const handleStatusToggle = async (category: DishCategory, checked: boolean) => {
    setTogglingId(category.categoryId);
    try {
      const newIsDisabled = !checked;

      // Optimistic Update
      const updatedCategory: DishCategory = {
        ...category,
        isDisabled: newIsDisabled,
      };
      updateCategoryLocally(updatedCategory);

      // API Call
      await toggleStatus(category.categoryId, newIsDisabled);
      toast.success(t(checked ? "notifications.activated" : "notifications.deactivated"));
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error(t("notifications.updateError"));
      
      // Revert on failure
      refresh();
    } finally {
      setTogglingId(null);
    }
  };

  // Status Badge Render - only used for display
  const renderStatusBadge = (isDisabled: boolean) => {
    if (!isDisabled) {
      return (
        <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium border border-green-200">
          {t("status.active")}
        </span>
      );
    }
    return (
      <span className="bg-gray-50 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">
        {t("status.inactive")}
      </span>
    );
  };

  // Status filter options for table column
  const statusFilterOptions = useMemo(() => [
    { label: t("status.active"), value: 'false' },
    { label: t("status.inactive"), value: 'true' },
  ], [t]);

  // Table Columns Config
  const columns: TableColumn[] = useMemo(() => [
    {
      field: 'id',
      header: t("table.no"),
      width: '80px',
      align: 'center',
      sortable: false,
      cellRender: ({ rowIndex }) =>
        (paginationInfo.page - 1) * paginationInfo.pageSize + rowIndex + 1,
    },
    {
      field: 'categoryName',
      header: t("table.name"),
      sortable: false,
      width: '250px',
      filterType: 'text' as const,
    },
    {
      field: 'description',
      header: t("table.description"),
      sortable: false,
      cellRender: ({ value }) => value || <span className="text-gray-400 italic">-</span>,
    },
    {
      field: 'isDisabled',
      header: t("table.status"),
      align: 'center',
      width: '120px',
      sortable: false,
      filterType: 'select' as const,
      filterOptions: statusFilterOptions,
      cellRender: ({ value, item }: { value: boolean; item: DishCategory }) => {
        // Show toggle switch for status like account list
        return (
          <div className="flex justify-center">
            <Switch
              checked={!value}  // isDisabled = false means active/checked
              onChange={(checked) => handleStatusToggle(item, checked)}
              disabled={togglingId === item.categoryId}
              showLabel={false}
            />
          </div>
        );
      },
    },
  ], [paginationInfo.page, paginationInfo.pageSize, t, statusFilterOptions, togglingId]);

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
    <div className="w-full h-full flex flex-col overflow-hidden">
      <BaseTable<DishCategory>
        data={categories}
        loading={isLoading}
        columns={columns}
        rowKey="categoryId"
        total={totalCount}
        onDataChange={onDataChange}
        onRefresh={refresh}
        searchPlaceholder={t("searchPlaceholder")}
        defaultRowsPerPage={10}
        rowsPerPageOptions={[10, 20, 50, 100]}
        renderTitle={() => (
          <CategoryHeader onCreateClick={handleCreate} />
        )}
        renderCell={handleGlobalRenderCell}
        renderActionColumn={(item) => (
          <CategoryActions 
            category={item}
            onEdit={handleEdit}
          />
        )}
      />
    </div>
  );
}

