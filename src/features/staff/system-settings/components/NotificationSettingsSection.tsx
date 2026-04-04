'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, Save, Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { EmailChipInput } from '@/components/ui/email-chip-input';
import {
  getGroupSettings,
  updateGroupSettings,
  createSetting,
} from '../services/system-setting.service';
import type { SystemSettingDetailDto } from '../types/system-setting.types';
import { ALCard } from '@/components/ui/al-card';

/** Defines each notification event the UI supports. */
const NOTIFICATION_EVENTS = [
  'reservation_created',
  'reservation_cancelled',
  'contact_form',
  'payment_success',
] as const;

type EventCode = (typeof NOTIFICATION_EVENTS)[number];

interface EventState {
  enabled: boolean;
  recipients: string[];
}

type EventStates = Record<EventCode, EventState>;

const DEFAULT_EVENT_STATES: EventStates = {
  reservation_created: { enabled: false, recipients: [] },
  reservation_cancelled: { enabled: false, recipients: [] },
  contact_form: { enabled: false, recipients: [] },
  payment_success: { enabled: false, recipients: [] },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function flattenRows(rows: string[][]): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    for (const email of row) {
      const normalized = email.trim().toLowerCase();
      if (EMAIL_RE.test(normalized)) set.add(normalized);
    }
  }
  return Array.from(set);
}

function parseRecipientsRaw(raw: string): { valid: string[]; invalid: string[] } {
  const rows = raw
    .split(/\r?\n|;|,/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const validSet = new Set<string>();
  const invalidSet = new Set<string>();

  for (const email of rows) {
    if (EMAIL_RE.test(email)) {
      validSet.add(email);
    } else {
      invalidSet.add(email);
    }
  }

  return {
    valid: Array.from(validSet),
    invalid: Array.from(invalidSet),
  };
}

function parseRecipientsValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v).trim().toLowerCase())
      .filter((v) => EMAIL_RE.test(v));
  }

  if (typeof value !== 'string' || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((v) => String(v).trim().toLowerCase())
        .filter((v) => EMAIL_RE.test(v));
    }
  } catch {
    // fall through to legacy delimiter parsing
  }

  return parseRecipientsRaw(value).valid;
}

