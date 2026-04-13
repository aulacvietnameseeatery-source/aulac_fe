"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { dateUtils } from "@/lib/date-utils";
import Image from "next/image";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Package,
  Image as ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ALCard } from "@/components/ui/al-card";
import { Dialog } from "@/components/ui/dialog";
import {
  useTransactionDetailQuery,
  useSubmitTransactionMutation,
  useApproveTransactionMutation,
} from "../../hooks/use-inventory-queries";
import { InventoryTxTypeCode, InventoryTxStatusCode } from "@/types/status-codes";
import type { TransactionItemDto } from "../../types/inventory.types";

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  [InventoryTxTypeCode.IN]: {
    icon: <ArrowDownCircle className="w-5 h-5" />,
    label: "Import",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  [InventoryTxTypeCode.OUT]: {
    icon: <ArrowUpCircle className="w-5 h-5" />,
    label: "Export",
    color: "text-red-600 bg-red-50 border-red-200",
  },
  [InventoryTxTypeCode.ADJUST]: {
    icon: <RefreshCw className="w-5 h-5" />,
    label: "Stock Check",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
};

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  [InventoryTxStatusCode.DRAFT]: { icon: <FileText className="w-4 h-4" />, color: "bg-slate-100 text-slate-700 border-slate-300" },
  [InventoryTxStatusCode.PENDING_APPROVAL]: { icon: <Clock className="w-4 h-4" />, color: "bg-amber-50 text-amber-700 border-amber-300" },
  [InventoryTxStatusCode.COMPLETED]: { icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-emerald-50 text-emerald-700 border-emerald-300" },
  [InventoryTxStatusCode.CANCELLED]: { icon: <XCircle className="w-4 h-4" />, color: "bg-red-50 text-red-700 border-red-300" },
};

interface TransactionDetailModalProps {
  transactionId: number | null;
  open: boolean;
  onClose: () => void;
}

export function TransactionDetailModal({ transactionId, open, onClose }: TransactionDetailModalProps) {
  const t = useTranslations("inventory.transactions.detail");
  const { data: tx, isLoading } = useTransactionDetailQuery(transactionId ?? 0);
  const submitMutation = useSubmitTransactionMutation();
  const approveMutation = useApproveTransactionMutation();

  const [rejectNote, setRejectNote] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!open || !transactionId) return null;

  const typeConfig = tx ? TYPE_CONFIG[tx.typeCode ?? ""] : null;
  const statusConfig = tx ? STATUS_CONFIG[tx.statusCode ?? ""] : null;
  const isDraft = tx?.statusCode === InventoryTxStatusCode.DRAFT;
  const isPending = tx?.statusCode === InventoryTxStatusCode.PENDING_APPROVAL;
  const isAdjust = tx?.typeCode === InventoryTxTypeCode.ADJUST;

  const handleSubmit = () => {
    if (!tx || !window.confirm(t("confirmSubmit"))) return;
    submitMutation.mutate({ id: tx.transactionId });
  };

  const handleApprove = () => {
    if (!tx || !window.confirm(t("confirmApprove"))) return;
    approveMutation.mutate({ id: tx.transactionId, body: { isApproved: true } });
  };

  const handleReject = () => {
    if (!tx || !rejectNote.trim()) return;
    approveMutation.mutate({ id: tx.transactionId, body: { isApproved: false, note: rejectNote } });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={tx?.transactionCode ?? t("title")}
      width="min(1120px, 96vw)"
      height="82vh"
      bodyOverflowY="hidden"
    >
      {isLoading || !tx ? (
        <div className="flex items-center justify-center py-16 text-[#1A3A52]/40">
          {t("loading")}
        </div>
      ) : (
        <div className="h-full flex flex-col gap-4 p-5 overflow-hidden">
          {/* Type & Status */}
          <div className="flex flex-wrap items-center gap-3">
            {typeConfig && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${typeConfig.color}`}>
                {typeConfig.icon}
                <span className="font-medium text-sm">{tx.typeName}</span>
              </div>
            )}
            {statusConfig && (
              <Badge variant="outline" className={`${statusConfig.color} gap-1.5`}>
                {statusConfig.icon}
                {tx.statusName}
              </Badge>
            )}
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <InfoField label={t("createdBy")} value={tx.createdByName} />
            <InfoField label={t("createdAt")} value={tx.createdAt ? dateUtils.formatLocal(tx.createdAt, "dd/MM/yyyy HH:mm") : null} />
            {tx.supplierName && <InfoField label={t("supplier")} value={tx.supplierName} />}
            {tx.exportReasonName && <InfoField label={t("exportReason")} value={tx.exportReasonName} />}
            {tx.stockCheckAreaNote && <InfoField label={t("stockCheckArea")} value={tx.stockCheckAreaNote} />}
            {tx.submittedAt && <InfoField label={t("submittedAt")} value={dateUtils.formatLocal(tx.submittedAt, "dd/MM/yyyy HH:mm")} />}
            {tx.approvedByName && (
              <>
                <InfoField label={t("approvedBy")} value={tx.approvedByName} />
                <InfoField label={t("approvedAt")} value={tx.approvedAt ? dateUtils.formatLocal(tx.approvedAt, "dd/MM/yyyy HH:mm") : null} />
              </>
            )}
          </div>

          {/* Notes */}
          {tx.note && (
            <div className="bg-[#FDFBF9] rounded-lg p-3 border border-[#D5BA98]/20">
              <span className="text-xs font-medium text-[#1A3A52]/50 block mb-1">{t("note")}</span>
              <p className="text-sm text-[#1A3A52]/80">{tx.note}</p>
            </div>
          )}

          {/* Items List */}
          <ALCard variant="default" padding="none" elevation="sm" radius="xl" className="flex flex-col min-h-0">
            <div className="px-4 py-3 border-b border-[#D5BA98]/20">
              <h2 className="text-sm font-semibold text-[#1A3A52]">
                {t("itemsList", { count: tx.items.length })}
              </h2>
            </div>
            <div className="h-70 overflow-y-auto divide-y divide-[#D5BA98]/10">
              {tx.items.map((item) => (
                <TransactionItemRow key={item.transactionItemId} item={item} isAdjust={isAdjust} />
              ))}
            </div>
            {!isAdjust && (() => {
              const total = tx.items.reduce((sum, it) => sum + (it.quantity ?? 0) * (it.unitPrice ?? 0), 0);
              return total > 0 ? (
                <div className="flex items-center justify-end px-4 py-2.5 border-t border-[#D5BA98]/30 bg-[#FDFBF9]/60">
                  <span className="text-xs text-[#1A3A52]/50 mr-2">{t("totalValue")}:</span>
                  <span className="text-base font-bold text-[#1A3A52] tabular-nums">
                    {total.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
              ) : null;
            })()}
          </ALCard>

          {/* Media Evidence */}
          {tx.media.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[#1A3A52] mb-2">{t("mediaEvidence")}</h2>
              <div className="grid grid-cols-4 gap-2">
                {tx.media.map((m) => (
                  <a
                    key={m.mediaId}
                    href={m.url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded-lg overflow-hidden border border-[#D5BA98]/30 hover:border-[#1A3A52]/30 transition-colors"
                  >
                    {m.url ? (
                      <Image src={m.url} width={120} height={120} className="w-full h-full object-cover" alt={t("evidenceAlt")} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#FDFBF9]">
                        <ImageIcon className="w-6 h-6 text-[#1A3A52]/20" />
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          {(isDraft || isPending) && (
            <div className="flex flex-col gap-3 pt-2 border-t border-[#D5BA98]/20">
              {isDraft && (
                <Button
                  onClick={handleSubmit}
                  isLoading={submitMutation.isPending}
                  className="bg-[#1A3A52] text-white hover:bg-[#1A3A52]/90 w-fit"
                >
                  {t("submitForApproval")}
                </Button>
              )}
              {isPending && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleApprove}
                      isLoading={approveMutation.isPending}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {t("approveTransaction")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectInput(!showRejectInput)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {t("rejectTransaction")}
                    </Button>
                  </div>
                  {showRejectInput && (
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-[#1A3A52]/60 mb-1 block">
                          {t("rejectionNote")}
                        </label>
                        <textarea
                          rows={2}
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value)}
                          className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                          placeholder={t("rejectionNote")}
                        />
                      </div>
                      <Button
                        onClick={handleReject}
                        disabled={!rejectNote.trim()}
                        isLoading={approveMutation.isPending}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        {t("confirmRejectBtn")}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <span className="text-xs text-[#1A3A52]/45 block">{label}</span>
      <span className="text-sm text-[#1A3A52]/80 font-medium">{value ?? "-"}</span>
    </div>
  );
}

function TransactionItemRow({ item, isAdjust }: { item: TransactionItemDto; isAdjust: boolean }) {
  const lineTotal = item.quantity != null && item.unitPrice != null
    ? item.quantity * item.unitPrice
    : null;

  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-[#FDFBF9] transition-colors">
      <div className="w-8 h-8 rounded-md bg-[#FDFBF9] border border-[#D5BA98]/30 shrink-0 overflow-hidden mt-0.5">
        {item.ingredientImageUrl ? (
          <Image src={item.ingredientImageUrl} width={32} height={32} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Package className="w-3.5 h-3.5 text-[#1A3A52]/25" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#1A3A52] truncate">{item.ingredientName}</span>
          {item.categoryName && (
            <Badge variant="outline" className="text-[10px] border-[#D5BA98]/40 text-[#1A3A52]/50">
              {item.categoryName}
            </Badge>
          )}
        </div>
        {item.note && (
          <p className="text-xs text-[#1A3A52]/45 mt-0.5 truncate">{item.note}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        {isAdjust ? (
          <div className="flex flex-col items-end text-sm">
            <span className="text-[#1A3A52]/50">{item.systemQuantity} → {item.actualQuantity}</span>
            <span className="text-xs font-medium text-blue-600">{item.unitName}</span>
            {item.varianceReasonName && (
              <span className="text-[10px] text-blue-500/70 mt-0.5">{item.varianceReasonName}</span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-[#1A3A52]">
              {item.quantity} {item.unitName}
            </span>
            {item.unitPrice != null && (
              <span className="text-xs text-[#1A3A52]/40">@ {item.unitPrice.toLocaleString("vi-VN")}</span>
            )}
            {lineTotal != null && (
              <span className="text-xs font-medium text-[#1A3A52]/70 mt-0.5">
                = {lineTotal.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
