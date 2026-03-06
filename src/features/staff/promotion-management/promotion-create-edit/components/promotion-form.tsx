"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PromotionStatusCode } from "@/types/status-codes";
import { mapFormToApi } from "../utils/promotion.utils";
import { usePromotionForm } from "../hooks/use-promotion-form";
import { ALCombobox } from "@/components/ui/al-combobox/al-combobox";
import { PromotionFormValues } from "../schemas/promotion.schema";
import { useTranslations } from "next-intl";

interface Props {
  initialData?: PromotionFormValues;
  isEditMode?: boolean;
  onSubmitAction: (data: any) => Promise<void>;
}

export const PromotionForm = ({ initialData, isEditMode = false, onSubmitAction }: Props) => {
  const router = useRouter();
  const t = useTranslations("Promotion.Form");
  const tStatus = useTranslations("Promotion.Status");
  const { form, dishOpts, cateOpts, currentStatus, permissions } = usePromotionForm(initialData, isEditMode);
  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = form;
  const { canEditCore, canEditEndTime, canDisable } = permissions;

  const onSubmit = async (data: PromotionFormValues) => {
    try {
      await onSubmitAction(mapFormToApi(data));
      toast.success(isEditMode ? t("successUpdate") : t("successCreate"));
      router.push("/dashboard/promotions");
    } catch (error) {
      toast.error(t("errorSave"));
    }
  };

  const handleDisable = async () => {
    if (!confirm(t("confirmDisable"))) return;
    try {
      const payload = mapFormToApi(form.getValues());
      payload.promotionStatus = PromotionStatusCode.DISABLED;
      await onSubmitAction(payload);
      toast.success(t("successDisable"));
      router.push("/dashboard/promotions");
    } catch (error) {}
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isEditMode && !canEditCore && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm font-medium">
          {t("statusLockWarning", { status: tStatus(currentStatus as any) || currentStatus })}
        </div>
      )}

      {/* 1. THÔNG TIN CƠ BẢN */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-800">{t("basicInfo")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">{t("promoCode")}</label>
            <input {...register("promoCode")} placeholder={t("promoCodePlaceholder")} disabled={isEditMode} className="w-full border px-3 py-2 rounded-lg mt-1 disabled:bg-slate-100 uppercase" />
            {errors.promoCode && <span className="text-red-500 text-xs mt-1">{errors.promoCode.message}</span>}
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">{t("promoName")}</label>
            <input {...register("promoName")} placeholder={t("promoNamePlaceholder")} className="w-full border px-3 py-2 rounded-lg mt-1" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">{t("desc")}</label>
            <textarea {...register("description")} placeholder={t("descPlaceholder")} className="w-full border px-3 py-2 rounded-lg mt-1 h-20" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">{t("start")}</label>
            <input type="datetime-local" {...register("startTime")} disabled={!canEditCore} className="w-full border px-3 py-2 rounded-lg mt-1 disabled:bg-slate-50" />
            {errors.startTime && <span className="text-red-500 text-xs mt-1">{errors.startTime.message}</span>}
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">{t("end")}</label>
            <input type="datetime-local" {...register("endTime")} disabled={!canEditEndTime} className="w-full border px-3 py-2 rounded-lg mt-1 disabled:bg-slate-50" />
            {errors.endTime && <span className="text-red-500 text-xs mt-1">{errors.endTime.message}</span>}
          </div>
        </div>
      </div>

      {/* 2. CẤU HÌNH GIẢM GIÁ */}
      <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm ${!canEditCore ? "opacity-60 pointer-events-none" : ""}`}>
        <h2 className="text-lg font-bold text-slate-800 mb-4">{t("discountConfig")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">{t("discountType")}</label>
            <select {...register("type")} className="w-full border px-3 py-2 rounded-lg mt-1 bg-white">
              <option value="PERCENT">{t("typePercent")}</option>
              <option value="FIXED_AMOUNT">{t("typeFixed")}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">{t("discountValue")}</label>
            <input type="number" step="0.01" {...register("discountValue")} placeholder={t("discountValuePlaceholder")} className="w-full border px-3 py-2 rounded-lg mt-1" />
            {errors.discountValue && <span className="text-red-500 text-xs mt-1">{errors.discountValue.message}</span>}
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">{t("maxUsage")}</label>
            <input type="number" {...register("maxUsage")} placeholder={t("unlimited")} className="w-full border px-3 py-2 rounded-lg mt-1" />
          </div>
        </div>
      </div>

      {/* 3. RULES & TARGETS */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${!canEditCore ? "opacity-60 pointer-events-none" : ""}`}>
        {/* Rules */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">{t("rules")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">{t("minOrder")}</label>
              <input type="number" {...register("ruleMinOrderValue")} placeholder={t("minOrderPlaceholder")} className="w-full border px-3 py-2 rounded-lg mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">{t("minQty")}</label>
              <input type="number" {...register("ruleMinQuantity")} placeholder={t("minQtyPlaceholder")} className="w-full border px-3 py-2 rounded-lg mt-1" />
            </div>
          </div>
          <Controller name="ruleRequiredDishIds" control={control} render={({ field }) => (
            <ALCombobox options={dishOpts} value={field.value} onChange={field.onChange} multiple title={t("reqDish")} placeholder={t("reqDishPlaceholder")} />
          )} />
          <Controller name="ruleRequiredCategoryIds" control={control} render={({ field }) => (
            <ALCombobox options={cateOpts} value={field.value} onChange={field.onChange} multiple title={t("reqCate")} placeholder={t("reqCatePlaceholder")} />
          )} />
        </div>

        {/* Targets */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">{t("targets")}</h2>
          <Controller name="targetDishIds" control={control} render={({ field }) => (
            <ALCombobox options={dishOpts} value={field.value} onChange={field.onChange} multiple title={t("targetDish")} placeholder={t("targetDishPlaceholder")} />
          )} />
          <Controller name="targetCategoryIds" control={control} render={({ field }) => (
            <ALCombobox options={cateOpts} value={field.value} onChange={field.onChange} multiple title={t("targetCate")} placeholder={t("targetCatePlaceholder")} />
          )} />
        </div>
      </div>

      {/* ACTION BUTTONS: Dời xuống cuối form */}
      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
        <div>
          {/* {canDisable && (
            <button type="button" onClick={handleDisable} className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold hover:bg-red-100 transition-colors w-full sm:w-auto">
              {t("btnDisable")}
            </button>
          )} */}
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors w-full sm:w-auto text-center">
            {t("btnCancel")}
          </button>
          <button type="submit" disabled={isSubmitting || currentStatus === "EXPIRED" || currentStatus === "DISABLED"} className="px-8 py-2.5 bg-[#1A3A51] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#122b3e] transition-colors w-full sm:w-auto">
            {isSubmitting ? t("btnSaving") : t("btnSave")}
          </button>
        </div>
      </div>
    </form>
  );
};