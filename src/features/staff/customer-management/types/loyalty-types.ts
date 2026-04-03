export interface LoyaltyExchangeRequest {
    customerId: number;
    points: number;
}

export interface LoyaltyExchangeResultDto {
    customerId: number;
    spentPoints: number;
    remainingPoints: number;
    couponId: number;
    couponCode: string;
    couponName: string;
    discountValue: number;
    startTime: string;
    endTime: string;
}

export interface LoyaltyCouponHistoryDto {
    couponId: number;
    customerId: number | null;
    couponCode: string;
    couponName: string;
    discountValue: number;
    startTime: string;
    endTime: string;
    maxUsage: number | null;
    usedCount: number | null;
    couponStatus: string;
    redemptionStatus: string;
    isExpired: boolean;
    isUsed: boolean;
}

export interface LoyaltyRedemptionSettings {
    redemptionEnabled: boolean;
    pointsToCurrencyRatio: number;
    minRedemptionPoints: number;
}