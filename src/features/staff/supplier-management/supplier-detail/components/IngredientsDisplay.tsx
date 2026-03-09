"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Ingredient } from '../types';

interface IngredientsDisplayProps {
  ingredients: Ingredient[];
}

export default function IngredientsDisplay({ ingredients }: IngredientsDisplayProps) {
  const t = useTranslations('Supplier.Detail');
  
  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium text-gray-700">
        {t('ingredients')}
      </label>
      <div className="border rounded-md p-4 max-h-60 overflow-y-auto bg-gray-50">
        {ingredients.length === 0 ? (
          <div className="text-sm text-gray-500">{t('noIngredients')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ingredients.map((ingredient) => (
              <div
                key={ingredient.ingredientId}
                className="flex items-center gap-2 p-2 rounded bg-white border border-gray-200"
              >
                <span className="text-sm text-gray-700">
                  {ingredient.ingredientName} ({ingredient.unit})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
