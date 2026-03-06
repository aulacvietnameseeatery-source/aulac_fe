import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPromotionSchema, PromotionFormValues } from "../schemas/promotion.schema";
import { promotionService } from "../services/promotion.service";
import { PromotionStatusCode } from "@/types/status-codes";
import { ALComboboxOption } from "@/components/ui/al-combobox/al-combobox.types";
import { useLocale, useTranslations } from "next-intl";

export const usePromotionForm = (initialData?: PromotionFormValues, isEditMode = false) => {
  const locale = useLocale() as 'vi' | 'en' | 'fr';
  const tValidation = useTranslations("Promotion.Validation");
  const [dishOpts, setDishOpts] = useState<ALComboboxOption[]>([]);
  const [cateOpts, setCateOpts] = useState<ALComboboxOption[]>([]);

  const schema = useMemo(() => createPromotionSchema(tValidation), [tValidation]);

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: initialData || {
      promoCode: "", promoName: "", description: "",
      startTime: "", endTime: "", type: "PERCENT", discountValue: 0,
      ruleMinOrderValue: 0, ruleMinQuantity: 0, ruleRequiredDishIds: [], ruleRequiredCategoryIds: [],
      targetDishIds: [], targetCategoryIds: []
    }
  });

  const { watch, reset } = form;

  // Update the form when initialData changes (after fetching the API).
  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  // Fetch Options
  useEffect(() => {
    Promise.all([promotionService.getDishes(), promotionService.getCategories()]).then(([d, c]) => {
      setDishOpts(d.map(item => {
        const name = item.i18n?.[locale]?.dishName || item.i18n?.['en']?.dishName || `Dish #${item.dishId}`;
        return { label: name, value: item.dishId };
      }));
      setCateOpts(c.map(item => {
        const name = locale === 'vi' ? item.nameVi : locale === 'fr' ? item.nameFr : item.nameEn;
        return { label: name, value: item.categoryId };
      }));
    });
  }, [locale]);

  const watchStart = watch("startTime");
  const watchEnd = watch("endTime");
  const initStatus = form.getValues("initialStatus");

  const currentStatus = useMemo(() => {
    if (isEditMode && initStatus === PromotionStatusCode.DISABLED) return initStatus;
    const now = new Date();
    if (!watchStart) return PromotionStatusCode.SCHEDULED;
    if (watchEnd && now > new Date(watchEnd)) return PromotionStatusCode.EXPIRED;
    if (now >= new Date(watchStart) && now <= new Date(watchEnd)) return PromotionStatusCode.ACTIVE;
    return PromotionStatusCode.SCHEDULED;
  }, [watchStart, watchEnd, isEditMode, initStatus]);

  const isScheduled = currentStatus === PromotionStatusCode.SCHEDULED;
  const isActive = currentStatus === PromotionStatusCode.ACTIVE;
  const isDisabled = currentStatus === PromotionStatusCode.DISABLED;

  const canEditCore = !isEditMode || isScheduled;
  const canEditEndTime = canEditCore || isActive || isDisabled;
  const canDisable = isEditMode && isActive;

  return { form, dishOpts, cateOpts, currentStatus, permissions: { canEditCore, canEditEndTime, canDisable } };
};