"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing"
import { format } from "date-fns";
import {
  ArrowLeft,
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

interface Props {
  transactionId: number;
}

export function TransactionDetail({ transactionId }: Props) {
  const t = useTranslations("inventory.transactions.detail");
  const router = useRouter();

  const { data: tx, isLoading } = useTransactionDetailQuery(transactionId);
  const submitMutation = useSubmitTransactionMutation();
  const approveMutation = useApproveTransactionMutation();

  const [rejectNote, setRejectNote] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (isLoading || !tx) {
    return (
      <div className="flex items-center justify-center py-24 text-[#1A3A52]/40">
        Loading...
      </div>
    );
  }

  const typeConfig = TYPE_CONFIG[tx.typeCode ?? ""];
  const statusConfig = STATUS_CONFIG[tx.statusCode ?? ""];
  const isDraft = tx.statusCode === InventoryTxStatusCode.DRAFT;
  const isPending = tx.statusCode === InventoryTxStatusCode.PENDING_APPROVAL;
  const isAdjust = tx.typeCode === InventoryTxTypeCode.ADJUST;

  const handleSubmit = () => {
    if (!window.confirm(t("confirmSubmit"))) return;
    submitMutation.mutate({ id: tx.transactionId });
  };

  const handleApprove = () => {
    if (!window.confirm(t("confirmApprove"))) return;
    approveMutation.mutate({
      id: tx.transactionId,
      body: { isApproved: true },
    });
  };

  const handleReject = () => {
    if (!rejectNote.trim()) return;
    approveMutation.mutate({
      id: tx.transactionId,
      body: { isApproved: false, note: rejectNote },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-[#D5BA98]/10">
          <ArrowLeft className="w-5 h-5 text-[#1A3A52]/70" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-[#1A3A52] font-['Cormorant_Garamond']">
            {tx.transactionCode}
          </h1>
          <p className="text-sm text-[#1A3A52]/50">{t("title")}</p>
        </div>
      </div>

      {/* Info Card */}
      <ALCard variant="default" padding="md" elevation="sm" radius="xl">
        <div className="flex flex-col gap-4">
          {/* Type & Status Row */}
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
            <InfoField label="Created By" value={tx.createdByName} />
            <InfoField
              label="Created At"
              value={tx.createdAt ? format(new Date(tx.createdAt), "dd/MM/yyyy HH:mm") : null}
            />
            {tx.supplierName && <InfoField label="Supplier" value={tx.supplierName} />}
            {tx.exportReasonName && <InfoField label="Export Reason" value={tx.exportReasonName} />}
            {tx.submittedAt && (
              <InfoField
                label="Submitted At"
                value={format(new Date(tx.submittedAt), "dd/MM/yyyy HH:mm")}
              />
            )}
            {tx.approvedByName && (
              <>
                <InfoField label="Approved By" value={tx.approvedByName} />
                <InfoField
                  label="Approved At"
                  value={tx.approvedAt ? format(new Date(tx.approvedAt), "dd/MM/yyyy HH:mm") : null}
                />
              </>
            )}
          </div>

          {/* Notes */}
          {tx.note && (
            <div className="bg-[#FDFBF9] rounded-lg p-3 border border-[#D5BA98]/20">
              <span className="text-xs font-medium text-[#1A3A52]/50 block mb-1">Note</span>
              <p className="text-sm text-[#1A3A52]/80">{tx.note}</p>
            </div>
          )}
          {tx.stockCheckAreaNote && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <span className="text-xs font-medium text-blue-600 block mb-1">{t("stockCheckArea")}</span>
              <p className="text-sm text-blue-800">{tx.stockCheckAreaNote}</p>
            </div>
          )}
        </div>
      </ALCard>

      {/* Items Card */}
      <ALCard variant="default" padding="none" elevation="sm" radius="xl">
        <div className="px-5 py-4 border-b border-[#D5BA98]/20">
          <h2 className="text-base font-semibold text-[#1A3A52]">
            Items ({tx.items.length})
          </h2>
        </div>
        <div className="divide-y divide-[#D5BA98]/10">
          {tx.items.map((item) => (
            <TransactionItemRow key={item.transactionItemId} item={item} isAdjust={isAdjust} />
          ))}
        </div>
      </ALCard>

      {/* Media Card */}
      {tx.media.length > 0 && (
        <ALCard variant="default" padding="md" elevation="sm" radius="xl">
          <h2 className="text-base font-semibold text-[#1A3A52] mb-3">{t("mediaEvidence")}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {tx.media.map((m) => (
              <a
                key={m.mediaId}
                href={m.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-lg overflow-hidden border border-[#D5BA98]/30 hover:border-[#1A3A52]/30 transition-colors"
              >
                {m.url ? (
                  <img src={m.url} className="w-full h-full object-cover" alt="Evidence" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#FDFBF9]">
                    <ImageIcon className="w-6 h-6 text-[#1A3A52]/20" />
                  </div>
                )}
              </a>
            ))}
          </div>
        </ALCard>
      )}

      {/* Action Bar */}
      {(isDraft || isPending) && (
        <ALCard variant="soft" padding="md" elevation="sm" radius="xl">
          <div className="flex flex-col gap-3">
            {isDraft && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSubmit}
                  isLoading={submitMutation.isPending}
                  className="bg-[#1A3A52] text-white hover:bg-[#1A3A52]/90"
                >
                  {t("submitForApproval")}
                </Button>
              </div>
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
                  <div className="flex items-end gap-3 pt-2">
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
                      Confirm Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ALCard>
      )}
    </div>
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
  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-[#FDFBF9] transition-colors">
      <div className="w-8 h-8 rounded-md bg-[#FDFBF9] border border-[#D5BA98]/30 flex-shrink-0 overflow-hidden">
        {item.ingredientImageUrl ? (
          <img src={item.ingredientImageUrl} className="w-full h-full object-cover" alt="" />
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
        {item.note && <p className="text-xs text-[#1A3A52]/40 truncate mt-0.5">{item.note}</p>}
      </div>
      <div className="text-right shrink-0">
        {isAdjust ? (
          <div className="flex flex-col items-end text-sm">
            <span className="text-[#1A3A52]/50">{item.systemQuantity} → {item.actualQuantity}</span>
            <span className="text-xs font-medium text-blue-600">{item.unitName}</span>
            {item.varianceReasonName && (
              <span className="text-[10px] text-[#1A3A52]/40">{item.varianceReasonName}</span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-[#1A3A52]">
              {item.quantity} {item.unitName}
            </span>
            {item.unitPrice != null && (
              <span className="text-xs text-[#1A3A52]/40">@ {item.unitPrice.toLocaleString()}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
