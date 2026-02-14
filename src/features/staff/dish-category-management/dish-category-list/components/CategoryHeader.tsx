"use client";

import React from "react";
import { Plus, ChevronDown } from "lucide-react";
import { KeywordSearch } from "@/components/ui/keyword-search/keyword-search";
import { Button } from "@/components/ui/button";
import { StatusFilter as StatusFilterType } from '../types';

interface CategoryHeaderProps {
  searchTerm: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  statusFilter: StatusFilterType;
  onStatusFilterChange: (value: StatusFilterType) => void;
}

export const CategoryHeader = ({ 
  searchTerm, 
  isLoading, 
  onSearchChange, 
  onCreateClick,
  statusFilter,
  onStatusFilterChange,
}: CategoryHeaderProps) => {
  return (
    <div className="flex flex-col gap-6 mb-2 w-full">
      {/* 1. Title Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Dish Category Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and organize your restaurant menu categories efficiently.
        </p>
      </div>

      {/* 2. Toolbar Section (Search + Filters + Add Button) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
        {/* Left group: Search + Status Filter */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 flex-1">
          {/* Search Component */}
          <div className="w-full lg:w-[420px]">
            <KeywordSearch 
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search by category name..."
              loading={isLoading}
            />
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-44">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as StatusFilterType)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right: Add Button */}
        <Button 
          onClick={onCreateClick}
          variant="outline" 
          className="w-full lg:w-auto shadow-md"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Category
        </Button>
      </div>
    </div>
  );
};
