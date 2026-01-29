import React from 'react';
import { useTranslations } from 'next-intl';
import LegendItem from './legend-item';

export default function Legend() {
  const t = useTranslations('Reservation.Legend');

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <LegendItem color="bg-emerald-500" label={t('available')} />
      <LegendItem color="bg-stone-400" label={t('reserved')} />
      <LegendItem color="bg-[#1A3A52]" label={t('selected')} bordered />
    </div>
  );
};
