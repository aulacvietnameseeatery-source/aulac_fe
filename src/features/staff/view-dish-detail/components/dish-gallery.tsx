import React from "react";
import { cn } from "@/lib/utils";
import { ReadOnly360Viewer } from "./read-only-360-viewer";
import { BASE_URL } from "@/lib/http";
import { useTranslations } from "next-intl";

type Props = {
  staticImages: string[];
  rotationImages: string[];
  onImageClick: (index: number) => void;
};

export const DishGallery = ({ staticImages, rotationImages, onImageClick }: Props) => {
  const t = useTranslations("dishDetail");
  return (
    <div className="lg:col-span-5 space-y-8">
      {/* Static Images */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{t("gallery.title")}</h3>
        <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"> 
          {staticImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {staticImages.map((imgUrl, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onImageClick(idx)}
                  className={cn(
                    "relative rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in group bg-gray-100",
                    idx === 0 ? "col-span-2 aspect-[4/3]" : "col-span-1 aspect-square"
                  )}
                >
                  <img src={`${BASE_URL}${imgUrl}`} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-100 rounded-lg text-gray-500 italic text-sm">{t("gallery.noImages")}</div>
          )}
        </div>
        <p className="text-xs text-gray-400 italic">{t("gallery.clickHint")}</p>
      </div>

      {/* 360 View */}
      {rotationImages.length > 0 ? (
         <ReadOnly360Viewer images={rotationImages} />
      ) : (
        <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center">
           <p className="text-xs text-gray-400">{t("gallery.no360")}</p>
        </div>
      )}
    </div>
  );
};