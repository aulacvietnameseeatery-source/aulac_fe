import React from 'react';
import { Button } from '@/components/ui/button';

interface FormHeaderProps {
  title: string;
  subtitle: string;
  onCancel: () => void;
  onSave: () => void;
  isLoading: boolean;
  saveButtonText: string;
}

export default function FormHeader({
  title,
  subtitle,
  onCancel,
  onSave,
  isLoading,
  saveButtonText,
}: FormHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={onCancel}
          type="button"
          variant="outline"
          size="lg"
          disabled={isLoading}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          type="button"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {saveButtonText}
        </Button>
      </div>
    </div>
  );
}
