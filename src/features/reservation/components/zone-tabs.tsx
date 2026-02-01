import React from 'react';
import { cn } from '@/lib/utils';
import "../styles/index.css";

interface ZoneTabsProps {
  zones: string[];
  activeZone: string;
  onChange: (zone: string) => void;
}

export default function ZoneTabs({ zones, activeZone, onChange } : ZoneTabsProps) {
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
            {zone}
          </button>
        ))}
      </div>
    </div>
  );
};
