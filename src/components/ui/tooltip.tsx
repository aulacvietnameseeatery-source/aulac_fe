'use client';

import React, { useState } from 'react';
import '@/styles/components/tooltip.css';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip = ({
                            content,
                            children,
                            position = 'top'
                        }: TooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="admin-tooltip-wrapper"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className={`admin-tooltip-box admin-tooltip-${position}`}>
                    {content}
                    <span className="admin-tooltip-arrow" />
                </div>
            )}
        </div>
    );
};
