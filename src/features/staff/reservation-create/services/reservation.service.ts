import { ApiResponse } from '@/types/api-response.types';
import { CustomerDto, TableOptionDto, CreateReservationRequest, CreateReservationResponse } from '../types/types';
import { api } from "@/lib/http";
import { dateUtils } from '@/lib/date-utils';

export const reservationService = {
  searchCustomer: async (phone: string) => {
    try {
      const response = await api.get<ApiResponse<CustomerDto>>(`/api/customers/phone/${phone}`);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  getAvailableTables: async (date: string, time: string, size: number) => {
    const reservedTime = dateUtils.toUtcIso(date, time);
    const params = new URLSearchParams({
      reservedTime: reservedTime,
      partySize: size.toString()
    });
    const response = await api.get<ApiResponse<TableOptionDto[]>>(`/api/manual/table/availability?${params}`);
    return response.data;
  },

  createReservation: async (payload: CreateReservationRequest) => {
    const response = await api.post<ApiResponse<CreateReservationResponse>>("/api/manual/reservations", payload);
    return response.data;
  }
};