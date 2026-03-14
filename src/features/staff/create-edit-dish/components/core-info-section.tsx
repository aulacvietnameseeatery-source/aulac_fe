import React, { useEffect, useMemo, useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { DishFormValues } from "../types/schema";
import { CategoryDto, DishDietDto, DishStatusDto, DishTagDto } from "../types/dish-detail.types";
import { useLocale, useTranslations } from "next-intl";
import { ALCombobox } from "@/components/ui/al-combobox";
import { ALInput } from "@/components/ui/al-input";

export const CoreInfoSection: React.FC<{ 
  form: UseFormReturn<DishFormValues>, 
  categories?: CategoryDto[], 
  statuses?: DishStatusDto[],
  tags?: DishTagDto[],
  diets?: DishDietDto[]  
}> = ({ 
  form, 
  categories, 
  statuses,
  tags,
  diets }) => {
  const t = useTranslations("Dish.Form");
  const { register, control, formState: { errors } } = form;
  const locale = useLocale() as 'vi' | 'en' | 'fr';

  // Helper function to get Category name according to language
  const getCategoryName = (cat: CategoryDto) => {
    switch (locale) {
      case 'vi': return cat.nameVi;
      case 'fr': return cat.nameFr;
      default: return cat.nameEn;
    }
  };

  // Helper function to retrieve Tag/Status names according to language
  const getLookupValueName = (item: DishTagDto | DishStatusDto) => {
    // Fallback to 'en' if language key is not found.
    return item.i18n[locale] || item.i18n.en;
  };

  // Map options for ALCombobox
  const categoryOptions = useMemo(() => {
    return categories?.map(c => ({
      value: String(c.categoryId),
      label: getCategoryName(c)
    })) || [];
  }, [categories, locale]);

  // Map tags to format options for ALCombobox
  const tagOptions = React.useMemo(() => {
    return tags?.map(t => ({
      value: t.valueId,
      label: getLookupValueName(t)
    })) || [];
  }, [tags, locale]);

  const statusOptions = useMemo(() => {
    return statuses?.map(s => ({
      value: String(s.valueId),
      label: getLookupValueName(s)
    })) || [];
  }, [statuses, locale]);

  return (
    <div className="py-2"> 
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 1. CATEGORY */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            {t("core.category")} <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <ALCombobox
                options={categoryOptions}
                value={field.value ? String(field.value) : undefined}
                onChange={(val) => field.onChange(val ? Number(val) : undefined)}
                placeholder={t("core.selectCategory")}
                error={errors.categoryId?.message}
                searchable
              />
            )}
          />
        </div>

        {/* 2. TAG */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            {t("core.tags")} <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="tagIds"
            render={({ field }) => (
              <ALCombobox
                options={tagOptions}
                value={field.value}
                onChange={(val) => field.onChange(val)}
                multiple={true}
                placeholder="Select Tags..."
                error={errors.tagIds?.message} 
              />
            )}
          />
        </div>

        {/* 3. PRICE */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            {t("core.price")} <span className="text-red-500">*</span>
          </label>
          <ALInput
            // Bỏ prop title="" đi để không dùng label mặc định của component
            required
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.price?.message}
            {...register("price")}
          />
        </div>

        {/* 4. STATUS */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">{t("core.status")}</label>
          <Controller
            control={control}
            name="dishStatusLvId"
            render={({ field }) => (
              <ALCombobox
                options={statusOptions}
                value={field.value ? String(field.value) : undefined}
                onChange={(val) => field.onChange(val ? Number(val) : undefined)}
                placeholder="Select status"
                error={errors.dishStatusLvId?.message}
              />
            )}
          />
        </div>

        {/* 5. IS ONLINE (Checkbox) */}
        <div className="flex items-end h-full pb-0.5"> 
          <label className="flex items-center gap-3 cursor-pointer group p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors h-10 w-full">
            <input 
                type="checkbox" 
                {...register("isOnline")} 
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 transition-transform" 
            />
            <span className="text-sm font-medium text-gray-600 group-hover:text-blue-700 select-none">
              {t("core.availableOnline")}
            </span>
          </label>
        </div>

      </div>
    </div>
  );
};