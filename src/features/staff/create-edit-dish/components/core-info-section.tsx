import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { DishFormValues } from "../types/schema";
import { CategoryDto, DishDietDto, DishStatusDto, DishTagDto } from "../types/dish-detail.types";
import { useLocale } from "next-intl";

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
  const { register, formState: { errors } } = form;
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

  return (
    <div className="py-2"> 
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 1. CATEGORY */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            Category <span className="text-red-500">*</span>
          </label>
          <select 
            {...register("categoryId", { valueAsNumber: true})}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-non"
          >
            <option value="">Select Category...</option>
            {categories?.map(c => (
              <option key={c.categoryId} value={c.categoryId}>
                {getCategoryName(c)}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
        </div>

        {/* 2. DIET */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            Special Diet <span className="text-gray-400 font-normal text-xs">(Optional)</span>
          </label>
          <select 
            {...register("dietId")}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-non"
          >
            <option value="">None</option>
            {diets?.map(d => (
              <option key={d.valueId} value={d.valueId}>
                {getLookupValueName(d)}
              </option>
            ))}
          </select>
        </div>

        {/* 3. TAG */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            Dish Tag <span className="text-red-500">*</span>
          </label>
          <select 
            {...register("tagId", { valueAsNumber: true })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-non"
          >
            <option value="">Select Tag...</option>
            {tags?.map(t => (
              <option key={t.valueId} value={t.valueId}> 
                {getLookupValueName(t)}
              </option>
            ))}
          </select>
          {errors.tagId && <p className="text-xs text-red-500">{errors.tagId.message}</p>}
        </div>

        {/* 4. PRICE */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            Base Price (CHF) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            {...register("price")}
            placeholder="0.00"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-non"
          />
          {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
        </div>

        {/* 5. STATUS */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Status</label>
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

        {/* 6. IS ONLINE (Checkbox) */}
        <div className="flex items-end h-full pb-0.5"> 
          <label className="flex items-center gap-3 cursor-pointer group p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors h-10 w-full">
            <input 
                type="checkbox" 
                {...register("isOnline")} 
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 transition-transform" 
            />
            <span className="text-sm font-medium text-gray-600 group-hover:text-blue-700 select-none">
              Available Online
            </span>
          </label>
        </div>

      </div>
    </div>
  );
};