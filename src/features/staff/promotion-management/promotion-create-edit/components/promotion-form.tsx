"use client";

import React, { useMemo } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PromotionStatusCode } from "@/types/status-codes";
import { mapFormToApi } from "../utils/promotion.utils";
import { usePromotionForm } from "../hooks/use-promotion-form";
import { ALCombobox } from "@/components/ui/al-combobox/al-combobox";
import { PromotionFormValues } from "../schemas/promotion.schema";
import { useTranslations } from "next-intl";
import { ALInput } from "@/components/ui/al-input";
import { Button } from "@/components/ui/button";

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

  const typeOptions = useMemo(() => [
    { value: "PERCENT", label: t("typePercent") },
    { value: "FIXED_AMOUNT", label: t("typeFixed") }
  ], [t]);

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
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">{t("promoCode")}</label>
            <ALInput 
              {...register("promoCode")} 
              placeholder={t("promoCodePlaceholder")} 
              disabled={isEditMode} 
              className="uppercase"
              error={errors.promoCode?.message} 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">{t("promoName")}</label>
            <ALInput 
              {...register("promoName")} 
              placeholder={t("promoNamePlaceholder")} 
              error={errors.promoName?.message} 
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">{t("desc")}</label>
            <textarea {...register("description")} placeholder={t("descPlaceholder")} className="w-full border px-3 py-2 rounded-lg mt-1 h-20" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">{t("start")}</label>
            <ALInput 
              type="datetime-local" 
              {...register("startTime")} 
              disabled={!canEditCore} 
              error={errors.startTime?.message} 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">{t("end")}</label>
            <ALInput 
              type="datetime-local" 
              {...register("endTime")} 
              disabled={!canEditEndTime} 
              error={errors.endTime?.message} 
            />
          </div>
        </div>
      </div>

      {/* 2. CẤU HÌNH GIẢM GIÁ */}
      <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm ${!canEditCore ? "opacity-60 pointer-events-none" : ""}`}>
        <h2 className="text-lg font-bold text-slate-800 mb-4">{t("discountConfig")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">{t("discountType")}</label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <ALCombobox
                  options={typeOptions}
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  placeholder="Select type"
                  error={errors.type?.message}
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">{t("discountValue")}</label>
            <ALInput 
              type="number" 
              step="0.01" 
              {...register("discountValue")} 
              placeholder={t("discountValuePlaceholder")} 
              error={errors.discountValue?.message} 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">{t("maxUsage")}</label>
            <ALInput 
              type="number" 
              {...register("maxUsage")} 
              placeholder={t("unlimited")} 
              error={errors.maxUsage?.message} 
            />
          </div>
        </div>
      </div>

      {/* 3. RULES & TARGETS */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${!canEditCore ? "opacity-60 pointer-events-none" : ""}`}>
        {/* Rules */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">{t("rules")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase">{t("minOrder")}</label>
              <ALInput 
                type="number" 
                {...register("ruleMinOrderValue")} 
                placeholder={t("minOrderPlaceholder")} 
                error={errors.ruleMinOrderValue?.message} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase">{t("minQty")}</label>
              <ALInput 
                type="number" 
                {...register("ruleMinQuantity")} 
                placeholder={t("minQtyPlaceholder")} 
                error={errors.ruleMinQuantity?.message} 
              />
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

      {/* ACTION BUTTONS */}
      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
        <div>

        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()} 
            className="w-full sm:w-auto"
          >
            {t("btnCancel")}
          </Button>
          <Button 
            type="submit" 
            variant="default"
            isLoading={isSubmitting}
            disabled={currentStatus === "EXPIRED" || currentStatus === "DISABLED"} 
            className="w-full sm:w-auto"
          >
            {isSubmitting ? t("btnSaving") : t("btnSave")}
          </Button>
        </div>
      </div>
    </form>
  );
};