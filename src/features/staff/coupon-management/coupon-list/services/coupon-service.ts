import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { CouponDTO } from "../types/coupon.types";

export const staffCouponService = {
    getCoupons: async (customerId?: number): Promise<CouponDTO[]> => {
        const query = typeof customerId === "number" ? `?customerId=${customerId}` : "";
        const response = await api.get<ApiResponse<CouponDTO[]>>(`/api/coupons${query}`);
        return response.data ?? [];
    },
};
