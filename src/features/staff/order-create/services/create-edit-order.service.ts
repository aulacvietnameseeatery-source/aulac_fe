import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { DishDto, TableDto, CustomerDto, CreateOrderRequest, CategoryDto, RecentOrderDto } from "../types/create-order.types";
import { AddOrderItemsRequest, OrderDetailDto } from "../types/edit-order.types";

export const createOrderService = {
  getDishes: async (): Promise<DishDto[]> => {
    const res = await api.get<ApiResponse<DishDto[]>>('/api/dishes?active=true');
    return res.data;
  },

  getCategories: async (): Promise<CategoryDto[]> => {
    const res = await api.get<ApiResponse<CategoryDto[]>>('/api/dishes/all-categories');
    return res.data;
  },

  getTables: async (): Promise<TableDto[]> => {
    const res = await api.get<ApiResponse<TableDto[]>>('/api/tables/select');
    return res.data;
  },

  getCustomerByPhone: async (phone: string): Promise<CustomerDto> => {
    const res = await api.get<ApiResponse<CustomerDto>>(`/api/customers/phone/${phone}`);
    return res.data;
  },

  createOrder: async (payload: CreateOrderRequest): Promise<void> => {
    await api.post<ApiResponse<any>>('/api/orders/staff', payload);
  },

  getOrderById: async (id: number): Promise<OrderDetailDto> => {
    const res = await api.get<ApiResponse<OrderDetailDto>>(`/api/orders/${id}`);
    return res.data;
  },

  addItemsToOrder: async (orderId: number, payload: AddOrderItemsRequest): Promise<void> => {
    await api.post(`/api/orders/staff/${orderId}/items`, payload);
  },

  getRecentOrders: async (limit: number = 20): Promise<RecentOrderDto[]> => {
    const res = await api.get<ApiResponse<RecentOrderDto[]>>(`/api/orders/recent?limit=${limit}`);
    return res.data;
  }
};