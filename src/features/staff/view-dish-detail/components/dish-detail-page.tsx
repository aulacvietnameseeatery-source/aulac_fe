// src/features/view-dish-detail/DishDetailPage.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Hooks & Types
import { useDishDetail } from "../hooks/useDishDetail";
import { LANGUAGES, Language } from "../types/dish-detail.types";

// Components
import { DishGallery } from "./dish-gallery";
import { DishInfoSection } from "./dish-info-section";
import { Lightbox } from "./lightbox";

type DishDetailProps = {
  dishId?: number;
};

export function DishDetailPage({ dishId }: DishDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Language>("en");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // 1. Sử dụng Custom Hook (đã bao gồm fetch + xử lý media)
  const { dish, isLoading, staticImages, rotationImages } = useDishDetail(dishId!);

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Loading dish details...</p>
        </div>
      </div>
    );
  }

  // 3. Not Found / Error State
  if (!dish) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Dish not found</h2>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline mt-4">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 pb-12 font-sans">
      <div className="h-12"></div>

      {/* HEADER */}
      <header className="w-full z-40 transition-all">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              Dish Detail View
            </h1>
            <p className="text-xl text-gray-500 mt-0.5 flex items-center gap-1">
              <Info size={12} /> Read-only mode
            </p>
          </div>

          <button
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
            onClick={() => router.replace("edit")}
          >
            <Edit size={16} /> <span className="hidden sm:inline">Edit Dish</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* LANGUAGE SWITCHER */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-8">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={cn(
                  "pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-all",
                  activeTab === lang
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                )}
              >
                {lang === "en" ? "English" : lang === "vi" ? "Tiếng Việt" : "Français"}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: GALLERY & 360 */}
          <DishGallery 
            staticImages={staticImages} 
            rotationImages={rotationImages} 
            onImageClick={setLightboxIndex} 
          />

          {/* RIGHT: INFO & SPECS */}
          <DishInfoSection 
            dish={dish} 
            activeTab={activeTab} 
          />
        </div>
      </main>

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && staticImages.length > 0 && (
        <Lightbox
          images={staticImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}