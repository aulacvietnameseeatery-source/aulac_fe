import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  pageIndex: number;
  totalPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export const RolePagination = ({
  pageIndex,
  totalPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: Props) => {
  const t = useTranslations("Role.List");
  
  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      {/* Page Size Selector */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>{t("pagination.pageSize")}</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 1}
          className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronLeft size={16} /> {t("pagination.previous")}
        </button>

        <div className="flex items-center gap-1">
          <span className="px-3 py-1.5 bg-slate-900 text-white text-sm font-bold rounded">
            {pageIndex}
          </span>
          <span className="text-gray-400 text-sm">/ {totalPage}</span>
        </div>

        <button
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex === totalPage || totalPage === 0}
          className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {t("pagination.next")} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};