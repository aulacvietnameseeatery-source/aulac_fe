"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCreateDishCategory } from '../hooks/useCreateDishCategory';
import FormHeader from './FormHeader';
import FormCard from './FormCard';
import CategoryNameInput from './CategoryNameInput';
import DescriptionTextarea from './DescriptionTextarea';
import { FormErrors } from '../types';

export default function AddDishCategory() {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
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
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      await createCategory({
        categoryName: categoryName.trim(),
        description: description.trim() || undefined,
        isDisabled: false,
      });
      
      router.push('/dashboard/dish-category');
    } catch (error) {
      console.error('Failed to create category:', error);
      // Error message is already handled by the hook with toast
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="bg-white">
      <div className="px-8">
        <FormHeader
          title="Add New Dish Category"
          subtitle="Create a new category to organize your menu items"
          onCancel={handleCancel}
          onSave={handleSave}
          isLoading={isLoading}
          saveButtonText="Create Category"
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
        </FormCard>
      </div>
    </div>
  );
}
