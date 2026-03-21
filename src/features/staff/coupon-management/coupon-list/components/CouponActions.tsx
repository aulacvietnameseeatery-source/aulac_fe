"use client";

import React from "react";
import { CouponDTO } from "../types/coupon.types";
import { TableActionColumn, TableAction } from "@/components/ui/table/table-action-column";
import { Permissions } from "@/types/const";

interface CouponActionsProps {
  coupon: CouponDTO;
  onView: (coupon: CouponDTO) => void;
  onEdit: (coupon: CouponDTO) => void;
  onDelete: (coupon: CouponDTO) => void;
}

export const CouponActions = ({ 
  coupon, 
  onView,
  onEdit,
  onDelete, 
}: CouponActionsProps) => {
  const actions: TableAction<CouponDTO>[] = [
    { action: "view", onClick: onView },
    { action: "edit", onClick: onEdit, permission: Permissions.EditCoupon },
    { action: "delete", onClick: onDelete, permission: Permissions.DeleteCoupon }
  ];
  return <TableActionColumn actions={actions} item={coupon} />;
};
