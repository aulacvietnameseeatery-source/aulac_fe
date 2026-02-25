import React from 'react';

interface OrderStatusCardProps {
    label: string;
    count: number;
    icon: React.ReactNode;
    colorClass: string;
    isActive?: boolean;
    onClick?: () => void;
}

export const OrderStatusCard: React.FC<OrderStatusCardProps> = ({
    label,
    count,
    icon,
    colorClass,
    isActive,
    onClick,
}) => {
    return (
        <div
            onClick={onClick}
            className={`
        bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}
        ${isActive ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-100'}
      `}
        >
            <div>
                <span className="text-xs font-medium text-gray-500 mb-1 block">{label}</span>
                <h4 className="text-2xl font-bold text-gray-900">{count}</h4>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${colorClass}`}>
                {icon}
            </div>
        </div>
    );
};
