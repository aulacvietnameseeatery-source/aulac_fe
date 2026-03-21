"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Loader2, Volume2, VolumeX, Bell, BellOff, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getLocalizedApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "../store/notification.store";
import { notificationService } from "../services/notification.service";
import { TYPE_CONFIG, DEFAULT_TYPE_CONFIG } from "../constants/notification.constants";
import type {
  NotificationPreferenceDto,
  NotificationPreferenceItemRequest,
} from "../types/notification.types";

interface NotificationPreferencesProps {
  onBack: () => void;
}

/**
 * Notification preferences panel — allows users to toggle
 * notification visibility and sound per type, grouped by category.
 */
export function NotificationPreferences({ onBack }: NotificationPreferencesProps) {
  const t = useTranslations("Notifications");
  const storedPrefs = useNotificationStore((s) => s.preferences);
  const setPreferences = useNotificationStore((s) => s.setPreferences);

  // Local editing state
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferenceDto[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Initialize from store
  useEffect(() => {
    setLocalPrefs(storedPrefs.map((p) => ({ ...p })));
  }, [storedPrefs]);

  const toggleEnabled = useCallback((type: string) => {
    setLocalPrefs((prev) =>
      prev.map((p) =>
        p.notificationType === type ? { ...p, isEnabled: !p.isEnabled } : p
      )
    );
    setDirty(true);
  }, []);

  const toggleSound = useCallback((type: string) => {
    setLocalPrefs((prev) =>
      prev.map((p) =>
        p.notificationType === type ? { ...p, soundEnabled: !p.soundEnabled } : p
      )
    );
    setDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const preferences: NotificationPreferenceItemRequest[] = localPrefs.map((p) => ({
        notificationType: p.notificationType,
        isEnabled: p.isEnabled,
        soundEnabled: p.soundEnabled,
      }));
      await notificationService.updatePreferences({ preferences });
      setPreferences(localPrefs);
      setDirty(false);
      toast.success(t("preferences.saveSuccess"));
    } catch (error) {
      toast.error(getLocalizedApiErrorMessage(error, t("preferences.saveError")));
    } finally {
      setSaving(false);
    }
  }, [localPrefs, setPreferences, t]);

  // Group by category
  const grouped: Record<string, NotificationPreferenceDto[]> = {};
  for (const pref of localPrefs) {
    const config = TYPE_CONFIG[pref.notificationType] ?? DEFAULT_TYPE_CONFIG;
    const cat = config.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(pref);
  }

  const categories = Object.keys(grouped).sort();

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 text-white/40 hover:text-white rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h3 className="text-white font-semibold text-base">{t("preferences.title")}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md transition-colors",
              dirty
                ? "bg-[#FFAB2D] text-[#1A3A51] hover:bg-[#FFB952]"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            )}
          >
            {saving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            {t("preferences.save")}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar p-1">
        {localPrefs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-white/40" />
          </div>
        ) : (
          <div className="p-3 space-y-4">
            {categories.map((category) => (
              <div key={category}>
                <h4 className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-3">
                  {t(`categories.${category}` as Parameters<typeof t>[0])}
                </h4>
                <div className="space-y-1">
                  {grouped[category].map((pref) => {
                    const config = TYPE_CONFIG[pref.notificationType] ?? DEFAULT_TYPE_CONFIG;
                    const Icon = config.icon;

                    return (
                      <div
                        key={pref.notificationType}
                        className="group p-3 rounded-xl hover:bg-white/5 transition-all relative"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg border border-white/15 bg-white/5 text-white/70 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-white/70 text-[13px] leading-relaxed truncate">
                              {t(`types.${config.label}` as Parameters<typeof t>[0])}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-white/40 text-[11px]">
                              <span>{pref.isEnabled ? t("preferences.enabled") : t("preferences.disabled")}</span>
                              <span>·</span>
                              <span>{pref.soundEnabled ? t("preferences.soundOn") : t("preferences.soundOff")}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => toggleSound(pref.notificationType)}
                              className={cn(
                                "p-2 rounded-md transition-colors border",
                                pref.soundEnabled
                                  ? "text-white/80 border-white/20 bg-white/10 hover:text-blue-300"
                                  : "text-white/30 border-transparent bg-white/5 hover:text-white/60"
                              )}
                              title={
                                pref.soundEnabled
                                  ? t("preferences.soundOn")
                                  : t("preferences.soundOff")
                              }
                            >
                              {pref.soundEnabled ? (
                                <Volume2 className="w-3.5 h-3.5" />
                              ) : (
                                <VolumeX className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => toggleEnabled(pref.notificationType)}
                              className={cn(
                                "p-2 rounded-md transition-colors border",
                                pref.isEnabled
                                  ? "text-white/80 border-white/20 bg-white/10 hover:text-emerald-300"
                                  : "text-white/30 border-transparent bg-white/5 hover:text-white/60"
                              )}
                              title={
                                pref.isEnabled
                                  ? t("preferences.enabled")
                                  : t("preferences.disabled")
                              }
                            >
                              {pref.isEnabled ? (
                                <Bell className="w-3.5 h-3.5" />
                              ) : (
                                <BellOff className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
