"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateDishCategory } from '../hooks/useCreateDishCategory';
import FormHeader from './FormHeader';
import FormCard from './FormCard';
import CategoryNameInput from './CategoryNameInput';
import DescriptionTextarea from './DescriptionTextarea';
import StatusToggle from './StatusToggle';
import { FormErrors } from '../types';

export default function AddDishCategory() {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  const { createCategory, isLoading, error } = useCreateDishCategory();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!categoryName.trim()) {
      newErrors.categoryName = 'Category name is required';
    } else if (categoryName.length > 100) {
      newErrors.categoryName = 'Category name cannot exceed 100 characters';
    }

    if (description && description.length > 100) {
      newErrors.description = 'Description cannot exceed 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await createCategory({
        categoryName: categoryName.trim(),
        description: description.trim() || undefined,
        isDisabled: !isActive,
      });
      
      router.push('/dashboard/dish-category');
    } catch (error) {
      console.error('Failed to create category:', error);
      // Error message is already handled by the hook
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="w-full bg-[#F8F9FA]">
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <FormHeader
          title="Add New Dish Category"
          subtitle="Create a new category to organize your menu items"
          onCancel={handleCancel}
          onSave={handleSave}
          isLoading={isLoading}
          saveButtonText="Save Category"
        />

        <FormCard error={error}>
          <CategoryNameInput
            value={categoryName}
            onChange={setCategoryName}
            error={errors.categoryName}
          />
          
          <DescriptionTextarea
            value={description}
            onChange={setDescription}
            error={errors.description}
          />

          <StatusToggle
            isActive={isActive}
            onToggle={() => setIsActive(!isActive)}
          />
        </FormCard>
      </div>
    </div>
  );
}
