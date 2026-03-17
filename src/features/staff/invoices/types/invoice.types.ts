import { OrderStatusCode } from '@/types/status-codes';

export interface SaleInvoiceItemDto {
    orderItemId: number;
    quantity: number;
    itemName: string;
    itemPrice: number;
    amount: number;
    note?: string;
}

export interface SaleInvoiceDto {
    orderId: number;
    invoiceCode: string;
    createdAt: string;

    restaurantName: string;
    restaurantAddress: string;
    restaurantPhone: string;

    orderType: string;
    tableCode: string;

    staffName: string;
    customerName: string;
    customerPhone: string;

    subTotal: number;
    discountAmount: number;
    totalAmount: number;
    isPaid: boolean;

    items: SaleInvoiceItemDto[];
}

// For invoice list
export interface SaleInvoiceListItem {
    orderId: number;
    invoiceCode: string;
    createdAt: string;
    tableCode: string;
    staffName: string;
    customerName: string;
    totalAmount: number;
    tipAmount: number;
    orderStatus: string;
    paymentMethod: string;
}

export interface SaleInvoiceListFilters {
    pageIndex: number;
    pageSize: number;
    search?: string;
    orderStatusCode?: OrderStatusCode;
    fromDate?: string;
    toDate?: string;
}
