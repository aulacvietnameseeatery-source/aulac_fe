import { useTranslations } from "next-intl";
import React from "react";
import { Plus } from "lucide-react";
import { KeywordSearch } from "@/components/ui/keyword-search/keyword-search";
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';
import { Button } from "@/components/ui/button";

interface RoleHeaderProps {
  searchTerm: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
}

export const RoleHeader = ({
  searchTerm,
  isLoading,
  onSearchChange,
  onCreateClick
}: RoleHeaderProps) => {
  const t = useTranslations("Role.List");

  return (
    <div className="flex flex-col gap-6 mb-2 w-full">
      {/* 1. Title Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("description")}
        </p>
      </div>

      {/* 2. Toolbar Section (Search + Add Button) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search Component */}
        <KeywordSearch
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={t("searchPlaceholder")}
          loading={isLoading}
          className="w-full md:w-96"
        />

        {/* Add Button */}
        <PermissionGuard permission={Permissions.CreateRole}>
          <Button
            onClick={onCreateClick}
            variant="outline"
            className="w-full md:w-auto shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("addNew")}
          </Button>
        </PermissionGuard>
      </div>
    </div>
  );
};