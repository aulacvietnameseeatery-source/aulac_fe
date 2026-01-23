'use client';

import { useState } from 'react';
import { ZONES_DATA } from './data/zones.data';

import ZoneTabs from './components/ZoneTabs';
import TableGrid from './components/TableGrid';
import ReservationSidebar from './components/ReservationSidebar';
import BookingModal from './components/BookingModal';
import Legend from '@/features/reservation/components/Legend';

import { useReservation } from './hooks/useReservation';
import { useTableSelection } from './hooks/useTableSelection';

export default function ReservationPage() {
  const zones = Object.keys(ZONES_DATA);
  const [activeZone, setActiveZone] = useState(zones[0]);

  const tables = ZONES_DATA[activeZone];

  const tableSelection = useTableSelection(tables);
  const reservation = useReservation();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col">
        <main className="grow max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-12 mb-24">
        {/* Header */}
        <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1A3A52] mb-3">
            Select Your Table
            </h2>

            {/* Row chứa Subtitle và Legend nằm ngang nhau */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
               <p className="text-stone-500 font-light text-sm md:text-base">Experience fine dining at its best. Choose your preferred zone and table below.</p>
              
               <Legend />
            </div>
        </div>

        {/* Zone Tabs */}
        <ZoneTabs
            zones={zones}
            activeZone={activeZone}
            onChange={(zone) => {
            setActiveZone(zone);
            tableSelection.clearSelection();
            }}
        />

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
            <TableGrid
                tables={tables}
                selectedTableId={tableSelection.selectedTableId}
                onSelect={tableSelection.toggleTable}
            />
            </div>

            <ReservationSidebar
            selectedTable={tableSelection.selectedTable}
            date={reservation.date}
            time={reservation.time}
            onDateTimeChange={reservation.setDateTime}
            onBook={reservation.openBooking}
            />
        </div>

        <BookingModal
            isOpen={reservation.isBookingModalOpen}
            onClose={reservation.closeBooking}
            onConfirm={() => {
            reservation.closeBooking();
            tableSelection.clearSelection();
            }}
            tableData={
            tableSelection.selectedTable
                ? {
                    ...tableSelection.selectedTable,
                    date: reservation.date,
                    time: reservation.time,
                }
                : null
            }
            guestInfo={reservation.guestInfo}
        />
        </main>
    </div>
    
  );
}
