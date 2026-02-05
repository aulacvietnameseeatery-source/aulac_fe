import React from 'react';
import { useTranslations } from 'next-intl';
import LegendItem from './legend-item';
import "../styles/index.css";

export default function Legend() {
    const t = useTranslations('Reservation.Legend');

    return (
        <div className="legend-wrapper">
            <LegendItem
                color="bg-white"
                label={t('available')}
                bordered
            />
            <LegendItem
                color="bg-[#1A3A52]"
                label={t('selected')}
            />
            <LegendItem
                color="bg-stone-200"
                label={t('reserved')}
            />
        </div>
    );
}
