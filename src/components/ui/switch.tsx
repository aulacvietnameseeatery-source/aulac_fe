'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import '@/styles/components/switch.css';
interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    showLabel?: boolean; // Cho phép ẩn/hiện chữ Active/Inactive bên cạnh
}

export const Switch = ({
    checked,
    onChange,
    disabled = false,
    showLabel = true
}: SwitchProps) => {
    const t = useTranslations('common.switch');

    const handleToggle = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    return (
        <div className={`admin-switch-container ${disabled ? 'disabled' : ''}`}>
            <button
                data-tooltip-content={checked ? t('active') : t('inactive')}
                data-tooltip-id="my-tooltip"
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
                    {checked ? t('active') : t('inactive')}
                </span>
            )}
        </div>
    );
};