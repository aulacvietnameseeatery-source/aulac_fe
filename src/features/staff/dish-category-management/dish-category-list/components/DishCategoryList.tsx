"use client";

import React, { useCallback, useMemo, useState } from 'react';
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { CategoryHeader } from './CategoryHeader';
import { CategoryActions } from './CategoryActions';
import { useCategoryList } from '../hooks/useCategoryList';
import { useToggleCategoryStatus } from '../hooks/useListDishCategories';
import { DishCategory } from '../types';
import { Switch } from "@/components/ui/switch";
import { useStatusBatchActions } from '../hooks/useStatusBatchActions';
import DishCategoryModal, { SaveCategoryRequest } from './DishCategoryModal';
import { createCategoryService } from '../../dish-category-add/services/createCategoryService';
import { editCategoryService } from '../../dish-category-edit/services/editCategoryService';

export default function DishCategoryList() {
  const t = useTranslations("DishCategory.List");
  const locale = useLocale() as 'vi' | 'en' | 'fr';
  
  // Logic Hook
  const { categories, isLoading, totalCount, paginationInfo, onDataChange, refresh, updateCategoryLocally } = useCategoryList();
  const { toggleStatus } = useToggleCategoryStatus();

  // State for toggling status
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] = useState<DishCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Action Handlers
  const handleEdit = (category: DishCategory) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setModalMode("add");
    setSelectedCategory(null);
    setIsModalOpen(true);
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

  // Handle Save (Create or Update)
  const handleSaveCategory = async (submitData: SaveCategoryRequest) => {
    setIsSubmitting(true);
    try {
      const request = { i18n: submitData.i18n, isDisabled: submitData.isDisabled };
      if (modalMode === "add") {
        await createCategoryService.createCategory(request);
        toast.success(t("notifications.createSuccess"));
      } else if (selectedCategory) {
        await editCategoryService.updateCategory(selectedCategory.categoryId, request);
        toast.success(t("notifications.updateSuccess"));
      }
      setIsModalOpen(false);
      refresh();
    } catch (error: any) {
      const msg =
        error?.status === 409
          ? t("notifications.nameAlreadyExists")
          : t("notifications.actionError");
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Batch Status Update
  const handleBatchStatusUpdate = async (selectedCategories: DishCategory[], isDisabled: boolean) => {
    try {
      // Optimistic Update for all selected items
      selectedCategories.forEach(category => {
        updateCategoryLocally({
          ...category,
          isDisabled: isDisabled
        });
      });

      // API Calls
      const promises = selectedCategories.map(category =>
        toggleStatus(category.categoryId, isDisabled)
      );

      await Promise.all(promises);

      const count = selectedCategories.length;
      const messageKey = !isDisabled ? "notifications.batchActivateSuccess" : "notifications.batchDeactivateSuccess";
      toast.success(t(messageKey, { count }));

    } catch (error: any) {
      console.error("Batch update failed:", error);
      toast.error(t("notifications.batchUpdateError"));
      refresh(); // Revert on error
    }
  };

  // Batch Actions Configuration
  const batchActions = useStatusBatchActions({
    t,
    onUpdate: handleBatchStatusUpdate
  });

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
      cellRender: ({ item }: { item: DishCategory }) =>
        item.nameI18n?.[locale] || item.categoryName,
    },
    {
      field: 'description',
      header: t("table.description"),
      sortable: false,
      cellRender: ({ item }: { item: DishCategory }) => {
        const desc = item.descriptionI18n?.[locale] || item.description;
        return desc ? desc : <span className="text-gray-400 italic">-</span>;
      },
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
        batchActions={batchActions}
      />

      <DishCategoryModal
        isOpen={isModalOpen}
        mode={modalMode}
        category={selectedCategory}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveCategory}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
