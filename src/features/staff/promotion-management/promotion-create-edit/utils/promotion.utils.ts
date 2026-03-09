import { PromotionDto, PromotionRuleDto, PromotionTargetDto } from "../types/promotion.types";
import { PromotionFormValues } from "../schemas/promotion.schema";

export const utcToLocalDatetimeLocal = (utcStr?: string): string => {
  if (!utcStr) return "";
  const dateStr = utcStr.endsWith('Z') ? utcStr : `${utcStr}Z`;
  const date = new Date(dateStr);
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
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

  return {
    promoCode: formData.promoCode,
    promoName: formData.promoName ?? null,
    description: formData.description,
    startTime: new Date(formData.startTime).toISOString(),
    endTime: new Date(formData.endTime).toISOString(),
    type: formData.type,
    discountValue: formData.discountValue,
    maxUsage: formData.maxUsage,
    promotionRules: rules,
    promotionTargets: targets,
  };
};