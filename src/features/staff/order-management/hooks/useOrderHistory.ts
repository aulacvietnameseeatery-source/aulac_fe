import { useState, useCallback, useRef } from 'react';
import { OrderHistory } from '../types/order-history.types';
import { orderHistoryService } from '../services/order-history.service';
import type { TableDataChangeParams } from '@/types/table-data-change.types';

/**
 * Data-fetching hook for order history.
 * Driven by onDataChange — accepts search/page/pageSize from caller.
 * Extra param: orderStatusLvId (column filter, not part of BaseTable schema).
 */
export const useOrderHistory = () => {
    const [orders, setOrders] = useState<OrderHistory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [paginationInfo, setPaginationInfo] = useState({ page: 1, pageSize: 10 });

    // Dedup + latest-request tracking
    const latestParamsRef = useRef<TableDataChangeParams & { orderStatusLvId?: number; fromDate?: Date; toDate?: Date }>({});
    const lastFetchHashRef = useRef('');
    const fetchIdRef = useRef(0);

    /** Called by BaseTable onDataChange or manual trigger */
    const onDataChange = useCallback(async (
        params: TableDataChangeParams & { orderStatusLvId?: number; fromDate?: Date; toDate?: Date }
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
            const res = await orderHistoryService.getOrderHistory({
                pageIndex: page,
                pageSize,
                search: params.search || undefined,
                orderStatusLvId: params.orderStatusLvId,
                fromDate: params.fromDate?.toISOString(),
                toDate: params.toDate?.toISOString(),
            });

            if (currentFetchId === fetchIdRef.current && res) {
                setOrders(res.pageData);
                setTotalCount(res.totalCount);
            }
        } catch (error) {
            if (currentFetchId === fetchIdRef.current) {
                console.error('Failed to fetch orders:', error);
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
        orders,
        isLoading,
        totalCount,
        paginationInfo,
        onDataChange,
        refresh,
    };
};
