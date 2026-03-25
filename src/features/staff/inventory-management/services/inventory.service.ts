import { api } from "@/lib/http";
import type { ApiResponse, PagedResult } from "@/types/api-response.types";
import type {
  InventoryItemDto,
  InventoryTransactionListDto,
  InventoryTransactionDetailDto,
  StockCardDto,
  InventoryDashboardDto,
  CreateInventoryTransactionRequest,
  SubmitTransactionRequest,
  ApproveTransactionRequest,
  GetInventoryItemsFilter,
  GetTransactionsFilter,
} from "../types/inventory.types";

const EMPTY_PAGED = { pageData: [], pageIndex: 1, pageSize: 20, totalCount: 0, totalPage: 0 };

function toQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  return qs.toString();
}

export const inventoryService = {
  // ── Items ──────────────────────────────────────────────

  async getItems(filter: GetInventoryItemsFilter = {}): Promise<PagedResult<InventoryItemDto>> {
    const q = toQuery(filter as unknown as Record<string, unknown>);
    const res = await api.get<ApiResponse<PagedResult<InventoryItemDto>>>(`/api/inventory/items?${q}`);
    return res.data ?? EMPTY_PAGED;
  },

  // ── Transactions ───────────────────────────────────────

  async getTransactions(filter: GetTransactionsFilter = {}): Promise<PagedResult<InventoryTransactionListDto>> {
    const q = toQuery(filter as unknown as Record<string, unknown>);
    const res = await api.get<ApiResponse<PagedResult<InventoryTransactionListDto>>>(`/api/inventory/transactions?${q}`);
    return res.data ?? EMPTY_PAGED;
  },

  async getTransactionDetail(id: number): Promise<InventoryTransactionDetailDto> {
    const res = await api.get<ApiResponse<InventoryTransactionDetailDto>>(`/api/inventory/transactions/${id}`);
    return res.data;
  },

  async createTransaction(body: CreateInventoryTransactionRequest): Promise<InventoryTransactionDetailDto> {
    const res = await api.post<ApiResponse<InventoryTransactionDetailDto>>("/api/inventory/transactions", body);
    return res.data;
  },

  async submitTransaction(id: number, body?: SubmitTransactionRequest): Promise<InventoryTransactionDetailDto> {
    const res = await api.post<ApiResponse<InventoryTransactionDetailDto>>(
      `/api/inventory/transactions/${id}/submit`,
      body ?? {},
    );
    return res.data;
  },

  async approveTransaction(id: number, body: ApproveTransactionRequest): Promise<InventoryTransactionDetailDto> {
    const res = await api.post<ApiResponse<InventoryTransactionDetailDto>>(
      `/api/inventory/transactions/${id}/approve`,
      body,
    );
    return res.data;
  },

  // ── Stock Card ─────────────────────────────────────────

  async getStockCard(ingredientId: number, pageIndex = 1, pageSize = 20): Promise<PagedResult<StockCardDto>> {
    const q = toQuery({ pageIndex, pageSize });
    const res = await api.get<ApiResponse<PagedResult<StockCardDto>>>(`/api/inventory/items/${ingredientId}/stock-card?${q}`);
    return res.data ?? EMPTY_PAGED;
  },

  // ── Dashboard ──────────────────────────────────────────

  async getDashboard(): Promise<InventoryDashboardDto> {
    const res = await api.get<ApiResponse<InventoryDashboardDto>>("/api/inventory/dashboard");
    return res.data;
  },
};
