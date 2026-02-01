import React from 'react';
import { useTranslations } from 'next-intl';
import LegendItem from './legend-item';
import "../styles/index.css";

export default function Legend() {
  const t = useTranslations('Reservation.Legend');

  return (
    <div className="legend-wrapper">
      <LegendItem color="bg-emerald-500" label={t("available")} />
      <LegendItem color="bg-stone-400" label={t("reserved")} />
      <LegendItem color="bg-slate-900" label={t("selected")} bordered />
    </div>
  );
};
