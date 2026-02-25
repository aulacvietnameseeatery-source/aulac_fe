import { useState, useCallback, useRef } from 'react';
import { OrderStatusCount } from '../types/order-history.types';
import { orderHistoryService } from '../services/order-history.service';

const DEFAULT_COUNTS: OrderStatusCount = { all: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 };

/**
 * Fetches order status counts independently from the paginated list.
 * This ensures tab badge counts remain stable when user switches tabs or changes filters.
 */
export const useOrderStatusCounts = () => {
    const [counts, setCounts] = useState<OrderStatusCount>(DEFAULT_COUNTS);
    const [isLoading, setIsLoading] = useState(false);
    const fetchIdRef = useRef(0);

    const fetchCounts = useCallback(async () => {
        const currentId = ++fetchIdRef.current;
        setIsLoading(true);
        try {
            const data = await orderHistoryService.getOrderStatusCount();
            if (currentId === fetchIdRef.current) {
                setCounts(data);
            }
        } catch (error) {
            if (currentId === fetchIdRef.current) {
                console.error('Failed to fetch order status counts:', error);
            }
        } finally {
            if (currentId === fetchIdRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    return { counts, isLoading, fetchCounts };
};
