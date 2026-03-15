export type CouponType = "FIXED_AMOUNT" | "PERCENT";
export type CouponStatusCode = "ACTIVE" | "DISABLED" | "SCHEDULED" | "EXPIRED";

export interface CouponDTO {
    couponId: number;
    couponCode: string;
    couponName: string;
    startTime: string;
    endTime: string;
    discountValue: number;
    maxUsage: number | null;
    usedCount: number | null;
    type: CouponType;
    couponStatus: CouponStatusCode | string;
}
