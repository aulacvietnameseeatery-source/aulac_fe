import { PromotionDto, PromotionRuleDto, PromotionTargetDto } from "../types/promotion.types";
import { PromotionFormValues } from "../schemas/promotion.schema";
import { dateUtils } from "@/lib/date-utils";

export const utcToLocalDatetimeLocal = (utcStr?: string): string => {
  if (!utcStr) return "";
  const dateStringWithZ = utcStr.endsWith('Z') ? utcStr : `${utcStr}Z`;
  return dateUtils.formatLocal(dateStringWithZ, "yyyy-MM-dd'T'HH:mm");
};

export const mapApiToForm = (apiData: PromotionDto): PromotionFormValues => {
  const firstRule = apiData.promotionRules?.[0];
  return {
    ...apiData,
    startTime: apiData.startTime?.slice(0, 16) || "",
    endTime: apiData.endTime?.slice(0, 16) || "",
    initialStatus: apiData.promotionStatus,
    ruleMinOrderValue: firstRule?.minOrderValue ?? 0,
    ruleMinQuantity: firstRule?.minQuantity ?? 0,
    ruleRequiredDishIds: apiData.promotionRules?.map(r => r.requiredDishId).filter(Boolean) as number[] || [],
    ruleRequiredCategoryIds: apiData.promotionRules?.map(r => r.requiredCategoryId).filter(Boolean) as number[] || [],
    targetDishIds: apiData.promotionTargets?.map(t => t.dishId).filter(Boolean) as number[] || [],
    targetCategoryIds: apiData.promotionTargets?.map(t => t.categoryId).filter(Boolean) as number[] || [],
  } as PromotionFormValues;
};

export const mapFormToApi = (formData: PromotionFormValues): Partial<PromotionDto> => {
  const rules: PromotionRuleDto[] = [];
  const targets: PromotionTargetDto[] = [];
  const { ruleMinOrderValue, ruleMinQuantity, ruleRequiredDishIds, ruleRequiredCategoryIds } = formData;
  
  if (ruleRequiredDishIds.length === 0 && ruleRequiredCategoryIds.length === 0) {
    
    if ((ruleMinOrderValue != null && ruleMinOrderValue > 0) || (ruleMinQuantity != null && ruleMinQuantity > 0)) {
      rules.push({ minOrderValue: ruleMinOrderValue, minQuantity: ruleMinQuantity, requiredDishId: null, requiredCategoryId: null });
    }
  } else {
    ruleRequiredDishIds.forEach(id => rules.push({ minOrderValue: ruleMinOrderValue, minQuantity: ruleMinQuantity, requiredDishId: id, requiredCategoryId: null }));
    ruleRequiredCategoryIds.forEach(id => rules.push({ minOrderValue: ruleMinOrderValue, minQuantity: ruleMinQuantity, requiredDishId: null, requiredCategoryId: id }));
  }

  const { targetDishIds, targetCategoryIds } = formData;
  if (targetDishIds.length > 0 || targetCategoryIds.length > 0) {
    targetDishIds.forEach(id => targets.push({ dishId: id, categoryId: null }));
    targetCategoryIds.forEach(id => targets.push({ dishId: null, categoryId: id }));
  }

  const [startDate, startTimeStr] = formData.startTime.split("T");
  const [endDate, endTimeStr] = formData.endTime.split("T");

  return {
    promoCode: formData.promoCode,
    promoName: formData.promoName ?? null,
    description: formData.description,
    startTime: dateUtils.toUtcIso(startDate, startTimeStr),
    endTime: dateUtils.toUtcIso(endDate, endTimeStr),
    type: formData.type,
    discountValue: formData.discountValue,
    maxUsage: formData.maxUsage,
    promotionRules: rules,
    promotionTargets: targets,
  };
};