'use client';

import React from 'react';
import '@/styles/components/switch.css';
interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    showLabel?: boolean; // Cho phép ẩn/hiện chữ Active/Inactive bên cạnh
    activeLabel?: string;
    inactiveLabel?: string;
}

export const Switch = ({
    checked,
    onChange,
    disabled = false,
    showLabel = true,
    activeLabel = 'Active',
    inactiveLabel = 'Inactive'
}: SwitchProps) => {

    const handleToggle = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    return (
        <div className={`admin-switch-container ${disabled ? 'disabled' : ''}`}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                className={`admin-switch-root ${checked ? 'checked' : 'unchecked'}`}
                onClick={handleToggle}
            >
                <span className="admin-switch-thumb" />
            </button>

            {showLabel && (
                <span className={`admin-switch-text ${checked ? 'active' : 'inactive'}`}>
                    {checked ? activeLabel : inactiveLabel}
                </span>
            )}
        </div>
    );
};