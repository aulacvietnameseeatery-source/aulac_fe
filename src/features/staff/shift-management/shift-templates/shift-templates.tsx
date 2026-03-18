"use client";

import { ShiftTemplateList } from "../components/shift-template-list";

export function ShiftTemplates() {
  return (
    <div className="space-y-6 rounded-2xl border border-[#D5BA98]/40 bg-[#FDFBF9] p-5 sm:p-6">
        <ShiftTemplateList />
    </div>
  );
}
