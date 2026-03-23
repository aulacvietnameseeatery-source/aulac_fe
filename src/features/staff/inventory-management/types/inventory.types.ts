// ──────────────────────────────────────────────────────────
// FE mirrors of BE DTOs in Core/DTO/Inventory/
// Property names: camelCase (auto-serialized from C# PascalCase)
// ──────────────────────────────────────────────────────────

// ─── Item DTO ────────────────────────────────────────────

export interface InventoryItemDto {
  ingredientId: number;
  ingredientName: string;
  unitLvId: number;
  unitName: string | null;
  typeLvId: number | null;
  typeName: string | null;
  categoryLvId: number | null;
  categoryCode: string | null;
  categoryName: string | null;
  imageId: number | null;
  imageUrl: string | null;
  quantityOnHand: number;
  minStockLevel: number;
  lastUpdatedAt: string | null;
  isLowStock: boolean;
}

// ─── Transaction List DTO ────────────────────────────────

export interface InventoryTransactionListDto {
  transactionId: number;
  transactionCode: string | null;
  typeLvId: number;
  typeCode: string | null;
  typeName: string | null;
  statusLvId: number;
  statusCode: string | null;
  statusName: string | null;
  exportReasonLvId: number | null;
  exportReasonName: string | null;
  supplierId: number | null;
  supplierName: string | null;
  createdBy: number | null;
  createdByName: string | null;
  createdAt: string | null;
  submittedAt: string | null;
  approvedBy: number | null;
  approvedByName: string | null;
  approvedAt: string | null;
  note: string | null;
  itemCount: number;
  totalValue: number | null;
}

// ─── Transaction Detail DTO ──────────────────────────────

export interface InventoryTransactionDetailDto {
  transactionId: number;
  transactionCode: string | null;
  typeLvId: number;
  typeCode: string | null;
  typeName: string | null;
  statusLvId: number;
  statusCode: string | null;
  statusName: string | null;
  exportReasonLvId: number | null;
  exportReasonCode: string | null;
  exportReasonName: string | null;
  supplierId: number | null;
  supplierName: string | null;
  createdBy: number | null;
  createdByName: string | null;
  createdAt: string | null;
  submittedAt: string | null;
  approvedBy: number | null;
  approvedByName: string | null;
  approvedAt: string | null;
  note: string | null;
  stockCheckAreaNote: string | null;
  items: TransactionItemDto[];
  media: TransactionMediaDto[];
}

// ─── Transaction Item DTO ────────────────────────────────

export interface TransactionItemDto {
  transactionItemId: number;
  ingredientId: number;
  ingredientName: string | null;
  ingredientImageUrl: string | null;
  categoryLvId: number | null;
  categoryCode: string | null;
  categoryName: string | null;
  quantity: number;
  unitLvId: number;
  unitName: string | null;
  unitPrice: number | null;
  systemQuantity: number | null;
  actualQuantity: number | null;
  varianceReasonLvId: number | null;
  varianceReasonName: string | null;
  note: string | null;
}

// ─── Transaction Media DTO ───────────────────────────────

export interface TransactionMediaDto {
  mediaId: number;
  url: string | null;
  mediaType: string | null;
}

// ─── Stock Card DTO ──────────────────────────────────────

export interface StockCardDto {
  transactionItemId: number;
  transactionId: number;
  transactionCode: string | null;
  typeCode: string | null;
  typeName: string | null;
  statusCode: string | null;
  quantityChanged: number;
  unitName: string | null;
  unitPrice: number | null;
  exportReasonName: string | null;
  note: string | null;
  createdByName: string | null;
  createdAt: string | null;
}

// ─── Dashboard DTO ───────────────────────────────────────

export interface InventoryDashboardDto {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingTransactions: number;
  lowStockList: LowStockItemDto[];
  recentTransactions: RecentTransactionDto[];
}

export interface LowStockItemDto {
  ingredientId: number;
  ingredientName: string | null;
  categoryName: string | null;
  quantityOnHand: number;
  minStockLevel: number;
  unitName: string | null;
}

export interface RecentTransactionDto {
  transactionId: number;
  transactionCode: string | null;
  typeName: string | null;
  statusName: string | null;
  createdByName: string | null;
  createdAt: string | null;
  itemCount: number;
}

// ─── Request DTOs ────────────────────────────────────────

export interface TransactionItemRequest {
  ingredientId: number;
  quantity: number;
  unitLvId: number;
  unitPrice?: number | null;
  note?: string | null;
}

export interface CreateInventoryTransactionRequest {
  typeLvId: number;
  exportReasonLvId?: number | null;
  supplierId?: number | null;
  stockCheckAreaNote?: string | null;
  note?: string | null;
  items: TransactionItemRequest[];
}

export interface SubmitTransactionRequest {
  mediaIds?: number[] | null;
}

export interface ApproveTransactionRequest {
  isApproved: boolean;
  note?: string | null;
}

// ─── Filter Request DTOs ─────────────────────────────────

export interface GetInventoryItemsFilter {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  categoryLvId?: number;
  typeLvId?: number;
  isLowStock?: boolean;
}

export interface GetTransactionsFilter {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  typeLvId?: number;
  statusLvId?: number;
  exportReasonLvId?: number;
  supplierId?: number;
  fromDate?: string;
  toDate?: string;
}
