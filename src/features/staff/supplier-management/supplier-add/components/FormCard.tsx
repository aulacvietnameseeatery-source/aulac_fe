"use client";

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormCardProps {
  children: React.ReactNode;
  error?: string | null;
}

export default function FormCard({ children, error }: FormCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
