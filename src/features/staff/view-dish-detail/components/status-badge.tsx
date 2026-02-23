import React from "react";
import { Globe, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { keyof } from "zod";
import { DishTag } from "./dish-tag";

const styles = {
  AVAILABLE: "bg-green-100 text-green-700 border-green-200",
  HIDDEN: "bg-gray-100 text-gray-600 border-gray-200",
  OUT_OF_STOCK: "bg-red-50 text-red-600 border-red-100",
} as const;

type Props = {
  status: string;
  isOnline: boolean;
  chefRecommended: boolean;
  tagName: string;
};

export const StatusBadge = ({ status, isOnline, chefRecommended, tagName }: Props) => {
  return (
    <div className="flex justify-between">
        <div className="flex gap-2">
            <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold border", styles[status as keyof typeof styles])}>
                {status}
            </span>
            {isOnline ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                <Globe size={12} /> Online
                </span>
            ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                Offline
                </span>
            )}
            {chefRecommended && (
                <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-amber-200">
                <Star size={14} fill="currentColor" /> Chef&apos;s Choice
                </span>
            )}
        </div>
        <DishTag tag={tagName} />
    </div>
    
  );
};