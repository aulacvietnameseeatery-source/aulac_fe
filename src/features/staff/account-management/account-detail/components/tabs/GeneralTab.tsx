"use client";

import React from "react";
import { User, Mail, Phone, AtSign } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AccountDetail } from "../../types/account-detail.types";

interface GeneralTabProps {
  account: AccountDetail;
}

export const GeneralTab = ({ account }: GeneralTabProps) => {
  const t = useTranslations("Account.Detail.general");
  
  const fields = [
    { icon: User, labelKey: "fullName", value: account.fullName },
    { icon: AtSign, labelKey: "username", value: account.username },
    { icon: Mail, labelKey: "email", value: account.email || "N/A" },
    { icon: Phone, labelKey: "phone", value: account.phone || "N/A" },
  ];

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {t("title")}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div
            key={field.labelKey}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
          >
            <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <field.icon size={16} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {t(field.labelKey)}
              </p>
              <p className="text-sm font-medium text-gray-800 mt-0.5 break-all">
                {field.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
