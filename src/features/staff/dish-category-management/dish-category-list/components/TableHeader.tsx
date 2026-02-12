import React from 'react';

export default function TableHeader() {
  return (
    <thead className="bg-gray-50 border-b border-zinc-200">
      <tr>
        <th className="px-6 py-4 text-center text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
          ID
        </th>
        <th className="px-6 py-4 text-left text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
          Name
        </th>
        <th className="px-6 py-4 text-left text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
          Description
        </th>
        <th className="px-6 py-4 text-left text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
          Status
        </th>
        <th className="px-6 py-4 text-right text-sm font-extrabold text-neutral-900 uppercase tracking-wide font-['Manrope']">
          Action
        </th>
      </tr>
    </thead>
  );
}
