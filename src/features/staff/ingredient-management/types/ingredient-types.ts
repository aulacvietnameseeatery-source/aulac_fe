export interface SupplierBasicDto {
    supplierId: number;
    supplierName: string;
    phone?: string;
    email?: string;
}

export interface IngredientDto {
    ingredientId: number;
    ingredientName: string;

    unitLvId: number;
    unitName?: string;

    typeLvId?: number;
    typeName?: string;
    imageId?: number;
    imageUrl?: string;

    // Kho
    quantityOnHand: number;
    minStockLevel: number;
    lastUpdatedAt?: string;

    suppliers: SupplierBasicDto[];
}

export interface IngredientFilterParams {
    pageIndex: number;
    pageSize: number;
    search?: string;
    typeLvId?: number;
    isLowStock?: boolean;
}

export interface SaveIngredientRequest {
    ingredientName: string;

    unitLvId: number;

    typeLvId?: number;
    imageId?: number | null;
    minStockLevel: number;
    supplierIds: number[];
}

export interface AdjustStockRequest {
    quantity: number;
    note: string;
}

export interface StockHistoryDto {
    transactionItemId: number;
    quantityChanged: number;
    note: string;
    createdAt: string;
}