import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { DishFormValues } from "../types/schema";
import { CategoryDto, DishStatusDto, DishTagDto } from "../types/dish-detail.types";

export const CoreInfoSection: React.FC<{ 
  form: UseFormReturn<DishFormValues>, 
  categories?: CategoryDto[], 
  statuses?: DishStatusDto[],
  tags?: DishTagDto[]  
}> = ({ 
  form, 
  categories, 
  statuses,
  tags }) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-5">
      {/* Category & Tag*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Category <span className="text-red-500">*</span></label>
          <select 
            {...register("categoryId", { valueAsNumber: true})}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          >
            <option value="">Select Category...</option>
            {categories?.map(c => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
        </div>

        {/*Tag Select */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Dish Tag <span className="text-red-500">*</span>
          </label>
          <select 
            {...register("tagId", { valueAsNumber: true })} // Giả sử field trong form là tagId
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          >
            <option value="">Select Tag...</option>
            {tags?.map(t => (
              <option key={t.tagId} value={t.tagId}>
                {t.name} {/* Hiển thị Earth, Water... */}
              </option>
            ))}
          </select>
          {errors.tagId && <p className="text-xs text-red-500">{errors.tagId.message}</p>}
        </div>
      </div>

      {/* Price & Status */}
      <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Base Price (CHF) <span className="text-red-500">*</span></label>
            <input
              type="number"
              step="0.01"
              {...register("price")}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Status</label>
            <select 
              {...register("dishStatusLvId", { valueAsNumber: true})}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              {statuses?.map(s => (
                <option key={s.dishStatusLvId} value={s.dishStatusLvId}>
                  {s.valueName}
                </option>
              ))}
            </select>
          </div>
      </div>

      {/* Toggle */}
      <div className="pt-2">
        <label className="flex items-center gap-3 cursor-pointer group p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <input type="checkbox" {...register("isOnline")} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">Online Availability</span>
            <span className="text-xs text-gray-500">Show on menu</span>
          </div>
        </label>
      </div>
    </div>
  );
};