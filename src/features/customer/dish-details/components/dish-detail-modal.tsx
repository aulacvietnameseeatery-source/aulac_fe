"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OrderPopup, useDishDetail } from "@/features/customer/dish-details";
import { useTranslations } from "next-intl";
import Script from "next/script";

declare global {
  interface Window {
    cloudinary: any;
  }
}

interface DishDetailModalProps {
  dishId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const FALLBACK_IMAGES = [
  "/images/dish-detail/dish-composition-rice/dish-compostion-rice.png",
  "/images/dish-detail/dish-composition-imperial/dish-compostion-imperial.png",
  "/images/dish-detail/dish-composition-mam-ruoc/dish-composition-mam-ruoc.png",
];

const HERO_IMAGE = "/images/dish-detail/dish-hero/dish-hero.png";
const CLOUD_NAME = "dkstc8tkg";
const SPIN_TAG = "tiramisu-360";

export function DishDetailModal({ dishId, isOpen, onClose }: DishDetailModalProps) {
  const { data: dishData, isLoading, error } = useDishDetail(dishId || 0);
  const [openPopup, setOpenPopup] = useState(false);
  const [viewMode, setViewMode] = useState<"photo" | "360" | "video">("photo");
  const galleryRef = useRef<any>(null);

  const tHero = useTranslations("DishDetails.Hero");
  const tComp = useTranslations("DishDetails.Composition");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  // Reset view mode when modal opens
  useEffect(() => {
    if (isOpen) setViewMode("photo");
  }, [isOpen]);

  useEffect(() => {
    if (viewMode === "360" && typeof window !== "undefined" && window.cloudinary) {
      if (galleryRef.current) galleryRef.current.destroy();
      galleryRef.current = window.cloudinary.galleryWidget({
        container: "#cloudinary-360-modal",
        cloudName: CLOUD_NAME,
        mediaAssets: [{ tag: SPIN_TAG, mediaType: "spin" }],
        carouselStyle: "none",
        navigation: "always",
        zoom: true,
        spinProps: { direction: "clockwise", speed: 5 },
      });
      galleryRef.current.render();
    }
  }, [viewMode]);

  if (!isOpen || !dishId) return null;

  // Render modal bằng Portal để tránh bị ảnh hưởng bởi overflow-hidden của parent
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal – compact, no outer scroll */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 w-full max-w-[720px] bg-stone-50 rounded-2xl shadow-2xl overflow-hidden font-sans"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-[10000] flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-gray-700 shadow-md hover:bg-white hover:text-gray-900 transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>

            {/* ─── CONTENT ─── */}
            {isLoading ? (
              <div className="flex h-72 items-center justify-center">
                <div className="text-base text-gray-500">Loading…</div>
              </div>
            ) : error || !dishData?.success ? (
              <div className="flex h-72 items-center justify-center">
                <div className="text-base text-red-600">{error?.message || "Failed to load dish"}</div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row">
                {/* ── LEFT: Image panel ── */}
                <div className="relative w-full md:w-[400px] md:shrink-0 h-[400px] md:h-[500px] bg-white overflow-hidden shrink-0">
                  <Script src="https://product-gallery.cloudinary.com/all.js" strategy="lazyOnload" />

                  {/* Photo */}
                  {viewMode === "photo" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={dishData.data.imageUrls?.[0] || HERO_IMAGE}
                        alt={dishData.data.dishName}
                        className="max-h-full max-w-full object-contain animate-in fade-in duration-400"
                      />
                    </div>
                  )}

                  {/* 360 */}
                  <div
                    id="cloudinary-360-modal"
                    className={`absolute inset-0 w-full h-full z-10 bg-white ${viewMode === "360" ? "block" : "hidden"}`}
                  />

                  {/* Video */}
                  {viewMode === "video" && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black animate-in fade-in">
                      <p className="text-white text-sm font-medium">Video Player Coming Soon</p>
                    </div>
                  )}

                  {/* Order Now */}
                  {viewMode !== "360" && (
                    <button
                      type="button"
                      onClick={() => setOpenPopup(true)}
                      className="absolute bottom-4 left-4 right-4 z-20 h-10 rounded-lg bg-amber-400 px-4 shadow-md hover:bg-amber-500 transition-colors"
                    >
                      <span className="font-body text-sm font-semibold text-blue-950">{tHero("order_now")}</span>
                    </button>
                  )}

                  {/* View-mode tabs */}
                  <div className="absolute left-1/2 top-3 z-30 inline-flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-black/30 p-1 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-md">
                    {(["photo", "360", "video"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setViewMode(mode)}
                        className={`font-body rounded-full px-3 py-1 text-[10px] font-medium transition-all duration-300 ${
                          viewMode === mode
                            ? "bg-white/20 text-white outline outline-1 outline-offset-[-1px] outline-white/20 shadow-md"
                            : "text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {mode === "photo" ? tHero("photo") : mode === "360" ? tHero("view_360") : tHero("video")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── RIGHT: Info panel ── */}
                <div className="flex-1 p-4 overflow-y-auto no-scrollbar max-h-[400px] md:max-h-[500px]">
                  {/* Category */}
                  {dishData.data.categoryName && (
                    <span className="font-body inline-block rounded-full bg-blue-800/10 px-3 py-0.5 text-xs font-medium text-blue-800">
                      {dishData.data.categoryName}
                    </span>
                  )}

                  {/* Name */}
                  <h2 className="font-display mt-2 text-xl font-semibold leading-7 text-neutral-900">
                    {dishData.data.dishName}
                  </h2>

                  {/* Price */}
                  <div className="font-display mt-1 text-base font-semibold text-blue-800">
                    {dishData.data.price?.toLocaleString("vi-VN")} ₫
                  </div>

                  {/* Slogan */}
                  {dishData.data.slogan && (
                    <p className="font-body mt-2 text-sm italic leading-5 text-gray-600">
                      {dishData.data.slogan}
                    </p>
                  )}

                  {/* Short description */}
                  {dishData.data.shortDescription && (
                    <p className="font-body mt-1.5 text-xs leading-5 text-gray-500">
                      {dishData.data.shortDescription}
                    </p>
                  )}

                  {/* Description (capped at 3 lines) */}
                  {dishData.data.description && (
                    <p className="font-body mt-1.5 text-xs leading-5 text-gray-500 line-clamp-3">
                      {dishData.data.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-200 pt-3">
                    {dishData.data.prepTimeMinutes && (
                      <div>
                        <div className="font-body text-[10px] text-gray-400 uppercase tracking-wide">Prep Time</div>
                        <div className="font-display text-sm font-semibold text-neutral-800">{dishData.data.prepTimeMinutes} min</div>
                      </div>
                    )}
                    {dishData.data.calories && (
                      <div>
                        <div className="font-body text-[10px] text-gray-400 uppercase tracking-wide">Calories</div>
                        <div className="font-display text-sm font-semibold text-neutral-800">{dishData.data.calories} kcal</div>
                      </div>
                    )}
                    {dishData.data.cookTimeMinutes && (
                      <div>
                        <div className="font-body text-[10px] text-gray-400 uppercase tracking-wide">Cook Time</div>
                        <div className="font-display text-sm font-semibold text-neutral-800">{dishData.data.cookTimeMinutes} min</div>
                      </div>
                    )}
                  </div>

                  {/* Composition */}
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <div className="font-body text-[10px] font-semibold uppercase tracking-wide text-blue-800 mb-2">
                      {tComp("label")}
                    </div>
                    {dishData.data.composition && dishData.data.composition.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {dishData.data.composition.map((item, index) => (
                          <div key={item.ingredientId} className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                              <img
                                src={FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                                alt={item.ingredientName}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-display text-sm font-semibold text-neutral-900 leading-5">{item.ingredientName}</div>
                              <div className="font-body text-xs text-blue-700">{item.quantity} {item.unit}</div>
                              {item.note && (
                                <p className="text-[11px] text-gray-400 leading-4 line-clamp-1">{item.note}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">{tComp("no_composition")}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order Popup (logic unchanged) */}
            {dishData?.success && (
              <OrderPopup open={openPopup} onClose={() => setOpenPopup(false)} dish={dishData.data} />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render modal bằng Portal vào body để tránh bị ảnh hưởng bởi overflow-hidden
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
