import React from 'react';
import { cn } from '@/lib/utils';

interface ZoneTabsProps {
  zones: string[];
  activeZone: string;
  onChange: (zone: string) => void;
}

const ZoneTabs: React.FC<ZoneTabsProps> = ({ zones, activeZone, onChange }) => {
  return (
    <div className="w-full border-b border-stone-200 mb-8">
      <div className="flex gap-6 md:gap-8 text-sm font-bold uppercase text-stone-400">
        {zones.map(zone => (
          <button
            key={zone}
            onClick={() => onChange(zone)}
            className={cn(
              'pb-4 whitespace-nowrap transition-all duration-300 relative translate-y-px cursor-pointer',
              activeZone === zone
                ? 'text-[#132538] border-b-2 border-[#1A3A52]'
                : 'hover:text-[#132538]'
            )}
          >
            {zone}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ZoneTabs;
