"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDishCategory, useUpdateDishCategory } from '../hooks/useEditDishCategory';
import FormHeader from './FormHeader';
import FormCard from './FormCard';
import CategoryNameInput from './CategoryNameInput';
import DescriptionTextarea from './DescriptionTextarea';
import StatusToggle from './StatusToggle';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { FormErrors } from '../types';

interface EditDishCategoryProps {
  categoryId: string;
}

export default function EditDishCategory({ categoryId }: EditDishCategoryProps) {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  const numericId = parseInt(categoryId, 10);
  const { category, isLoading, error: fetchError } = useDishCategory(numericId);
  const { updateCategory, isLoading: isUpdating, error: updateError } = useUpdateDishCategory();

  useEffect(() => {
    if (category) {
      setCategoryName(category.categoryName);
      setDescription(category.description || '');
      setIsActive(!category.isDisabled);
    }
  }, [category]);

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

  const handleUpdate = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      await updateCategory(numericId, {
        categoryName: categoryName.trim(),
        description: description.trim() || undefined,
        isDisabled: !isActive,
      });
      
      router.push('/dashboard/dish-category');
    } catch (error) {
      console.error('Failed to update category:', error);
      // Error message is already handled by the hook with toast
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (fetchError) {
    return (
      <ErrorState
        error={fetchError}
        onBackToList={() => router.push('/dashboard/dish-category')}
      />
    );
  }

  return (
    <div className="bg-white">
      <div className="px-8">
        <FormHeader
          title="Edit Dish Category"
          subtitle="Update category information and settings"
          onCancel={handleCancel}
          onSave={handleUpdate}
          isLoading={isUpdating}
          saveButtonText="Save Changes"
        />

        <FormCard error={updateError}>
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
