import { useCallback, useEffect, useRef, useState } from 'react';
import { kitchenService } from '../services/kitchen.service';
import type { KitchenOrder, UpdateItemStatusRequest } from '../types/kitchen.types';
import { normalizeKitchenItemStatus } from '../utils/kitchen-status';
import { OrderItemStatusCode } from '@/types/status-codes';

const POLL_INTERVAL_MS = 5_000; // 5 seconds for near real-time KDS experience

export function useKitchen() {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingItemIds, setUpdatingItemIds] = useState<Set<number>>(new Set());
    const [isBatchUpdating, setIsBatchUpdating] = useState(false);
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

    const applyOptimisticUpdate = useCallback((orderItemId: number, request: UpdateItemStatusRequest) => {
        const normalizedStatus = normalizeKitchenItemStatus(request.status);

        setOrders((prev) =>
            prev.map((order) => ({
                ...order,
                items: order.items.map((item) => {
                    if (item.orderItemId !== orderItemId) return item;

                    return {
                        ...item,
                        itemStatus: normalizedStatus === 'UNKNOWN' ? item.itemStatus : normalizedStatus,
                        rejectReason:
                            normalizedStatus === OrderItemStatusCode.REJECTED
                                ? request.rejectReason ?? item.rejectReason
                                : item.rejectReason,
                    };
                }),
            })),
        );
    }, []);

    const setItemsUpdating = useCallback((itemIds: number[], isUpdating: boolean) => {
        setUpdatingItemIds((prev) => {
            const next = new Set(prev);
            itemIds.forEach((id) => {
                if (isUpdating) next.add(id);
                else next.delete(id);
            });
            return next;
        });
    }, []);

    // Initial fetch + polling
    useEffect(() => {
        fetchOrders();

        const poll = () => {
            if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                fetchOrders();
            }
        };

        intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchOrders();
            }
        };

        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [fetchOrders]);

    const updateItemStatus = useCallback(
        async (orderItemId: number, request: UpdateItemStatusRequest) => {
            setItemsUpdating([orderItemId], true);
            applyOptimisticUpdate(orderItemId, request);

            try {
                await kitchenService.updateItemStatus(orderItemId, request);
                await fetchOrders();
            } catch (err) {
                console.error('Failed to update item status', err);
                await fetchOrders();
                throw err;
            } finally {
                setItemsUpdating([orderItemId], false);
            }
        },
        [applyOptimisticUpdate, fetchOrders, setItemsUpdating],
    );

    const batchUpdateItemStatus = useCallback(
        async (updates: { orderItemId: number; status: UpdateItemStatusRequest['status']; rejectReason?: string }[]) => {
            const itemIds = updates.map((u) => u.orderItemId);
            setItemsUpdating(itemIds, true);
            setIsBatchUpdating(true);

            updates.forEach((u) => {
                applyOptimisticUpdate(u.orderItemId, { status: u.status, rejectReason: u.rejectReason });
            });

            try {
                await Promise.all(
                    updates.map((u) => kitchenService.updateItemStatus(u.orderItemId, { status: u.status, rejectReason: u.rejectReason })),
                );
                await fetchOrders();
            } catch (err) {
                console.error('Failed to update multiple item statuses', err);
                await fetchOrders();
                throw err;
            } finally {
                setItemsUpdating(itemIds, false);
                setIsBatchUpdating(false);
            }
        },
        [applyOptimisticUpdate, fetchOrders, setItemsUpdating],
    );

    const refresh = useCallback(async () => {
        await fetchOrders();
    }, [fetchOrders]);

    const isUpdating = updatingItemIds.size > 0 || isBatchUpdating;
    const isItemUpdating = useCallback((orderItemId: number) => updatingItemIds.has(orderItemId), [updatingItemIds]);

    return { orders, isLoading, isUpdating, isItemUpdating, updateItemStatus, batchUpdateItemStatus, refresh };
}
