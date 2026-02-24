import React from "react";
import { Eye, Clock, Flame, DollarSign, GripVertical } from "lucide-react";
import { DishDetailResponse, Language } from "../types/dish-detail.types";
import { StatusBadge } from "./status-badge";
import { MetaRow } from "./meta-row";
import { playfair } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type Props = {
  dish: DishDetailResponse;
  activeTab: Language;
};

export const DishInfoSection = ({ dish, activeTab }: Props) => {
  const content = dish.i18n[activeTab];
  const currency = "CHF ";

  return (
    <div className="lg:col-span-7 space-y-8">
      {/* DESCRIPTION SECTION */}
      <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="space-y-4">
          <StatusBadge status={dish.dishStatus} isOnline={dish.isOnline} chefRecommended={dish.chefRecommended} tagName={dish.tagName} />
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {content?.dishName}
          </h2>


        </div>

        {content?.slogan && (
          <blockquote className={cn(
            "border-l-4 border-blue-500 pl-4 italic text-xl text-gray-700 leading-relaxed",
            playfair.className
          )}>
            &quot;{content.slogan}&quot;
          </blockquote>
        )}

        {content?.shortDescription && (
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Short Description</h4>
            <p className="text-gray-900 font-medium leading-relaxed">{content.shortDescription}</p>
          </div>
        )}

        {content?.description && (
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Detailed Description</h4>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
              {content.description}
            </p>
          </div>
        )}

        {content?.note && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <div className="mt-0.5 text-amber-600"><Eye size={16} /></div>
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase block mb-1">Internal Note (Private)</span>
              <p className="text-sm text-amber-800 italic">{content.note}</p>
            </div>
          </div>
        )}
      </section>

      {/* CORE SPECS SECTION */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Core Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <MetaRow label="Category" value={dish.categoryName} icon={GripVertical} />
          <MetaRow label="Base Price" value={`${currency}${dish.price}`} icon={DollarSign} />
          <MetaRow label="Calories" value={dish.calories ? `${dish.calories} kcal` : null} icon={Flame} />
          <MetaRow label="Display Order" value={dish.displayOrder} icon={undefined} />
          <MetaRow label="Prep Time" value={dish.prepTimeMinutes ? `${dish.prepTimeMinutes} mins` : null} icon={Clock} />
          <MetaRow label="Cook Time" value={dish.cookTimeMinutes ? `${dish.cookTimeMinutes} mins` : null} icon={Clock} />
        </div>
      </section>
    </div>
  );
};