import React, { useEffect, useState } from "react";
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

  // Map tags to format options for ALCombobox
  const tagOptions = React.useMemo(() => {
    return tags?.map(t => ({
      value: t.valueId,
      label: getLookupValueName(t)
    })) || [];
  }, [tags, locale]);

  return (
    <div className="py-2"> 
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 1. CATEGORY */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            {t("core.category")} <span className="text-red-500">*</span>
          </label>
          <select 
            {...register("categoryId", { valueAsNumber: true})}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-non"
          >
            <option value="">{t("core.selectCategory")}</option>
            {categories?.map(c => (
              <option key={c.categoryId} value={c.categoryId}>
                {getCategoryName(c)}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
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
          <select 
            {...register("dishStatusLvId", { valueAsNumber: true})}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-non"
          >
            {statuses?.map(s => (
              <option key={s.valueId} value={s.valueId}> 
                {getLookupValueName(s)}
              </option>
            ))}
          </select>
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