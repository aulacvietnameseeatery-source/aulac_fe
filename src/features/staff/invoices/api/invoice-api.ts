import { api } from '@/lib/http';
import { SaleInvoiceDto } from '../types/invoice.types';
import { ApiResponse } from '@/types/api-response.types';

export const getSaleInvoiceDetail = async (id: number): Promise<SaleInvoiceDto> => {
    const response = await api.get<ApiResponse<SaleInvoiceDto>>(`/api/invoices/${id}`);
    if (response?.success && response?.data) {
        return response.data;
    }
    throw new Error(response?.userMessage || 'Failed to fetch invoice');
};
