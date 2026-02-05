"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Dish } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  dish: Dish;
};

export function OrderPopup({ open, onClose, dish }: Props) {
  const t = useTranslations("OrderPopup");
  const [qty, setQty] = useState(1);

  // reset quantity mỗi lần mở popup (tuỳ bạn)
  useEffect(() => {
    if (open) setQty(1);
  }, [open]);


  if (!open) return null;

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => q + 1);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* overlay */}
      <button
        type="button"
        aria-label="Close popup overlay"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* popup card */}
      <div className="relative w-full max-w-[360px] rounded-2xl bg-white shadow-2xl">
        <div className="w-full self-stretch p-10 flex flex-col justify-start items-start">
          {/* Close button */}
          <div className="w-full pb-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
              aria-label="Close"
            >
              <span className="text-slate-500 text-xl leading-none">×</span>
            </button>
          </div>

          {/* Category Name */}
          {dish.categoryName && (
            <div className="w-full pb-2">
              <div className="inline-block rounded-full bg-blue-800/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                {dish.categoryName}
              </div>
            </div>
          )}

          <div className="w-full pb-2">
            <div className="text-neutral-900 text-3xl font-normal leading-9">
              {dish.dishName}
            </div>
          </div>

          <div className="w-full pb-8">
            <div className="text-blue-950/80 text-lg font-medium leading-7">
              {dish.price}
            </div>
          </div>

          {/* Quantity box */}
          <div className="w-full pb-8">
            <div className="w-full px-4 py-3 bg-neutral-50 rounded-2xl flex items-center justify-between">
              <div className="text-slate-500 text-sm font-medium leading-5">
                {t("quantity_label")}
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={dec}
                  className="h-8 w-8 rounded-full bg-white outline outline-1 outline-offset-[-1px] outline-gray-200 flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <span className="text-neutral-900 text-xl leading-none">–</span>
                </button>

                <div className="w-4 text-center text-neutral-900 text-base font-bold leading-6">
                  {qty}
                </div>

                <button
                  type="button"
                  onClick={inc}
                  className="h-8 w-8 rounded-full bg-white outline outline-1 outline-offset-[-1px] outline-gray-200 flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <span className="text-neutral-900 text-xl leading-none">+</span>
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              className="h-12 rounded-2xl bg-blue-950 shadow-[0px_4px_6px_-4px_rgba(26,57,81,0.20)] shadow-[0px_10px_15px_-3px_rgba(26,57,81,0.20)] flex items-center justify-center"
            >
              <span className="text-white text-sm font-bold uppercase tracking-wider">
                {t("view_selection")}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex items-center justify-center"
            >
              <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">
                {t("continue_browsing")}
              </span>
            </button>
          </div>

          {/* Footer text */}
          <div className="w-full pt-6 flex justify-center">
            <div className="text-slate-500/40 text-[10px] font-normal uppercase tracking-wide">
              {t("footer_text")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
