"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DishBreadcrumb,
  DishHero,
  DishNarrative,
  DishComposition,
  OrderPopup,
  useDishDetail,
} from "@/features/customer/dish-details";

interface DishDetailModalProps {
  dishId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DishDetailModal({ dishId, isOpen, onClose }: DishDetailModalProps) {
  const { data: dishData, isLoading, error } = useDishDetail(dishId || 0);
  const [openPopup, setOpenPopup] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !dishId) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10 w-full h-full max-w-[1400px] max-h-[95vh] mx-4 my-4 bg-stone-50 rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-[10000] flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-gray-700 shadow-lg hover:bg-white hover:text-gray-900 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="text-lg text-gray-600">Loading...</div>
                </div>
              ) : error || !dishData?.success ? (
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="text-lg text-red-600">
                    {error?.message || "Failed to load dish"}
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  {/* Hero Section */}
                  <DishHero dish={dishData.data} onOrderNow={() => setOpenPopup(true)} />

                  {/* Narrative & Composition */}
                  <section className="mx-auto w-full max-w-[1200px] px-3 pb-12 pt-6 md:px-4 md:pb-16 md:pt-8 lg:pb-20 lg:pt-10">
                    <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-[1fr_360px]">
                      <DishNarrative dish={dishData.data} />
                      <DishComposition dish={dishData.data} />
                    </div>
                  </section>

                  {/* Order Popup */}
                  <OrderPopup 
                    open={openPopup} 
                    onClose={() => setOpenPopup(false)} 
                    dish={dishData.data} 
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
