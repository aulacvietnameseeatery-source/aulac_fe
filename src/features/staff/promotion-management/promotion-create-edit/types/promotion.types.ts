import { PromotionStatusCode } from "@/types/status-codes";
import { ApiResponse } from "@/types/api-response.types";

export type PromotionType = "PERCENT" | "FIXED_AMOUNT";

export interface CategoryDto {
  categoryId: number;
  nameVi: string;
  nameEn: string;
  nameFr: string;
}

export interface LocalizedDishInfo {
  dishName: string;
  description: string;
  slogan?: string | null;
  note?: string | null;
  shortDescription?: string | null;
}

export interface DishDto {
  dishId: number;
  categoryId: number;
  price: number;
  chefRecommended?: boolean | null;
  displayOrder?: number | null;
  i18n: Record<string, LocalizedDishInfo>;
}

export interface PromotionRuleDto {
  ruleId?: number;
  minOrderValue?: number | null;
  minQuantity?: number | null;
  requiredDishId?: number | null;
  requiredCategoryId?: number | null;
}

export interface PromotionTargetDto {
  targetId?: number;
  dishId?: number | null;
  categoryId?: number | null;
}

export interface PromotionDto {
  promotionId?: number;
  promoCode: string;
  promoName?: string | null;
  description?: string | null;
  startTime: string; 
  endTime: string;
  type: PromotionType;
  promotionStatus: PromotionStatusCode;
  discountValue: number;
  maxUsage?: number | null;
  promotionRules: PromotionRuleDto[];
  promotionTargets: PromotionTargetDto[];
}

export interface PromotionDetailDto extends PromotionDto {
  usedCount: number;  
}