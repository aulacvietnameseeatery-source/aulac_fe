import React, { ReactNode } from 'react';

interface FormCardProps {
  error?: string | null;
  children: ReactNode;
}

export default function FormCard({ error, children }: FormCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-['Inter']">{error}</p>
        </div>
      )}
      
      <div className="max-w-[900px]">
        {children}
      </div>
    </div>
  );
}
