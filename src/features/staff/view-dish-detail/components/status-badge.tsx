import React from "react";
import { Globe, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { keyof } from "zod";
import { DishTag } from "./dish-tag";
import { Language } from "../types/dish-detail.types";
import { useLocale, useTranslations } from "next-intl";

const styles = {
  AVAILABLE: "bg-green-100 text-green-700 border-green-200",
  HIDDEN: "bg-gray-100 text-gray-600 border-gray-200",
  OUT_OF_STOCK: "bg-red-50 text-red-600 border-red-100",
} as const;

type Props = {
  statusObj: Record<Language, string>;
  isOnline: boolean;
  chefRecommended: boolean;
  tags: { tagId: number; names: Record<Language, string> }[];
};

export const StatusBadge = ({ statusObj, isOnline, chefRecommended, tags }: Props) => {
  const t = useTranslations("dishDetail");
  const locale = useLocale() as Language;

  const getSystemLabel = (record?: Record<Language, string>) => {
    if (!record) return "";
    return record[locale] || record.en;
  };

  // Get the display name according to the language.
  const statusText = getSystemLabel(statusObj);
  
  // To get the correct colors (styles), we rely on converting the English key to uppercase.
  // VD: "Available" -> "AVAILABLE"
  const statusKey = (statusObj?.en || "HIDDEN").toUpperCase().replace(/\s+/g, '_');
  const badgeStyle = styles[statusKey as keyof typeof styles] || styles.HIDDEN;
  return (
    <div className="flex justify-between">
        <div className="flex gap-2">
            <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold border", badgeStyle)}>
                {statusText}
            </span>
            {isOnline ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                <Globe size={12} /> {t("status.online")}
                </span>
            ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                {t("status.offline")}
                </span>
            )}
            {chefRecommended && (
                <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-amber-200">
                <Star size={14} fill="currentColor" /> {t("status.chefChoice")}
                </span>
            )}
        </div>
        {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-end">
          {tags.map((tag) => (
            <DishTag key={tag.tagId} tag={getSystemLabel(tag.names)} />
          ))}
        </div>
      )}
    </div>
    
  );
};