"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDishCategory, useUpdateDishCategory } from '../hooks/useDishCategories';

interface EditDishCategoryProps {
  categoryId: string;
}

export default function EditDishCategory({ categoryId }: EditDishCategoryProps) {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    } else if (categoryName.length > 200) {
      newErrors.categoryName = 'Category name cannot exceed 200 characters';
    }

    if (description && description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
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
      // Error message is already handled by the hook
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-slate-600 text-[15px] font-['Inter']">Loading...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="w-full min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error: {fetchError}</div>
          <button
            onClick={() => router.push('/dashboard/dish-category')}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm font-medium"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F9FA]">
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        {/* Header Section */}
        <div className="mb-5">
          {/* Title and Actions */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-slate-900 text-[32px] font-bold font-['Inter'] leading-tight mb-1.5">
                Edit Dish Category
              </h1>
              <p className="text-slate-600 text-[15px] font-['Inter']">
                Update category information and settings
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="px-7 py-3 rounded-lg border border-slate-300 bg-white text-slate-700 text-[15px] font-semibold font-['Inter'] hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back To List
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="px-7 py-3 bg-[#1e293b] rounded-lg text-white text-[15px] font-semibold font-['Inter'] hover:bg-[#334155] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Update Category'}
              </button>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {updateError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-['Inter']">{updateError}</p>
            </div>
          )}
          
          <div className="max-w-[900px]">
            {/* Category Name */}
            <div className="mb-10">
              <label className="block text-[#1e293b] text-[13px] font-extrabold font-['Inter'] uppercase tracking-[0.5px] mb-4">
                Category Name *
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., Appetizers, Main Course, Desserts"
                className={`w-full px-4 py-3.5 bg-[#f8fafc] border rounded-lg text-slate-900 text-[15px] font-['Inter'] placeholder:text-slate-400 outline-none focus:bg-white transition-all ${
                  errors.categoryName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-slate-400'
                }`}
              />
              {errors.categoryName && (
                <p className="mt-2 text-sm text-red-600">{errors.categoryName}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-10">
              <label className="block text-[#1e293b] text-[13px] font-extrabold font-['Inter'] uppercase tracking-[0.5px] mb-4">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a brief description of this category and what types of dishes it includes..."
                rows={5}
                className={`w-full px-4 py-3.5 bg-[#f8fafc] border rounded-lg text-slate-900 text-[15px] font-['Inter'] leading-relaxed placeholder:text-slate-400 outline-none focus:bg-white transition-all resize-none ${
                  errors.description ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-slate-400'
                }`}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Status Section */}
            <div className="pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-[#1e293b] text-[13px] font-extrabold font-['Inter'] uppercase tracking-[0.5px] mb-3">
                    Category Status
                  </label>
                  <p className="text-slate-600 text-[15px] font-['Inter']">
                    {isActive 
                      ? 'This category is active and visible in the menu'
                      : 'This category is inactive and hidden from customers'}
                  </p>
                </div>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className="relative inline-block w-[50px] h-[26px] rounded-full transition-all cursor-pointer flex-shrink-0 shadow-sm ml-6"
                  style={{ backgroundColor: isActive ? '#10b981' : '#cbd5e1' }}
                >
                  <span
                    className="absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200"
                    style={{
                      transform: isActive ? 'translateX(24px)' : 'translateX(0)',
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
