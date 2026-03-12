import { useCallback, useEffect, useRef, useState } from 'react';
import { kitchenService } from '../services/kitchen.service';
import type { KitchenOrder, UpdateItemStatusRequest } from '../types/kitchen.types';

const POLL_INTERVAL_MS = 15_000; // 15 seconds

export function useKitchen() {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            const data = await kitchenService.getKitchenOrders();
            setOrders(data);
        } catch (err) {
            console.error('Failed to fetch kitchen orders', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch + polling
    useEffect(() => {
        fetchOrders();
        intervalRef.current = setInterval(fetchOrders, POLL_INTERVAL_MS);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchOrders]);

    const updateItemStatus = useCallback(
        async (orderItemId: number, request: UpdateItemStatusRequest) => {
            setIsUpdating(true);
            try {
                await kitchenService.updateItemStatus(orderItemId, request);
                await fetchOrders();
            } catch (err) {
                console.error('Failed to update item status', err);
                throw err;
            } finally {
                setIsUpdating(false);
            }
        },
        [fetchOrders],
    );

    const batchUpdateItemStatus = useCallback(
        async (updates: { orderItemId: number; status: string; rejectReason?: string }[]) => {
            setIsUpdating(true);
            try {
                // Execute all updates. Using Promise.all here.
                await Promise.all(
                    updates.map((u) => kitchenService.updateItemStatus(u.orderItemId, { status: u.status, rejectReason: u.rejectReason })),
                );
                await fetchOrders();
            } catch (err) {
                console.error('Failed to update multiple item statuses', err);
                throw err;
            } finally {
                setIsUpdating(false);
            }
        },
        [fetchOrders],
    );

    const refresh = useCallback(async () => {
        setIsLoading(true);
        await fetchOrders();
    }, [fetchOrders]);

    return { orders, isLoading, isUpdating, updateItemStatus, batchUpdateItemStatus, refresh };
}
