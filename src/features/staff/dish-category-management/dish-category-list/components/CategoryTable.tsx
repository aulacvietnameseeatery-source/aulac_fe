import React from 'react';
import TableHeader from './TableHeader';
import CategoryRow from './CategoryRow';
import { DishCategory } from '../types';

interface CategoryTableProps {
  categories: DishCategory[];
  isLoading: boolean;
  onEdit: (id: number) => void;
  onToggleStatus: (id: number, currentDisabled: boolean) => void;
  pageIndex?: number;
  pageSize?: number;
}

export default function CategoryTable({
  categories,
  isLoading,
  onEdit,
  onToggleStatus,
  pageIndex = 1,
  pageSize = 10,
}: CategoryTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader />
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-600">
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-600">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category, index) => (
                <CategoryRow
                  key={category.categoryId}
                  category={category}
                  index={(pageIndex - 1) * pageSize + index + 1}
                  onEdit={onEdit}
                  onToggleStatus={onToggleStatus}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
