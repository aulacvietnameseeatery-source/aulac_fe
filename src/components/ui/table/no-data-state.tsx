import React from 'react';
import { useTranslations } from 'next-intl';

export const NoDataState: React.FC = () => {
    const t = useTranslations('common.table');

    return (
        <div className="absolute text-center top-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="flex flex-col items-center gap-4 p-8">
                <svg 
                    className="w-32 h-32 text-gray-300" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                </svg>
                <p className="text-gray-900 text-sm font-normal">{t('noData')}</p>
            </div>
        </div>
    );
};
