"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface CategoryHeaderProps {
  onCreateClick: () => void;
}

export const CategoryHeader = ({ 
  onCreateClick,
}: CategoryHeaderProps) => {
  const t = useTranslations("DishCategory.List");
  
  return (
    <div className="flex justify-between items-center w-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("description")}
        </p>
      </div>
      <Button 
        onClick={onCreateClick}
        variant="outline" 
        className="shadow-md"
      >
        <Plus className="mr-2 h-4 w-4" />
        {t("addNew")}
      </Button>
    </div>
  );
};
