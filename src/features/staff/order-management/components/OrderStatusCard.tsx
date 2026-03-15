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
        bg-[#FDFBF9] rounded-lg shadow-none border p-2.5 flex items-center justify-between
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:border-[#D5BA98]/70 hover:-translate-y-0.5' : ''}
        ${isActive ? 'ring-2 ring-[#1A3A52]/20 border-[#1A3A52]/35' : 'border-[#D5BA98]/45'}
      `}
        >
            <div>
                <span className="text-xs font-medium text-[#1A3A52]/55 mb-0.5 block">{label}</span>
                <h4 className="text-lg font-bold text-[#1A3A52] leading-none">{count}</h4>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${colorClass}`}>
                {icon}
            </div>
        </div>
    );
};
