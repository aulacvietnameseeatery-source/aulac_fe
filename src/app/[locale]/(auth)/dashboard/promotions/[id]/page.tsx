"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { promotionService } from "@/features/staff/promotion-management/promotion-create-edit/services/promotion.service";
import { PromotionDetailDto } from "@/features/staff/promotion-management/promotion-create-edit/types/promotion.types";
import { Loader2, ArrowLeft } from "lucide-react";

export default function PromotionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const t = useTranslations("Promotion.Detail");
  const tStatus = useTranslations("Promotion.Status");
  const tForm = useTranslations("Promotion.Form");
  const [detail, setDetail] = useState<PromotionDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    promotionService.getPromotionDetail(id)
      .then(setDetail)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!detail) return <div className="p-8 text-center text-red-500">Not Found</div>;

  // Format UTC to Local string for display
  const formatLocalDate = (utcStr: string) => {
    if (!utcStr) return "";
    const date = new Date(utcStr.endsWith('Z') ? utcStr : `${utcStr}Z`);
    return date.toLocaleString();
  };

  const statusStr = detail.promotionStatus || "SCHEDULED";
  
  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium">
        <ArrowLeft size={16} /> {t("back")}
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#1A3A51]">{t("title", { id })}</h1>
            <p className="text-slate-500 mt-1">{detail.promoName}</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-md text-sm">
            {tStatus(statusStr as any) || statusStr}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">
          
          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">{tForm("promoCode")}</p>
              <p className="font-semibold text-lg">{detail.promoCode}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">{tForm("discountValue")}</p>
              <p className="font-semibold text-lg text-green-600">
                {detail.discountValue} {detail.type === "PERCENT" ? "%" : "VNĐ"}
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
              <p className="font-medium text-slate-800">{formatLocalDate(detail.startTime)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">{tForm("end")}</p>
              <p className="font-medium text-slate-800">{formatLocalDate(detail.endTime)}</p>
            </div>
          </div>

          {/* Rules & Targets Readonly display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
             <div className="bg-slate-50 p-4 rounded-xl">
               <h3 className="font-bold text-slate-800 mb-2">{t("rulesInfo")}</h3>
               {detail.promotionRules?.length > 0 ? (
                 <ul className="text-sm text-slate-600 space-y-1">
                   <li>{tForm("minOrder")}: <b>{detail.promotionRules[0].minOrderValue || 0}</b></li>
                   <li>{tForm("minQty")}: <b>{detail.promotionRules[0].minQuantity || 0}</b></li>
                 </ul>
               ) : (
                 <p className="text-sm text-slate-400">{t("noRule")}</p>
               )}
             </div>

             <div className="bg-slate-50 p-4 rounded-xl">
               <h3 className="font-bold text-slate-800 mb-2">{t("targetsInfo")}</h3>
               {detail.promotionTargets?.length > 0 ? (
                  <p className="text-sm text-slate-600">{t("hasTarget")}</p>
               ) : (
                  <p className="text-sm text-slate-600 font-medium">{tForm("targetDescAll")}</p>
               )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}