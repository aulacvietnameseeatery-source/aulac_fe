import { useState, useCallback, useRef } from 'react';
import { SaleInvoiceListItem } from '../types/invoice.types';
import { getSaleInvoiceList } from '../api/invoice-api';
import type { TableDataChangeParams } from '@/types/table-data-change.types';
import { OrderStatusCode } from '@/types/status-codes';

/**
 * Data-fetching hook for sale invoice list.
 */
export const useSaleInvoiceList = () => {
    const [invoices, setInvoices] = useState<SaleInvoiceListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [paginationInfo, setPaginationInfo] = useState({ page: 1, pageSize: 10 });

    // Dedup + latest-request tracking
    const latestParamsRef = useRef<TableDataChangeParams & {
        orderStatusCode?: OrderStatusCode;
        fromDate?: Date;
        toDate?: Date;
    }>({});
    const lastFetchHashRef = useRef('');
    const fetchIdRef = useRef(0);

    /** Called by onDataChange or manual trigger */
    const onDataChange = useCallback(async (
        params: TableDataChangeParams & {
            orderStatusCode?: OrderStatusCode;
            fromDate?: Date;
            toDate?: Date;
        }
    ) => {
        const hash = JSON.stringify(params);
        if (hash === lastFetchHashRef.current) return;
        lastFetchHashRef.current = hash;
        latestParamsRef.current = params;

        const currentFetchId = ++fetchIdRef.current;
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;

        setPaginationInfo({ page, pageSize });
        setIsLoading(true);

        try {
            const res = await getSaleInvoiceList({
                pageIndex: page,
                pageSize,
                search: params.search,
                orderStatusCode: params.orderStatusCode || OrderStatusCode.COMPLETED,
                fromDate: params.fromDate?.toISOString(),
                toDate: params.toDate?.toISOString(),
            });

            if (currentFetchId === fetchIdRef.current && res) {
                setInvoices(res.pageData);
                setTotalCount(res.totalCount);
            }
        } catch (error) {
            if (currentFetchId === fetchIdRef.current) {
                console.error('Failed to fetch invoices:', error);
            }
        } finally {
            if (currentFetchId === fetchIdRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    /** Re-fetch with the last known params */
    const refresh = useCallback(() => {
        lastFetchHashRef.current = '';
        onDataChange(latestParamsRef.current);
    }, [onDataChange]);

    return {
        invoices,
        isLoading,
        totalCount,
        paginationInfo,
        onDataChange,
        refresh,
        latestParamsRef,
    };
};
