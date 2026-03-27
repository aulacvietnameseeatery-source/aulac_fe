"use client";

import React from "react";
import { Plus, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { KeywordSearch } from "@/components/ui/keyword-search/keyword-search";
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';
import { Button } from "@/components/ui/button";
import { DishStatusOption } from "../services/dish-service";

interface DishHeaderProps {
    searchTerm: string;
    isLoading: boolean;
    onSearchChange: (value: string) => void;
    onCreateClick: () => void;

    // Filter Values
    category?: string;
    status?: number | "All";

    // Filter Options Sources
    categories: string[];
    statuses: DishStatusOption[];
    isLoadingFilters: boolean;

    // Handlers
    onCategoryChange: (category: string) => void;
    onStatusChange: (status: number | "All") => void;
}

export const DishHeader = ({
    searchTerm,
    isLoading,
    onSearchChange,
    onCreateClick,
    category,
    status,
    categories,
    statuses,
    isLoadingFilters,
    onCategoryChange,
    onStatusChange,
}: DishHeaderProps) => {
    const t = useTranslations("Dish.List");

    return (
        <div className="flex flex-col gap-6 mb-2 w-full">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {t("title")}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {t("description")}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 flex-1">
                    {/* Search */}
                    <div className="w-full lg:w-[420px]">
                        <KeywordSearch
                            value={searchTerm}
                            onChange={onSearchChange}
                            placeholder={t("searchPlaceholder")}
                            loading={isLoading}
                        />
                    </div>

                    {/* Category Filter */}
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

                    {/* Status Filter (Dynamic) */}
                    <div className="w-full lg:w-48">
                        <div className="relative">
                            <select
                                value={status || 'All'}
                                onChange={(e) => onStatusChange(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                                disabled={isLoadingFilters}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm disabled:opacity-50 text-sm"
                            >
                                <option value="All">{t("filters.allStatuses")}</option>
                                {statuses.map((s) => (
                                    <option key={s.statusId} value={s.statusId}>
                                        {s.statusName}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

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