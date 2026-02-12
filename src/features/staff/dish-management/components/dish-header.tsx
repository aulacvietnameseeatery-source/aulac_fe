// features/admin/dish-management/dish-list/components/DishHeader.tsx
"use client";

import React from "react";
import { Plus, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { KeywordSearch } from "@/components/ui/keyword-search/keyword-search";
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';
import { Button } from "@/components/ui/button";
import { DishStatusCode } from "../types/dish-types";

interface DishHeaderProps {
    searchTerm: string;
    isLoading: boolean;
    onSearchChange: (value: string) => void;
    onCreateClick: () => void;
    // Filters
    category?: string;
    status?: DishStatusCode | "All";
    categories: string[]; // Danh sách tên category từ API hoặc config
    isLoadingFilters: boolean;
    onCategoryChange: (category: string) => void;
    onStatusChange: (status: DishStatusCode | "All") => void;
}

export const DishHeader = ({
                               searchTerm,
                               isLoading,
                               onSearchChange,
                               onCreateClick,
                               category,
                               status,
                               categories,
                               isLoadingFilters,
                               onCategoryChange,
                               onStatusChange,
                           }: DishHeaderProps) => {
    const t = useTranslations("Dish.List");

    return (
        <div className="flex flex-col gap-6 mb-2 w-full">
            {/* 1. Phần tiêu đề */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {t("title")}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {t("description")}
                </p>
            </div>

            {/* 2. Thanh công cụ (Search + Filters + Add Button) */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 flex-1">
                    {/* Ô tìm kiếm */}
                    <div className="w-full lg:w-[420px]">
                        <KeywordSearch
                            value={searchTerm}
                            onChange={onSearchChange}
                            placeholder={t("searchPlaceholder")}
                            loading={isLoading}
                        />
                    </div>

                    {/* Bộ lọc Danh mục */}
                    <div className="w-full lg:w-48">
                        <div className="relative">
                            <select
                                value={category || 'All'}
                                onChange={(e) => onCategoryChange(e.target.value)}
                                disabled={isLoadingFilters}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm disabled:opacity-50 text-sm"
                            >
                                <option value="All">{t("filters.allCategories")}</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Bộ lọc Trạng thái (Dùng DishStatusCode 42, 43, 44) */}
                    <div className="w-full lg:w-48">
                        <div className="relative">
                            <select
                                value={status || 'All'}
                                onChange={(e) => onStatusChange(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                                disabled={isLoadingFilters}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm disabled:opacity-50 text-sm"
                            >
                                <option value="All">{t("filters.allStatuses")}</option>
                                <option value={DishStatusCode.AVAILABLE}>{t("status.available")}</option>
                                <option value={DishStatusCode.OUT_OF_STOCK}>{t("status.outOfStock")}</option>
                                <option value={DishStatusCode.HIDDEN}>{t("status.hidden")}</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Nút thêm món mới */}
                <PermissionGuard permission={Permissions.CreateDish}>
                    <Button
                        onClick={onCreateClick}
                        variant="outline"
                        className="w-full lg:w-auto shadow-md whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700 border-none"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("addNew")}
                    </Button>
                </PermissionGuard>
            </div>
        </div>
    );
};