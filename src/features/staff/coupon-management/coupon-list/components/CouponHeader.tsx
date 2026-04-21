"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ALTitleCard } from "@/components/ui/al-title-card";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";

interface CouponHeaderProps {
  onCreateClick: () => void;
}

export const CouponHeader = ({
  onCreateClick,
}: CouponHeaderProps) => {
  const t = useTranslations("Coupon.List");

  return (
    <ALTitleCard
      title={t("title")}
      description={t("description")}
      actions={
        <PermissionGuard permission={Permissions.CreateCoupon}>
          <Button
            onClick={onCreateClick}
            className="w-full gap-2 sm:w-auto bg-[#1A3A52] text-[#FDFBF9] hover:bg-[#1A3A52]/90"
          >
            <Plus className="h-4 w-4" />
            {t("addNew")}
          </Button>
        </PermissionGuard>
      }
    />
  );
};
