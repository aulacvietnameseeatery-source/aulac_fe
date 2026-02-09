import { useTranslations } from "next-intl";
import React from "react";

export const RoleHeader = () => {
  const t = useTranslations("Role.List");
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
        {t("title")}
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        {t("description")}
      </p>
    </div>
  );
};