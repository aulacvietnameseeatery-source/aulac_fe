import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { inventoryService } from "../services/inventory.service";
import type {
  GetInventoryItemsFilter,
  GetTransactionsFilter,
  CreateInventoryTransactionRequest,
  SubmitTransactionRequest,
  ApproveTransactionRequest,
} from "../types/inventory.types";

// ─── Query Keys ──────────────────────────────────────────

export const INVENTORY_KEYS = {
  all: ["inventory"] as const,
  items: () => [...INVENTORY_KEYS.all, "items"] as const,
  itemList: (p: GetInventoryItemsFilter) => [...INVENTORY_KEYS.items(), p] as const,
  stockCard: (id: number, p?: object) => [...INVENTORY_KEYS.all, "stock-card", id, p] as const,
  transactions: () => [...INVENTORY_KEYS.all, "transactions"] as const,
  transactionList: (p: GetTransactionsFilter) => [...INVENTORY_KEYS.transactions(), p] as const,
  transactionDetail: (id: number) => [...INVENTORY_KEYS.all, "transaction", id] as const,
  dashboard: () => [...INVENTORY_KEYS.all, "dashboard"] as const,
};

// ─── Item Queries ────────────────────────────────────────

export function useInventoryItemsQuery(filter: GetInventoryItemsFilter = {}) {
  return useQuery({
    queryKey: INVENTORY_KEYS.itemList(filter),
    queryFn: () => inventoryService.getItems(filter),
  });
}

export function useStockCardQuery(ingredientId: number, pageIndex = 1, pageSize = 20) {
  return useQuery({
    queryKey: INVENTORY_KEYS.stockCard(ingredientId, { pageIndex, pageSize }),
    queryFn: () => inventoryService.getStockCard(ingredientId, pageIndex, pageSize),
    enabled: ingredientId > 0,
  });
}

// ─── Transaction Queries ─────────────────────────────────

export function useTransactionsQuery(filter: GetTransactionsFilter = {}) {
  return useQuery({
    queryKey: INVENTORY_KEYS.transactionList(filter),
    queryFn: () => inventoryService.getTransactions(filter),
  });
}

export function useTransactionDetailQuery(id: number) {
  return useQuery({
    queryKey: INVENTORY_KEYS.transactionDetail(id),
    queryFn: () => inventoryService.getTransactionDetail(id),
    enabled: id > 0,
  });
}

// ─── Dashboard ───────────────────────────────────────────

export function useDashboardQuery() {
  return useQuery({
    queryKey: INVENTORY_KEYS.dashboard(),
    queryFn: () => inventoryService.getDashboard(),
  });
}

// ─── Mutations ───────────────────────────────────────────

export function useCreateTransactionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInventoryTransactionRequest) => inventoryService.createTransaction(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVENTORY_KEYS.transactions() });
      qc.invalidateQueries({ queryKey: INVENTORY_KEYS.dashboard() });
      toast.success("Transaction created");
    },
    onError: () => toast.error("Failed to create transaction"),
  });
}

export function useSubmitTransactionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body?: SubmitTransactionRequest }) =>
      inventoryService.submitTransaction(id, body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: INVENTORY_KEYS.transactions() });
      qc.invalidateQueries({ queryKey: INVENTORY_KEYS.transactionDetail(vars.id) });
      qc.invalidateQueries({ queryKey: INVENTORY_KEYS.dashboard() });
      toast.success("Transaction submitted for approval");
    },
    onError: () => toast.error("Failed to submit transaction"),
  });
}

export function useApproveTransactionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ApproveTransactionRequest }) =>
      inventoryService.approveTransaction(id, body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: INVENTORY_KEYS.transactions() });
      qc.invalidateQueries({ queryKey: INVENTORY_KEYS.transactionDetail(vars.id) });
      qc.invalidateQueries({ queryKey: INVENTORY_KEYS.items() });
      qc.invalidateQueries({ queryKey: INVENTORY_KEYS.dashboard() });
      toast.success(vars.body.isApproved ? "Transaction approved" : "Transaction rejected");
    },
    onError: () => toast.error("Failed to process approval"),
  });
}
