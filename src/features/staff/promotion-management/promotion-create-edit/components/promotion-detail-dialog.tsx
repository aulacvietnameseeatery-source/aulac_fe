"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { promotionService } from "@/features/staff/promotion-management/promotion-create-edit/services/promotion.service";
import { PromotionDetailDto } from "@/features/staff/promotion-management/promotion-create-edit/types/promotion.types";
import { Loader2 } from "lucide-react";
import { dateUtils } from "@/lib/date-utils";
import { Dialog } from "@/components/ui/dialog"; 

interface DetailProps {
  id: number | null;
  open: boolean;
  onClose: () => void;
}

export function PromotionDetailDialog({ id, open, onClose }: DetailProps) {
  const t = useTranslations("Promotion.Detail");
  const tStatus = useTranslations("Promotion.Status");
  const tForm = useTranslations("Promotion.Form");
  
  const [detail, setDetail] = useState<PromotionDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id || !open) return;
    
    setIsLoading(true);
    promotionService.getPromotionDetail(id)
      .then(setDetail)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id, open]);

  useEffect(() => {
    if (!open) {
        const timer = setTimeout(() => setDetail(null), 300);
        return () => clearTimeout(timer);
    }
  }, [open]);

  const getUtcDateString = (utcDateString?: string) => {
    if (!utcDateString) return "";
    return utcDateString.endsWith('Z') ? utcDateString : `${utcDateString}Z`;
  };

  const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('fr-CH', { 
            style: 'currency', 
            currency: 'CHF',
            minimumFractionDigits: 2
        }).format(val);
    };

  return (
    <Dialog 
        open={open} 
        onClose={onClose} 
        title={t("title", { id: id ?? "" })} 
        width="800px"
    >
      <div className="p-4 md:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : !detail ? (
          <div className="text-center py-10 text-red-500">
             {t("notFound") || "Not Found"}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex justify-between items-start pb-4 border-b border-[#D5BA98]/60">
              <div>
                <p className="text-lg font-bold text-[#1A3A51]">{detail.promoName}</p>
                <p className="text-sm text-slate-500">{detail.description}</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-md text-sm whitespace-nowrap">
                {tStatus((detail.promotionStatus || "SCHEDULED") as any) || detail.promotionStatus}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">{tForm("promoCode")}</p>
                <p className="font-semibold text-lg">{detail.promoCode}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">{tForm("discountValue")}</p>
                <p className="font-semibold text-lg text-green-600">
                  {detail.discountValue} {detail.type === "PERCENT" ? "%" : "CHF"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">{tForm("maxUsage")}</p>
                <p className="font-semibold text-lg">{detail.maxUsage || tForm("unlimited")}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">{t("usedCount", { count: detail.usedCount || 0 })}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">{tForm("start")}</p>
                <p className="font-medium text-slate-800">
                    {dateUtils.formatLocal(getUtcDateString(detail.startTime), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">{tForm("end")}</p>
                <p className="font-medium text-slate-800">
                    {dateUtils.formatLocal(getUtcDateString(detail.endTime), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
            </div>

            {/* Rules & Targets Readonly display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-2">{t("rulesInfo")}</h3>
                {detail.promotionRules?.length > 0 ? (
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>{tForm("minOrder")}: <b>{formatCurrency(detail.promotionRules[0].minOrderValue || 0)}</b></li>
                    <li>{tForm("minQty")}: <b>{detail.promotionRules[0].minQuantity || 0}</b></li>
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400">{t("noRule")}</p>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-2">{t("targetsInfo")}</h3>
                {detail.promotionTargets?.length > 0 ? (
                  <p className="text-sm text-slate-600">{t("hasTarget")}</p>
                ) : (
                  <p className="text-sm text-slate-600 font-medium">{tForm("targetDescAll")}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}