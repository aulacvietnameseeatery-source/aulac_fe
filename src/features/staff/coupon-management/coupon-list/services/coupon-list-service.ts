import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { 
  CouponDTO, 
  CouponDetailDto,
  CouponFilters, 
  PagedResult,
  CreateCouponRequest,
  UpdateCouponRequest 
} from "../types/coupon.types";

export const couponListService = {
  /**
   * Get paginated coupons with filters
   */
  getCoupons: async (filters: CouponFilters): Promise<PagedResult<CouponDTO>> => {
    const query = new URLSearchParams();
    
    if (filters.search) {
      query.append("search", filters.search);
    }
    
    query.append("pageIndex", filters.pageIndex.toString());
    query.append("pageSize", filters.pageSize.toString());

    const response = await api.get<ApiResponse<PagedResult<CouponDTO>>>(
      `/api/coupons/list?${query.toString()}`
    );
    return response.data;
  },

  /**
   * Get coupon details by ID
   */
  getCouponById: async (id: number): Promise<CouponDetailDto> => {
    const response = await api.get<ApiResponse<CouponDetailDto>>(`/api/coupons/${id}`);
    return response.data;
  },

  /**
   * Create a new coupon
   */
  createCoupon: async (request: CreateCouponRequest): Promise<CouponDTO> => {
    const response = await api.post<ApiResponse<CouponDTO>>("/api/coupons", request);
    return response.data;
  },

  /**
   * Update an existing coupon
   */
  updateCoupon: async (id: number, request: UpdateCouponRequest): Promise<CouponDTO> => {
    const response = await api.put<ApiResponse<CouponDTO>>(`/api/coupons/${id}`, request);
    return response.data;
  },

  /**
   * Delete a coupon
   */
  deleteCoupon: async (id: number): Promise<void> => {
    await api.delete(`/api/coupons/${id}`);
  },

  /**
   * Disable a coupon
   */
  disableCoupon: async (id: number): Promise<void> => {
    await api.put(`/api/coupons/${id}/disable`, {});
  },

  /**
   * Activate a coupon
   */
  activateCoupon: async (id: number): Promise<void> => {
    await api.put(`/api/coupons/${id}/activate`, {});
  },
};
