"use client";

import React, { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog"; // Import Dialog component của bạn
import { PromotionForm } from "@/features/staff/promotion-management/promotion-create-edit/components/promotion-form";
import { promotionService } from "@/features/staff/promotion-management/promotion-create-edit/services/promotion.service";
import { mapApiToForm } from "@/features/staff/promotion-management/promotion-create-edit/utils/promotion.utils";
import { PromotionFormValues } from "@/features/staff/promotion-management/promotion-create-edit/schemas/promotion.schema";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

// --- EDIT DIALOG ---
interface EditProps {
  id: number | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPromotionDialog({ id, open, onClose, onSuccess }: EditProps) {
  const t = useTranslations("Promotion");
  const [initialData, setInitialData] = useState<PromotionFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || !open) return;
    
    setIsLoading(true);
    promotionService.getPromotionById(id)
      .then((data) => setInitialData(mapApiToForm(data)))
      .catch((err) => console.error("Error fetching promotion:", err))
      .finally(() => setIsLoading(false));
  }, [id, open]);

  const handleSubmit = async (apiPayload: any) => {
    if (id) await promotionService.updatePromotion(id, apiPayload);
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("editTitle", { id: id ?? "" })} width="900px">
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : initialData ? (
          <PromotionForm 
            initialData={initialData} 
            isEditMode={true} 
            onSubmitAction={handleSubmit} 
            onCancel={onClose} 
            onSuccess={onSuccess} 
          />
        ) : (
          <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-2xl border">
            {t("noData")}
          </div>
        )}
      </div>
    </Dialog>
  );
}