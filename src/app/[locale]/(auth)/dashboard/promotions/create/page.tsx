"use client";

import { PromotionForm } from "@/features/staff/promotion-management/promotion-create-edit/components/promotion-form";
import { promotionService } from "@/features/staff/promotion-management/promotion-create-edit/services/promotion.service";
import { useTranslations } from "next-intl";

export default function CreatePromotionPage() {
  const t = useTranslations("Promotion");
  const handleSubmit = async (apiPayload: any) => {
    await promotionService.createPromotion(apiPayload);
  };

  return (
    <div className="mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A3A51]">{t("createTitle")}</h1>
        <p className="text-slate-500 mt-1">{t("createSubTitle")}</p>
      </div>
      <PromotionForm onSubmitAction={handleSubmit} />
    </div>
  );
}