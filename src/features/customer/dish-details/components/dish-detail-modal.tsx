"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDishDetail } from "@/features/customer/dish-details";
import { TableSelectionModal } from "@/features/customer/menu-listing-new/components/table-selection-modal";
import { useTranslations } from "next-intl";
import Script from "next/script";
import { useLandingPageSettings } from "@/hooks/use-landing-page-settings";

declare global {
  interface Window {
    cloudinary: any;
  }
}

interface DishDetailModalProps {
  dishId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (item: { id: string; name: string; price: number; image: string; desc: string }) => void;
}

const FALLBACK_IMAGES = [
  "/images/dish-detail/dish-composition-rice/dish-compostion-rice.png",
  "/images/dish-detail/dish-composition-imperial/dish-compostion-imperial.png",
  "/images/dish-detail/dish-composition-mam-ruoc/dish-composition-mam-ruoc.png",
];

const HERO_IMAGE = "/images/dish-detail/dish-hero/dish-hero.png";
const CLOUD_NAME = "dkstc8tkg";
const SPIN_TAG = "tiramisu-360";

export function DishDetailModal({ dishId, isOpen, onClose, onAddToCart }: DishDetailModalProps) {
  const { data: dishData, isLoading, error } = useDishDetail(dishId || 0);
  const [openPopup, setOpenPopup] = useState(false);
  const [viewMode, setViewMode] = useState<"photo" | "360" | "video">("photo");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const galleryRef = useRef<any>(null);

  const tHero = useTranslations("DishDetails.Hero");
  const tComp = useTranslations("DishDetails.Composition");
  const { data: landingSettings } = useLandingPageSettings();

  // Determine available modes based on system settings
  const availableModes = (["photo", "360", "video"] as const).filter((mode) => {
    if (!landingSettings) return true; // Default to all if settings not loaded yet
    if (mode === "photo") return landingSettings.showDishImage;
    if (mode === "360") return landingSettings.showDishImage360;
    if (mode === "video") return landingSettings.showDishVideo;
    return true;
  });


  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  // Reset view mode and image index when modal opens
  useEffect(() => {
    if (isOpen) {
      // Set to first available mode
      if (availableModes.length > 0) {
        setViewMode(availableModes[0]);
      } else {
        setViewMode("photo");
      }
      setCurrentImageIndex(0);
    }
  }, [isOpen, availableModes]);

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
            className="absolute inset-0 bg-[#0a0f1e]/75 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal – dark navy gold theme */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 w-full max-w-[760px] bg-[#0f172a] border border-[#C5A059]/40 rounded-xl shadow-2xl overflow-hidden font-sans"
          >
            {/* Gold corner accents */}
            <div className="pointer-events-none absolute inset-[6px] z-0 rounded-lg border border-[#C5A059]/20" />

            {/* Close */}
            <button
              onClick={onClose}
              className={`absolute top-3 right-3 z-[10000] flex h-8 w-8 items-center justify-center rounded-full bg-[#C5A059]/10 border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059]/20 hover:text-[#e8c97a] transition-all duration-200 ${openPopup ? "hidden" : ""}`}
            >
              <X className="h-4 w-4" />
            </button>

            {/* ─── CONTENT ─── */}
            {isLoading ? (
              <div className="flex h-72 items-center justify-center">
                <div className="text-base text-[#C5A059]/70 tracking-widest uppercase text-xs">Loading…</div>
              </div>
            ) : error || !dishData?.success ? (
              <div className="flex h-72 items-center justify-center">
                <div className="text-base text-red-400">{error?.message || "Failed to load dish"}</div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row">
                {/* ── LEFT: Image panel — unified flex-col layout on all breakpoints ── */}
                <div className="w-full md:w-[380px] md:shrink-0 flex flex-col bg-[#0a0f1e] md:border-r border-[#C5A059]/30 shrink-0">
                  <Script src="https://product-gallery.cloudinary.com/all.js" strategy="lazyOnload" />

                  {/* Tab row — in-flow, top of panel */}
                  <div className="flex-none flex items-center justify-center gap-1 px-3 pt-3 pb-2">
                    {availableModes.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setViewMode(mode)}
                        className={`font-body rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${viewMode === mode
                            ? "bg-[#FFAB2D] text-[#1A3A52] shadow-sm"
                            : "text-white/60 hover:text-white"
                          }`}
                      >
                        {mode === "photo" ? tHero("photo") : mode === "360" ? tHero("view_360") : tHero("video")}
                      </button>
                    ))}
                  </div>

                  {/* Inset content box — margin on all sides, visually separated */}
                  <div className="flex-none mx-3 mb-2 rounded-xl overflow-hidden relative h-[320px] md:h-[360px]">
                    {/* Photo — multi-image carousel */}
                    {viewMode === "photo" && (() => {
                      const images = dishData.data.imageUrls?.length ? dishData.data.imageUrls : [HERO_IMAGE];
                      const total = images.length;
                      const safeIdx = Math.min(currentImageIndex, total - 1);
                      return (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1e]">
                          <img
                            key={safeIdx}
                            src={images[safeIdx]}
                            alt={`${dishData.data.dishName} ${safeIdx + 1}`}
                            className="max-h-full max-w-full object-contain animate-in fade-in duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 via-transparent to-transparent pointer-events-none" />

                          {/* Prev / Next arrows — only when multiple images */}
                          {total > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={() => setCurrentImageIndex((safeIdx - 1 + total) % total)}
                                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setCurrentImageIndex((safeIdx + 1) % total)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>

                              {/* Dot indicators */}
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                                {images.map((_, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setCurrentImageIndex(i)}
                                    className={`rounded-full transition-all duration-200 ${i === safeIdx
                                        ? "w-4 h-1.5 bg-[#FFAB2D]"
                                        : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                                      }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()}

                    {/* 360 */}
                    <div
                      id="cloudinary-360-modal"
                      className={`absolute inset-0 w-full h-full z-10 bg-[#0a0f1e] ${viewMode === "360" ? "block" : "hidden"}`}
                    />

                    {/* Video */}
                    {viewMode === "video" && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black animate-in fade-in">
                        {dishData.data.videoUrl ? (
                          <video
                            key={dishData.data.videoUrl}
                            src={dishData.data.videoUrl}
                            controls
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <p className="text-[#C5A059] text-sm font-medium tracking-widest uppercase">Video Coming Soon</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Now button — in-flow, bottom of panel */}
                  <div className="flex-none px-3 pb-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (onAddToCart && dishData?.data) {
                          onAddToCart({
                            id: String(dishData.data.dishId),
                            name: dishData.data.dishName,
                            price: dishData.data.price,
                            image: dishData.data.imageUrls?.[0] || '',
                            desc: dishData.data.shortDescription || dishData.data.description || '',
                          });
                          onClose();
                        } else {
                          setOpenPopup(true);
                        }
                      }}
                      className="w-full h-10 rounded-lg bg-[#FFAB2D] px-4 shadow-lg hover:bg-[#FFAB2D]/90 transition-colors"
                    >
                      <span className="font-body text-sm font-bold text-[#1A3A52] tracking-widest uppercase">{tHero("order_now")}</span>
                    </button>
                  </div>
                </div>

                {/* ── RIGHT: Info panel ── */}
                <div className="flex-1 px-6 py-5 overflow-y-auto no-scrollbar max-h-[340px] md:max-h-[480px] bg-[#0f172a]">
                  {/* Category badge */}
                  {dishData.data.categoryName && (
                    <span className="font-body inline-block rounded-full border border-[#C5A059]/50 bg-[#C5A059]/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#C5A059]">
                      {dishData.data.categoryName}
                    </span>
                  )}

                  {/* Name */}
                  <h2 className="font-display mt-3 text-2xl font-bold leading-tight text-[#f5ead8] tracking-wide">
                    {dishData.data.dishName}
                  </h2>

                  {/* Price */}
                  <div className="font-display mt-1.5 text-lg font-bold text-[#C5A059]">
                    {dishData.data.price?.toLocaleString("en-US")} CHF
                  </div>

                  {/* Divider */}
                  <div className="my-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-[#C5A059]/30" />
                    <div className="h-1 w-1 rounded-full bg-[#C5A059]/50" />
                    <div className="h-px flex-1 bg-[#C5A059]/30" />
                  </div>

                  {/* Slogan */}
                  {dishData.data.slogan && (
                    <p className="font-body text-sm italic leading-5 text-[#C5A059]/70">
                      &ldquo;{dishData.data.slogan}&rdquo;
                    </p>
                  )}

                  {/* Short description */}
                  {dishData.data.shortDescription && (
                    <p className="font-body mt-2 text-xs leading-5 text-[#f5ead8]/60">
                      {dishData.data.shortDescription}
                    </p>
                  )}

                  {/* Description */}
                  {dishData.data.description && (
                    <p className="font-body mt-1.5 text-xs leading-5 text-[#f5ead8]/50 line-clamp-3">
                      {dishData.data.description}
                    </p>
                  )}

                  {/* Stats – only render when at least one value exists */}
                  {(dishData.data.prepTimeMinutes || dishData.data.calories || dishData.data.cookTimeMinutes) && (
                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#C5A059]/20 pt-4">
                      {dishData.data.prepTimeMinutes && (
                        <div className="text-center">
                          <div className="font-body text-[9px] text-[#C5A059]/60 uppercase tracking-widest">Prep</div>
                          <div className="font-display text-sm font-bold text-[#f5ead8]">{dishData.data.prepTimeMinutes}<span className="text-[10px] font-normal text-[#C5A059]/60 ml-0.5">min</span></div>
                        </div>
                      )}
                      {dishData.data.calories && (
                        <div className="text-center">
                          <div className="font-body text-[9px] text-[#C5A059]/60 uppercase tracking-widest">Kcal</div>
                          <div className="font-display text-sm font-bold text-[#f5ead8]">{dishData.data.calories}</div>
                        </div>
                      )}
                      {dishData.data.cookTimeMinutes && (
                        <div className="text-center">
                          <div className="font-body text-[9px] text-[#C5A059]/60 uppercase tracking-widest">Cook</div>
                          <div className="font-display text-sm font-bold text-[#f5ead8]">{dishData.data.cookTimeMinutes}<span className="text-[10px] font-normal text-[#C5A059]/60 ml-0.5">min</span></div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Composition */}
                  <div className="mt-4 border-t border-[#C5A059]/20 pt-4">
                    <div className="font-body text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mb-3 flex items-center gap-2">
                      <div className="h-px flex-1 bg-[#C5A059]/30" />
                      <span>{tComp("label")}</span>
                      <div className="h-px flex-1 bg-[#C5A059]/30" />
                    </div>
                    {dishData.data.composition && dishData.data.composition.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {dishData.data.composition.map((item, index) => (
                          <div key={item.ingredientId} className="flex items-center gap-3 border border-[#C5A059]/15 bg-[#C5A059]/5 px-3 py-2 rounded">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-[#C5A059]/30">
                              <img
                                src={FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                                alt={item.ingredientName}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-display text-xs font-semibold text-[#f5ead8] leading-5">{item.ingredientName}</div>
                              <div className="font-body text-[11px] text-[#C5A059]">{item.quantity} {item.unit}</div>
                              {item.note && (
                                <p className="text-[10px] text-[#f5ead8]/40 leading-4 line-clamp-1">{item.note}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#f5ead8]/30 italic">{tComp("no_composition")}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Table Selection / QR Modal */}
            <TableSelectionModal
              isOpen={openPopup}
              onConfirm={() => setOpenPopup(false)}
              onClose={() => setOpenPopup(false)}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render modal bằng Portal vào body để tránh bị ảnh hưởng bởi overflow-hidden
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
