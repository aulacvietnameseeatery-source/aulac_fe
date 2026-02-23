import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { DishFormValues } from "../types/schema";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const AdditionalSection: React.FC<{ form: UseFormReturn<DishFormValues> }> = ({ form }) => {
  const { register } = form;
  const [isOpen, setIsOpen] = useState(false); // Default collapsed

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-fit">
      {/* Clickable Header */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div>
          <h3 className="text-lg font-bold text-gray-900">Additional Info</h3>
          <p className="text-sm text-gray-500 mt-0.5">Nutritional info & timing</p>
        </div>
        {isOpen ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
      </button>

      {/* Collapsible Content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
             <label className="text-sm font-medium text-gray-600">Display Order</label>
             <input type="number" {...register("displayOrder")} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none" placeholder="0" />
           </div>
           
           <div className="space-y-1.5">
             <label className="text-sm font-medium text-gray-600">Calories (kcal)</label>
             <input type="number" {...register("calories")} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none" placeholder="e.g. 450" />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-sm font-medium text-gray-600">Prep (min)</label>
               <input type="number" {...register("prepTimeMinutes")} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none" placeholder="15" />
             </div>
             <div className="space-y-1.5">
               <label className="text-sm font-medium text-gray-600">Cook (min)</label>
               <input type="number" {...register("cookTimeMinutes")} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none" placeholder="20" />
             </div>
           </div>

           <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input type="checkbox" {...register("chefRecommended")} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">Chef&apos;s Recommended</span>
                </div>
                </label>
            </div>
        </div>
      </div>
    </div>
  );
};