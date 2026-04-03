'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Save, Loader2, ChevronDown, ChevronUp, Clock, MapPin, LogOut, Shield } from 'lucide-react';
import type { SystemSettingDetailDto, BulkUpdateSettingItemDto } from '../types/system-setting.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';
import { ALCard } from '@/components/ui/al-card';
import { cn } from '@/lib/utils';

/** Maps setting keys to their section for grouped display */
const SECTION_MAP: Record<string, string> = {
  'shift.allowed_early_check_in_minutes': 'attendance',
  'shift.late_grace_minutes': 'attendance',
  'shift.absence_threshold_minutes': 'attendance',
  'shift.early_leave_buffer_minutes': 'attendance',
  'shift.no_show_threshold_minutes': 'attendance',
  'shift.auto_logout_after_checkout_minutes': 'session',
  'shift.max_weekly_hours': 'scheduling',
  'shift.geofence_base_latitude': 'geofence',
  'shift.geofence_base_longitude': 'geofence',
  'shift.geofence_max_radius_meters': 'geofence',
};

/** Icon per section */
const SECTION_ICONS: Record<string, React.ReactNode> = {
  attendance: <Clock className="h-4 w-4 text-blue-600" />,
  session: <LogOut className="h-4 w-4 text-amber-600" />,
  scheduling: <Shield className="h-4 w-4 text-emerald-600" />,
  geofence: <MapPin className="h-4 w-4 text-violet-600" />,
};

interface ShiftSettingsCardProps {
  settings: SystemSettingDetailDto[];
  isSaving: boolean;
  onSave: (items: BulkUpdateSettingItemDto[]) => Promise<void>;
}

export const ShiftSettingsCard: React.FC<ShiftSettingsCardProps> = ({
  settings,
  isSaving,
  onSave,
}) => {
  const t = useTranslations('settings.shift');
  const tCommon = useTranslations('settings');
  const [values, setValues] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const initial: Record<string, string> = {};
    settings.forEach((s) => {
      if (!s.isSensitive) {
        initial[s.settingKey] = s.value != null ? String(s.value) : '';
      }
    });
    setValues(initial);
  }, [settings]);

  const handleChange = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    const items: BulkUpdateSettingItemDto[] = Object.entries(values).map(
      ([key, value]) => ({ key, value })
    );
    await onSave(items);
  }, [values, onSave]);

  // Group settings by section
  const sections = React.useMemo(() => {
    const map = new Map<string, SystemSettingDetailDto[]>();
    settings.forEach((s) => {
      const section = SECTION_MAP[s.settingKey] ?? 'other';
      if (!map.has(section)) map.set(section, []);
      map.get(section)!.push(s);
    });
    return map;
  }, [settings]);

  const sectionOrder = ['attendance', 'session', 'scheduling', 'geofence', 'other'];

  return (
    <ALCard
      variant="default"
      elevation="sm"
      radius="2xl"
      padding="none"
      className="border border-amber-200/50 shadow-sm transition-all hover:shadow-md flex flex-col h-full bg-white"
    >
      <div
        className="cursor-pointer select-none p-6"
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {t('title')}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {t('description')}
              </p>
            </div>
          </div>
          <div className="p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0">
            {collapsed ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          collapsed ? 'max-h-0 opacity-0' : 'max-h-750 opacity-100'
        )}
      >
        <div className="flex-1 flex flex-col">
          <div className="px-6 pb-6 space-y-6">
            {sectionOrder.map((sectionKey) => {
              const sectionSettings = sections.get(sectionKey);
              if (!sectionSettings || sectionSettings.length === 0) return null;

              return (
                <div key={sectionKey} className="space-y-4">
                  {/* Section header */}
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    {SECTION_ICONS[sectionKey]}
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {t(`sections.${sectionKey}`)}
                    </h4>
                  </div>

                  {/* Fields grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                    {sectionSettings.map((setting) => {
                      const shortKey = setting.settingKey.replace('shift.', '');
                      const label = t.has(`fields.${shortKey}.label`)
                        ? t(`fields.${shortKey}.label`)
                        : setting.settingName ?? shortKey.replace(/_/g, ' ');
                      const hint = t.has(`fields.${shortKey}.hint`)
                        ? t(`fields.${shortKey}.hint`)
                        : setting.description ?? '';
                      const isDecimal = setting.valueType === 'DECIMAL';

                      return (
                        <div key={setting.settingKey} className="space-y-1.5">
                          <label
                            htmlFor={`shift-${shortKey}`}
                            className="text-sm font-medium text-gray-700"
                          >
                            {label}
                          </label>
                          <Input
                            id={`shift-${shortKey}`}
                            type="number"
                            step={isDecimal ? '0.01' : '1'}
                            min="0"
                            value={values[setting.settingKey] ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleChange(setting.settingKey, e.target.value)
                            }
                            disabled={isSaving}
                            className="h-9"
                          />
                          {hint && (
                            <p className="text-xs text-gray-400">{hint}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save footer */}
          <div className="px-6 py-4 bg-gray-50/80 border-t border-amber-200/20 flex justify-end mt-auto rounded-b-2xl">
            <PermissionGuard permission={Permissions.ManageSystemSettings}>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-10 px-6 bg-[#1A3A52] hover:bg-[#1A3A52]/90 text-white shadow-md gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {tCommon('saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {tCommon('save')}
                  </>
                )}
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </div>
    </ALCard>
  );
};
