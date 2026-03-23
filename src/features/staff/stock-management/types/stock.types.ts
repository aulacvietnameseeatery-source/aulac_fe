export interface AuditItemState {
    actualQty: string;
    reason: string;
}

export interface AdjustStockPayload {
    quantity: number;
    note: string;
}