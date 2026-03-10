import { api } from "@/lib/http";
import { SupplierDetail } from "../types";

interface ApiResponse<T> {
  success: boolean;
  code: number;
  userMessage: string;
  data: T;
}

export const supplierDetailService = {
  getSupplierDetail: async (id: number): Promise<SupplierDetail> => {
    const response = await api.get<ApiResponse<SupplierDetail>>(`/api/suppliers/${id}`);
    return response.data;
  },
};
