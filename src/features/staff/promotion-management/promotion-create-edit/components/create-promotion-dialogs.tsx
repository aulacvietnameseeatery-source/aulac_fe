"use client";

import React, { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog"; // Import Dialog component của bạn
import { PromotionForm } from "@/features/staff/promotion-management/promotion-create-edit/components/promotion-form";
import { promotionService } from "@/features/staff/promotion-management/promotion-create-edit/services/promotion.service";
import { mapApiToForm } from "@/features/staff/promotion-management/promotion-create-edit/utils/promotion.utils";
import { PromotionFormValues } from "@/features/staff/promotion-management/promotion-create-edit/schemas/promotion.schema";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

// --- CREATE DIALOG ---
interface CreateProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePromotionDialog({ open, onClose, onSuccess }: CreateProps) {
  const t = useTranslations("Promotion");

  const handleSubmit = async (apiPayload: any) => {
    await promotionService.createPromotion(apiPayload);
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("createTitle")} width="900px">
      <div className="p-4">
        <p className="text-slate-500 mb-6">{t("createSubTitle")}</p>
        <PromotionForm 
          onSubmitAction={handleSubmit} 
          onCancel={onClose} 
          onSuccess={onSuccess} 
        />
      </div>
    </Dialog>
  );
}