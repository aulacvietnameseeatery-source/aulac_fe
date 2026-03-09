'use client';

import React from 'react';
import { SystemSettingDetailDto, SettingValueType } from '../types/system-setting.types';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';

interface SettingFieldProps {
    setting: SystemSettingDetailDto;
    value: string;
    onChange: (key: string, value: string) => void;
    disabled?: boolean;
}

const VALUE_TYPE_LABELS: Record<SettingValueType, string> = {
    STRING: 'Text',
    INT: 'Integer',
    DECIMAL: 'Decimal',
    BOOL: 'Boolean',
    JSON: 'JSON',
};

export const SettingField: React.FC<SettingFieldProps> = ({
    setting,
    value,
    onChange,
    disabled = false,
}) => {
    const { settingKey, settingName, valueType, description, isSensitive } = setting;

    // Derive a display label from the settingName first, fallback to parsing the key (e.g. "password.min_length" → "Min Length")
    const rawLabel = settingKey.includes('.')
        ? settingKey.split('.').slice(1).join('.')
        : settingKey;

    const displayLabel = settingName || rawLabel
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const fieldId = `setting-${settingKey.replace(/\./g, '-')}`;

    const renderInput = () => {
        if (isSensitive) {
            return (
                <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                    <Lock className="h-4 w-4" />
                    <span>Sensitive – value hidden</span>
                </div>
            );
        }

        switch (valueType) {
            case 'BOOL':
                return (
                    <div className="py-1">
                        <Switch
                            checked={value === 'true'}
                            onChange={(checked: boolean) => onChange(settingKey, String(checked))}
                            disabled={disabled}
                            showLabel={false}
                        />
                    </div>
                );
            case 'JSON':
                return (
                    <textarea
                        id={fieldId}
                        value={value}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(settingKey, e.target.value)}
                        disabled={disabled}
                        rows={4}
                        className="flex w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                        placeholder="JSON value…"
                    />
                );
            case 'INT':
                return (
                    <Input
                        id={fieldId}
                        type="number"
                        step="1"
                        value={value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(settingKey, e.target.value)}
                        disabled={disabled}
                    />
                );
            case 'DECIMAL':
                return (
                    <Input
                        id={fieldId}
                        type="number"
                        step="any"
                        value={value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(settingKey, e.target.value)}
                        disabled={disabled}
                    />
                );
            default: // STRING
                return (
                    <Input
                        id={fieldId}
                        type="text"
                        value={value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(settingKey, e.target.value)}
                        disabled={disabled}
                    />
                );
        }
    };

    return (
        <div className="flex flex-col gap-1.5">
            {/* Label row */}
            <div className="flex items-center gap-2">
                <label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
                    {displayLabel}
                </label>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {VALUE_TYPE_LABELS[valueType]}
                </Badge>
                {isSensitive && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-amber-600 border-amber-300">
                        Sensitive
                    </Badge>
                )}
            </div>

            {renderInput()}

            {description && (
                <p className="text-xs text-gray-500">{description}</p>
            )}
            <p className="text-[10px] text-gray-400 font-mono">{settingKey}</p>
        </div>
    );
};
