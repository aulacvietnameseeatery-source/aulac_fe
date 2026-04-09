export type CouponType = "FIXED_AMOUNT" | "PERCENT";
export type CouponStatusCode = "ACTIVE" | "DISABLED" | "SCHEDULED" | "EXPIRED";

export interface CouponDTO {
    couponId: number;
    couponCode: string;
    couponName: string;
    customerId?: number | null;
    customerName?: string | null;
    startTime: string;
    endTime: string;
    discountValue: number;
    maxUsage: number | null;
    usedCount: number | null;
    type: CouponType;
    couponStatus: CouponStatusCode | string;
}

export interface CouponDetailDto {
    couponId: number;
    couponCode: string;
    couponName: string;
    description: string | null;
    startTime: string;
    endTime: string;
    discountValue: number;
    maxUsage: number | null;
    usedCount: number | null;
    type: CouponType;
    couponStatus: CouponStatusCode | string;
    createdAt: string | null;
}

export interface CouponFilters {
    search?: string;
    pageIndex: number;
    pageSize: number;
}

export interface PagedResult<T> {
    pageData: T[];
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    totalPage?: number;
}

export interface CreateCouponRequest {
    couponCode: string;
    couponName: string;
    description?: string;
    startTime: string;
    endTime: string;
    discountValue: number;
    maxUsage?: number | null;
    type: string;
}

export interface UpdateCouponRequest {
    couponCode: string;
    couponName: string;
    description?: string;
    startTime: string;
    endTime: string;
    discountValue: number;
    maxUsage?: number | null;
    type: string;
}
