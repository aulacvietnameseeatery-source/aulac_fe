"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ingredientService, Ingredient } from '../../supplier-add/services/ingredientService';

interface IngredientsSelectProps {
  value: number[];
  onChange: (ids: number[]) => void;
}

export default function IngredientsSelect({ value, onChange }: IngredientsSelectProps) {
  const t = useTranslations('Supplier.Edit');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const data = await ingredientService.getAllIngredients();
        setIngredients(data);
      } catch (error) {
        console.error('Failed to load ingredients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  const handleCheckboxChange = (ingredientId: number) => {
    if (value.includes(ingredientId)) {
      onChange(value.filter(id => id !== ingredientId));
    } else {
      onChange([...value, ingredientId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('ingredients')}
        </label>
        <div className="text-sm text-gray-500">Loading ingredients...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium text-gray-700">
        {t('ingredients')}
      </label>
      <div className="text-sm text-gray-500 mb-2">{t('ingredientsPlaceholder')}</div>
      <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
        {ingredients.length === 0 ? (
          <div className="text-sm text-gray-500">No ingredients available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ingredients.map((ingredient) => (
              <label
                key={ingredient.ingredientId}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={value.includes(ingredient.ingredientId)}
                  onChange={() => handleCheckboxChange(ingredient.ingredientId)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {ingredient.ingredientName} ({ingredient.unit})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
