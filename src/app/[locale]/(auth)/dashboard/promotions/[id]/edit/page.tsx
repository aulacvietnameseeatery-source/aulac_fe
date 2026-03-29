"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PromotionForm } from "@/features/staff/promotion-management/promotion-create-edit/components/promotion-form";
import { promotionService } from "@/features/staff/promotion-management/promotion-create-edit/services/promotion.service";
import { mapApiToForm } from "@/features/staff/promotion-management/promotion-create-edit/utils/promotion.utils";
import { PromotionFormValues } from "@/features/staff/promotion-management/promotion-create-edit/schemas/promotion.schema";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

export default function EditPromotionPage() {
  const t = useTranslations("Promotion");
  const params = useParams();
  const id = Number(params.id);
  const [initialData, setInitialData] = useState<PromotionFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    promotionService.getPromotionById(id)
      .then((data) => setInitialData(mapApiToForm(data)))
      .catch((err) => console.error("Error fetching promotion:", err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (apiPayload: any) => {
    await promotionService.updatePromotion(id, apiPayload);
  };

  return (
    <ProtectedRoute permission={Permissions.UpdatePromotion}>
      <div className="mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1A3A51]">{t("editTitle", { id })}</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : initialData ? (
          <PromotionForm initialData={initialData} isEditMode={true} onSubmitAction={handleSubmit} />
        ) : (
          <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border">
            {t("noData")}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}