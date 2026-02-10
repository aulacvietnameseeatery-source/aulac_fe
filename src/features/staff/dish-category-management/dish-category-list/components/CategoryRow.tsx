import React from 'react';
import { Edit } from 'lucide-react';
import { DishCategory } from '../types';

interface CategoryRowProps {
  category: DishCategory;
  index: number;
  onEdit: (id: number) => void;
  onToggleStatus: (id: number, currentDisabled: boolean) => void;
}

export default function CategoryRow({ category, index, onEdit, onToggleStatus }: CategoryRowProps) {
  return (
    <tr className="border-t border-zinc-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-5 text-base text-neutral-900 text-center font-['Manrope']">
        {index}
      </td>
      <td className="px-6 py-5 text-base text-neutral-900 font-['Manrope']">
        {category.categoryName}
      </td>
      <td className="px-6 py-5 text-base text-neutral-900 font-['Manrope']">
        {category.description || '-'}
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center">
          <button
            onClick={() => onToggleStatus(category.categoryId, category.isDisabled)}
            className="relative inline-block w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
            style={{ backgroundColor: !category.isDisabled ? '#1f2937' : '#e5e7eb' }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
              style={{
                transform: !category.isDisabled ? 'translateX(16px)' : 'translateX(0)',
                border: !category.isDisabled ? '1px solid white' : '1px solid #d1d5db'
              }}
            />
          </button>
          <span className="ml-3 text-sm text-slate-600 font-['Inter']">
            {!category.isDisabled ? 'Active' : 'Inactive'}
          </span>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onEdit(category.categoryId)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-5 h-5 text-slate-900" />
          </button>
        </div>
      </td>
    </tr>
  );
}
