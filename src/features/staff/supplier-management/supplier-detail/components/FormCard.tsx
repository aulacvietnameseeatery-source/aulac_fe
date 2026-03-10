"use client";

import React from 'react';

interface FormCardProps {
  children: React.ReactNode;
}

export default function FormCard({ children }: FormCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