export function NotificationSettingsSection() {
  const t = useTranslations('settings.Notification');
  const tCommon = useTranslations('settings');

  const [settings, setSettings] = useState<SystemSettingDetailDto[]>([]);
  const [eventStates, setEventStates] = useState<EventStates>({ ...DEFAULT_EVENT_STATES });
  const [recipientRows, setRecipientRows] = useState<Record<EventCode, string[][]>>({
    reservation_created: [[]],
    reservation_cancelled: [[]],
    contact_form: [[]],
    payment_success: [[]],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load notification group settings
  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getGroupSettings('notification');
      setSettings(data);
      hydrateFromSettings(data);
      setHasChanges(false);
    } catch {
      // Group might not exist yet — that's OK
      setSettings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hydrateFromSettings = (list: SystemSettingDetailDto[]) => {
    const map = Object.fromEntries(list.map((s) => [s.settingKey, s]));
    const next = { ...DEFAULT_EVENT_STATES };
    const nextRows = {
      reservation_created: [[]] as string[][],
      reservation_cancelled: [[]] as string[][],
      contact_form: [[]] as string[][],
      payment_success: [[]] as string[][],
    };
    for (const code of NOTIFICATION_EVENTS) {
      const enabledKey = `notification.${code}.enabled`;
      const recipientsKey = `notification.${code}.recipients`;
      const recipients = parseRecipientsValue(map[recipientsKey]?.value);
      const rows = recipients.length > 0 ? [recipients] : [[]];
      next[code] = {
        enabled: map[enabledKey]?.value === true || map[enabledKey]?.value === 'true',
        recipients,
      };
      nextRows[code] = rows;
    }
    setEventStates(next);
    setRecipientRows(nextRows);
  };

  const updateEvent = (code: EventCode, patch: Partial<EventState>) => {
    setEventStates((prev) => ({
      ...prev,
      [code]: { ...prev[code], ...patch },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Ensure all keys exist — create missing ones
      const existingKeys = new Set(settings.map((s) => s.settingKey));

      for (const code of NOTIFICATION_EVENTS) {
        const enabledKey = `notification.${code}.enabled`;
        const recipientsKey = `notification.${code}.recipients`;

        if (!existingKeys.has(enabledKey)) {
          await createSetting({
            key: enabledKey,
            settingName: `${code} notification enabled`,
            valueType: 'BOOL',
            value: String(eventStates[code].enabled),
            description: `Enable email notifications for ${code.replace(/_/g, ' ')} events`,
            isSensitive: false,
          });
        }
        if (!existingKeys.has(recipientsKey)) {
          await createSetting({
            key: recipientsKey,
            settingName: `${code} notification recipients`,
            valueType: 'JSON',
            value: JSON.stringify(eventStates[code].recipients),
            description: `JSON array of email recipients for ${code.replace(/_/g, ' ')} notifications`,
            isSensitive: false,
          });
        }
      }

      // Bulk update the group
      const items = NOTIFICATION_EVENTS.flatMap((code) => [
        {
          key: `notification.${code}.enabled`,
          value: String(eventStates[code].enabled),
        },
        {
          key: `notification.${code}.recipients`,
          value: JSON.stringify(eventStates[code].recipients),
        },
      ]);

      await updateGroupSettings('notification', { items });
      toast.success(tCommon('notifications.saveSuccess'));
      await load();
    } catch (err: any) {
      console.error('Failed to save notification settings:', err);
      toast.error(err?.response?.data?.userMessage ?? tCommon('notifications.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
      </div>
    );
  }

  return (
    <ALCard
      variant="default"
      elevation="sm"
      radius="2xl"
      padding="none"
      className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex h-full min-h-0 flex-col overflow-hidden bg-white"
    >
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{t('title')}</h3>
            <p className="text-sm text-muted-foreground">{t('description')}</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            size="sm"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {tCommon('save')}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 overscroll-contain">
        <div className="grid gap-4">
          {NOTIFICATION_EVENTS.map((code) => (
            <div
              key={code}
              className="rounded-lg border bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-medium">
                      {t(`events.${code}.label`)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {t(`events.${code}.description`)}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={eventStates[code].enabled}
                  onChange={(checked: boolean) =>
                    updateEvent(code, { enabled: checked })
                  }
                  showLabel={false}
                />
              </div>

              {eventStates[code].enabled && (
                <div className="pl-11 space-y-1.5">
                  <span className="text-xs text-muted-foreground">
                    {t('recipientsLabel')}
                  </span>
                  <div className="space-y-2">
                    {recipientRows[code].map((row, rowIndex) => (
                      <div key={`${code}-row-${rowIndex}`} className="flex items-start gap-2">
                        <EmailChipInput
                          className="flex-1"
                          value={row}
                          onChange={(emails) => {
                            setRecipientRows((prev) => {
                              const next = { ...prev };
                              const current = [...next[code]];
                              current[rowIndex] = emails;
                              next[code] = current;

                              const allRecipients = flattenRows(current);
                              updateEvent(code, { recipients: allRecipients });
                              return next;
                            });
                          }}
                          placeholder={t('recipientsPlaceholder')}
                        />

                        {recipientRows[code].length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setRecipientRows((prev) => {
                                const next = { ...prev };
                                const current = [...next[code]];
                                current.splice(rowIndex, 1);
                                next[code] = current.length > 0 ? current : [[]];

                                const allRecipients = flattenRows(next[code]);
                                updateEvent(code, { recipients: allRecipients });
                                return next;
                              });
                            }}
                            className="mt-1"
                            aria-label={t('removeRecipientInput')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('recipientsHint')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </ALCard>

  );
}
