import React, { useCallback, useMemo } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { DishFormValues } from "../types/schema";
import { CategoryDto, DishDietDto, DishStatusDto, DishTagDto } from "../types/dish-detail.types";
import { useLocale, useTranslations } from "next-intl";
import { ALCombobox } from "@/components/ui/al-combobox";
import { ALInput } from "@/components/ui/al-input";
import { LOOKUP_TYPE, LookupCombobox, useLookupCrud } from "@/features/lookup";

export const CoreInfoSection: React.FC<{ 
  form: UseFormReturn<DishFormValues>, 
  categories?: CategoryDto[], 
  statuses?: DishStatusDto[],
  tags?: DishTagDto[],
  diets?: DishDietDto[]  
}> = ({ 
  form, 
  categories,
}) => {
  const t = useTranslations("Dish.Form");
  const { register, control, formState: { errors } } = form;
  const locale = useLocale() as 'vi' | 'en' | 'fr';

  // _OLD: statuses/tags were passed via props; now loaded from generic lookup API by typeId.
  const tagLookup = useLookupCrud({
    typeId: LOOKUP_TYPE.Tag,
    queryKey: ["lookups", "dish-tag"],
    entityLabel: "Tag",
    typeLabel: "Tag",
  });

  const statusLookup = useLookupCrud({
    typeId: LOOKUP_TYPE.DishStatus,
    queryKey: ["lookups", "dish-status"],
    entityLabel: "Dish Status",
    typeLabel: "Dish Status",
  });

  // Helper function to get Category name according to language
  const getCategoryName = useCallback((cat: CategoryDto) => {
    switch (locale) {
      case 'vi': return cat.nameVi;
      case 'fr': return cat.nameFr;
      default: return cat.nameEn;
    }
  }, [locale]);

  // Map options for ALCombobox
  const categoryOptions = useMemo(() => {
    return categories?.map(c => ({
      value: String(c.categoryId),
      label: getCategoryName(c)
    })) || [];
  }, [categories, getCategoryName]);

  return (
    <div className="py-2"> 
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 1. CATEGORY */}
        <div className="space-y-2">
          {/* _OLD: External label moved into ALCombobox via title + required props. */}
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <ALCombobox
                title={t("core.category")}
                required
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
          {/* _OLD: External label moved into LookupCombobox via title + required props. */}
          <Controller
            control={control}
            name="tagIds"
            render={({ field }) => (
              <LookupCombobox
                lookup={tagLookup}
                title={t("core.tags")}
                required
                value={field.value ?? []}
                onChange={(val) => field.onChange(Array.isArray(val) ? val : [])}
                multiple
                placeholder="Select Tags..."
                error={errors.tagIds?.message}
                locale={locale}
              />
            )}
          />
        </div>

        {/* 3. PRICE */}
        <div className="space-y-2">
          {/* _OLD: External label moved into ALInput via title + required props. */}
          <ALInput
            title={t("core.price")}
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
          {/* _OLD: External label moved into LookupCombobox via title + required props. */}
          <Controller
            control={control}
            name="dishStatusLvId"
            render={({ field }) => (
              <LookupCombobox
                lookup={statusLookup}
                title={t("core.status")}
                required
                value={field.value ? Number(field.value) : undefined}
                onChange={(val) => field.onChange(val === "" ? undefined : Number(val))}
                placeholder="Select status"
                error={errors.dishStatusLvId?.message}
                locale={locale}
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