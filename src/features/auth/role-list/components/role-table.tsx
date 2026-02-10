import React from "react";
import { Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { RoleDto } from "../types/role.types";
import { useTranslations } from "next-intl";

type Props = {
  roles: RoleDto[];
  isLoading: boolean;
  startIndex: number; // To calculate the order number: (pageIndex - 1) * pageSize
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

export const RoleTable = ({ roles, isLoading, startIndex, onView, onEdit, onDelete }: Props) => {
  const t = useTranslations("Role.List");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-gray-900 border-b border-gray-100">
              <th className="p-5 text-sm font-bold w-20">{t("table.no")}</th>
              <th className="p-5 text-sm font-bold">{t("table.name")}</th>
              <th className="p-5 text-sm font-bold">{t("table.code")}</th>
              <th className="p-5 text-sm font-bold text-center">{t("table.staffCount")}</th>
              <th className="p-5 text-sm font-bold text-right">{t("table.action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <div className="flex justify-center items-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin" size={20} /> {t("loading")}
                  </div>
                </td>
              </tr>
            ) : roles.length > 0 ? (
              roles.map((role, index) => (
                <tr key={role.roleId} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-5 text-sm font-medium text-gray-900">
                    {startIndex + index + 1}
                  </td>
                  <td className="p-5 text-sm font-semibold text-gray-800">
                    {role.roleName}
                  </td>
                  <td className="p-5 text-sm">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                      {role.roleCode}
                    </span>
                  </td>
                  <td className="p-5 text-sm text-center font-medium text-gray-600">
                    {role.staffCount}
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <button
                        onClick={() => onView(role.roleId)}
                        className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title={t("actions.view")}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(role.roleId)}
                        className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title={t("actions.edit")}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(role.roleId)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title={t("actions.delete")}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">
                  {t("table.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};