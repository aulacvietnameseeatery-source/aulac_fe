export type PromotionType = "FIXED_AMOUNT" | "PERCENT";
export type PromotionStatusCode = "ACTIVE" | "DISABLED" | "SCHEDULED" | "EXPIRED";

export interface GetPromotionsParams {
    pageIndex: number;
    pageSize: number;
    search?: string;
    promotionStatus?: PromotionStatusCode | "All";
    type?: PromotionType | "All";
    fromDate?: string;
    toDate?: string;
}

export interface PromotionListDTO {
    promotionId: number;
    promoCode: string;
    promoName: string;
    startTime: string;
    endTime: string;
    discountValue: number;
    maxUsage: number | null;
    usedCount: number | null;
    type: PromotionType;
    promotionStatus: PromotionStatusCode;
}

export interface AvailablePromotionDTO {
    promotionId: number;
    promoCode: string;
    promoName: string;
    promotionType: string;
    hasTarget: boolean;
    discountValue: number;
    estimatedDiscount: number;
    finalAmount: number;
    appliedRule?: Record<string, string> | null;
    targetDishIds: number[];
    targetCategoryIds: number[];
}