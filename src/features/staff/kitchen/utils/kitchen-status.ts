import type { KitchenOrderItem } from '../types/kitchen.types';
import { OrderItemStatusCode } from '@/types/status-codes';

export type KitchenItemStatus = OrderItemStatusCode | 'UNKNOWN';
export type KitchenDisplayStatus = 'all' | 'new' | 'in-kitchen' | 'completed' | 'cancelled';

const KNOWN_ITEM_STATUSES = new Set<string>(Object.values(OrderItemStatusCode));

export const DONE_ITEM_STATUSES: ReadonlyArray<OrderItemStatusCode> = [
    OrderItemStatusCode.SERVED,
    OrderItemStatusCode.READY,
];

export const PROCESSED_ITEM_STATUSES: ReadonlyArray<OrderItemStatusCode> = [
    ...DONE_ITEM_STATUSES,
    OrderItemStatusCode.REJECTED,
    OrderItemStatusCode.CANCELLED,
];

export const ACTIVE_ITEM_STATUSES: ReadonlyArray<OrderItemStatusCode> = [
    OrderItemStatusCode.CREATED,
    OrderItemStatusCode.IN_PROGRESS,
];

export function normalizeKitchenItemStatus(status: string | null | undefined): KitchenItemStatus {
    if (!status) return 'UNKNOWN';

    const normalized = status
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '_');

    if (KNOWN_ITEM_STATUSES.has(normalized)) {
        return normalized as OrderItemStatusCode;
    }

    return 'UNKNOWN';
}

export function isDoneItemStatus(status: KitchenItemStatus): boolean {
    return DONE_ITEM_STATUSES.includes(status as OrderItemStatusCode);
}

export function isProcessedItemStatus(status: KitchenItemStatus): boolean {
    return PROCESSED_ITEM_STATUSES.includes(status as OrderItemStatusCode);
}

export function isActiveItemStatus(status: KitchenItemStatus): boolean {
    return ACTIVE_ITEM_STATUSES.includes(status as OrderItemStatusCode);
}

export function getOrderDisplayStatus(
    items: KitchenOrderItem[],
    orderStatus?: string,
): Exclude<KitchenDisplayStatus, 'all'> {
    // Defensive: honour order-level status first
    if (orderStatus === 'CANCELLED') return 'cancelled';

    if (items.length === 0) return 'new';

    const statuses = items.map((item) => normalizeKitchenItemStatus(item.itemStatus));

    // After reset, an order is PENDING but items may still be all CREATED
    if (orderStatus === 'PENDING' && statuses.every((s) => s === OrderItemStatusCode.CREATED)) return 'new';

    const hasProgress = (s: KitchenItemStatus) => [
        OrderItemStatusCode.IN_PROGRESS,
        OrderItemStatusCode.SERVED,
        OrderItemStatusCode.READY,
    ].includes(s as OrderItemStatusCode);

    const hasDone = (s: KitchenItemStatus) => DONE_ITEM_STATUSES.includes(s as OrderItemStatusCode);

    if (statuses.every((s) => isProcessedItemStatus(s))) {
        // Terminal: distinguish successful completion from fully cancelled/rejected
        return statuses.some(hasDone) ? 'completed' : 'cancelled';
    }

    // Has active items: if any are REJECTED alongside active → still in-kitchen
    if (statuses.some((s) => hasProgress(s)) || statuses.some((s) => s === OrderItemStatusCode.REJECTED)) return 'in-kitchen';

    return 'new';
}
