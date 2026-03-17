import { api } from '@/lib/http';
import { SaleInvoiceDto, SaleInvoiceListItem, SaleInvoiceListFilters } from '../types/invoice.types';
import { ApiResponse, PagedResult } from '@/types/api-response.types';

export const getSaleInvoiceDetail = async (id: number): Promise<SaleInvoiceDto> => {
    const response = await api.get<ApiResponse<SaleInvoiceDto>>(`/api/invoices/${id}`);
    if (response?.success && response?.data) {
        return response.data;
    }
    throw new Error(response?.userMessage || 'Failed to fetch invoice');
};

export const getSaleInvoiceList = async (filters: SaleInvoiceListFilters): Promise<PagedResult<SaleInvoiceListItem>> => {
    const params = new URLSearchParams();

    params.append('PageIndex', filters.pageIndex.toString());
    params.append('PageSize', filters.pageSize.toString());

    if (filters.search) {
        params.append('Search', filters.search);
    }
    if (filters.orderStatusCode !== undefined) {
        params.append('OrderStatusCode', filters.orderStatusCode);
    }
    if (filters.fromDate) {
        params.append('FromDate', filters.fromDate);
    }
    if (filters.toDate) {
        params.append('ToDate', filters.toDate);
    }

    const queryString = params.toString();
    const path = `/api/invoices${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<ApiResponse<PagedResult<SaleInvoiceListItem>>>(path);
    
    if (response?.success && response?.data) {
        return response.data;
    }
    
    throw new Error(response?.userMessage || 'Failed to fetch invoices');
};
