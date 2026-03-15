"use client";

import { ShiftTemplateList } from "../components/shift-template-list";

export function ShiftTemplates() {
  return (
    <div className="space-y-6 rounded-2xl border border-[#D5BA98]/40 bg-[#FDFBF9] p-5 sm:p-6">
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
        <h1 className="text-2xl font-semibold tracking-wide text-[#1A3A52]">Shift Templates</h1>
        <p className="mt-1 text-sm text-[#1A3A52]/70">
          Define reusable shift structures for faster and more consistent scheduling.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <ShiftTemplateList />
      </section>
    </div>
  );
}
