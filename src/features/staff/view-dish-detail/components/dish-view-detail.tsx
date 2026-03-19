"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { BASE_URL } from "@/lib/http";
import { DishDetailResponse, Language, LANGUAGES } from "../types/dish-detail.types";
import { CheckCircle2, XCircle, Flame, Clock, ChefHat, X, ChevronLeft, ChevronRight, ZoomIn, PlayCircle } from "lucide-react";
import { SectionWrapper } from "../../create-edit-dish/components/section-wrapper";
import { useTranslations } from "next-intl";

interface Props {
  dish: DishDetailResponse;
}

export function DishViewDetail({ dish }: Props) {
  const [activeTab, setActiveTab] = useState<Language>("en");
  
  // State cho Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const t = useTranslations("Dish.Detail");

  const currentI18n = dish.i18n[activeTab] || dish.i18n.en;
  const staticImages = dish.media.filter((m) => m.mediaType === "IMAGE");
  const rotationImages = dish.media.filter((m) => m.mediaType === "IMAGE_360");
  const videoMedia = dish.media.find((m) => m.mediaType === "VIDEO");

  const getLocString = (record: Record<Language, string>) => record[activeTab] || record.en || "—";

  // Xử lý phím tắt cho Lightbox (Esc để đóng, Trái/Phải để chuyển ảnh)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((prev) => (prev! + 1) % staticImages.length);
      if (e.key === "ArrowLeft") setLightboxIndex((prev) => (prev! - 1 + staticImages.length) % staticImages.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, staticImages.length]);

  return (
    <div className="space-y-6">
      {/* ROW 1: CORE INFORMATION */}
      <SectionWrapper title={t("core.title")} subtitle={t("core.subtitle")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <InfoField label={t("core.category")} value={getLocString(dish.categoryName)} />
          <InfoField label={t("core.basePrice")} value={`CHF ${dish.price.toFixed(2)}`} className="text-blue-600 font-bold" />
          <InfoField label={t("core.status")} value={getLocString(dish.dishStatus)} />
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("core.visibility")}</label>
            <div className="flex items-center gap-2">
              {dish.isOnline ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200 w-fit">
                  <CheckCircle2 size={16} /> {t("core.online")}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 w-fit">
                  <XCircle size={16} /> {t("core.offline")}
                </span>
              )}
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 space-y-1.5 pt-2 border-t border-gray-100">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("core.tags")}</label>
            <div className="flex flex-wrap gap-2">
              {dish.tags.length > 0 ? (
                dish.tags.map((tag) => (
                  <span key={tag.tagId} className="px-3 py-1 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200">
                    {getLocString(tag.names)}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400 italic">{t("core.noTags")}</span>
              )}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ROW 2: MULTILINGUAL CONTENT */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">{t("multilingual.title")}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{t("multilingual.subtitle")}</p>
          </div>
          <div className="flex bg-gray-200/50 p-1 rounded-lg w-full sm:w-fit overflow-x-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={cn(
                  "flex-1 sm:flex-none px-6 py-1.5 text-sm font-bold rounded-md transition-all uppercase whitespace-nowrap",
                  activeTab === lang
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 sm:p-6 space-y-6">
          <InfoField label={`${t("multilingual.dishName")} (${activeTab})`} value={currentI18n?.dishName} valueClass="text-xl font-bold text-gray-900" />
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("multilingual.description")}</label>
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg min-h-[100px] text-gray-700 whitespace-pre-line text-sm leading-relaxed">
              {currentI18n?.description || <span className="italic text-gray-400">{t("multilingual.noDescription")}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoField label={t("multilingual.shortDescription")} value={currentI18n?.shortDescription} />
            <InfoField label={t("multilingual.slogan")} value={currentI18n?.slogan} valueClass="italic font-medium text-blue-700" />
          </div>

          {currentI18n?.note && (
             <div className="space-y-1.5 pt-4 border-t border-gray-100">
               <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("multilingual.internalNote")}</label>
               <div className="p-3 bg-amber-50 text-amber-800 text-sm font-medium border border-amber-200 rounded-lg">
                 {currentI18n.note}
               </div>
             </div>
          )}
        </div>
      </div>

      <SectionWrapper title={t("media.galleryTitle")} subtitle={t("media.staticUploaded", { count: staticImages.length })}>
        {staticImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {staticImages.map((img, idx) => (
              <div 
                key={img.mediaId} 
                onClick={() => setLightboxIndex(idx)}
                className="aspect-square relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group cursor-zoom-in"
              >
                <img 
                  src={`${BASE_URL}${img.url}`} 
                  alt="Dish" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" size={28} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-sm text-gray-400">
            {t("media.noGallery")}
          </div>
        )}
      </SectionWrapper>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 4.1: 360 Media - View Only */}
        <SectionWrapper title={t("media.360Title")} subtitle={t("media.framesUploaded", { count: rotationImages.length })}>
          {rotationImages.length > 0 ? (
            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center relative border border-gray-200 overflow-hidden">
               <img src={`${BASE_URL}${rotationImages[0].url}`} alt="360 view preview" className="h-full object-contain" />
               <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <span className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold shadow-sm text-gray-800">
                    {t("media.images360", { count: rotationImages.length })}
                  </span>
               </div>
            </div>
          ) : (
            <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-sm text-gray-400">
              {t("media.no360")}
            </div>
          )}
        </SectionWrapper>

        {/* 4.2: Video */}
        <SectionWrapper title={t("media.videoTitle")} subtitle={t("media.videoSubtitle")}>
          {videoMedia ? (
            <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-gray-200">
              <video 
                src={`${BASE_URL}${videoMedia.url}`} 
                controls 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-sm text-gray-400">
              <PlayCircle className="w-8 h-8 mb-2 text-gray-300" />
              {t("media.noVideo")}
            </div>
          )}
        </SectionWrapper>
      </div>

      {/* ROW 4: ADDITIONAL INFO */}
      <SectionWrapper title={t("additional.title")} subtitle={t("additional.subtitle")}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <InfoField label={t("additional.displayOrder")} value={dish.displayOrder?.toString()} />
          <InfoField label={t("additional.calories")} value={dish.calories ? `${dish.calories} kcal` : undefined} icon={<Flame size={14} className="text-orange-500" />} />
          <InfoField label={t("additional.prepTime")} value={dish.prepTimeMinutes ? `${dish.prepTimeMinutes} min` : undefined} icon={<Clock size={14} className="text-blue-500" />} />
          <InfoField label={t("additional.cookTime")} value={dish.cookTimeMinutes ? `${dish.cookTimeMinutes} min` : undefined} icon={<Clock size={14} className="text-rose-500" />} />
          
          <div className="col-span-2 md:col-span-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg w-full sm:w-fit">
              <ChefHat size={20} className={dish.chefRecommended ? "text-orange-600" : "text-gray-400"} />
              <span className="text-sm font-medium text-gray-700">
                {dish.chefRecommended ? t("additional.chefRecommended") : t("additional.notChefRecommended")}
              </span>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ================= LIGHTBOX PORTAL ================= */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <button 
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X size={32} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev! - 1 + staticImages.length) % staticImages.length);
            }}
            className="absolute left-2 sm:left-6 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
          >
            <ChevronLeft size={40} />
          </button>
          <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center">
            <img 
              src={`${BASE_URL}${staticImages[lightboxIndex].url}`} 
              alt="Fullscreen view" 
              className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl select-none"
            />
            <div className="mt-4 text-white/70 text-sm font-medium tracking-wide">
              {lightboxIndex + 1} / {staticImages.length}
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev! + 1) % staticImages.length);
            }}
            className="absolute right-2 sm:right-6 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
          >
            <ChevronRight size={40} />
          </button>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value, icon, className, valueClass }: { label: string, value?: string | null, icon?: React.ReactNode, className?: string, valueClass?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
        {icon} {label}
      </label>
      <p className={cn("text-sm text-gray-900 font-medium", !value && "text-gray-400 italic", valueClass)}>
        {value || "—"}
      </p>
    </div>
  );
}