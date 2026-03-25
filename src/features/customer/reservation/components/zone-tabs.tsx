import React from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import "../styles/index.css";

interface ZoneTabsProps {
  zones: string[];
  activeZone: string;
  onChange: (zone: string) => void;
}

export default function ZoneTabs({ zones, activeZone, onChange } : ZoneTabsProps) {
  const t = useTranslations('reservations.public.zone');

  const getLabel = (zone: string) => {
    try {
      return t(zone);
    } catch {
      return zone;
    }
  };

  return (
    <div className="zone-tabs-wrapper">
      <div className="zone-tabs-container">
        {zones.map((zone) => (
          <button
            key={zone}
            onClick={() => onChange(zone)}
            className={cn(
              "zone-tab-button",
              activeZone === zone && "zone-tab-active"
            )}
          >
            {getLabel(zone)}
          </button>
        ))}
      </div>
    </div>
  );
};
