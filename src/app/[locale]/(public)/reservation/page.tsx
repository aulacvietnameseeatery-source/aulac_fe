'use client';

import { useTranslations } from 'next-intl';
import React, { useEffect, useState, useCallback } from 'react';
import {
  TableGrid,
  BookingModal,
  Legend,
  DateTimeSelect,
  reservationApi,
  TableAvailabilityDto,
  SignalRProvider,
  useSignalR,
  FilterTabs,
  CallRestaurantPopup
} from '@/features/reservation-2';
import { toast } from "sonner"

function ReservationContent() {
  const t = useTranslations('Reservation.Header');
  const tToast = useTranslations('Reservation.Toast');
  const tCall = useTranslations('Reservation.CallButton');

  // State
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [time, setTime] = useState<string>(() => {
    // Round UP to next 30-minute slot
    const now = new Date();
    const minutes = now.getMinutes();
    let hours = now.getHours();
    let roundedMinutes = '00';

    if (minutes > 0 && minutes <= 30) {
      roundedMinutes = '30';
    } else if (minutes > 30) {
      hours += 1;
      roundedMinutes = '00';
    }

    return `${hours.toString().padStart(2, '0')}:${roundedMinutes}`;
  });
  const [tables, setTables] = useState<TableAvailabilityDto[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCallPopup, setShowCallPopup] = useState(false);

  // Filters
  const [activeZone, setActiveZone] = useState("All");

  const ZONES = ["All", "Indoor", "Outdoor", "Rooftop"];



  // Booking State
  // We use selectedTableId to control Modal visibility
  // If selectedTableId is set, Modal is open.

  // SignalR
  const { connection } = useSignalR();

  // Fetch Availability
  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const reservedTime = `${date}T${time}:00`;
      const res = await reservationApi.getAvailability({ reservedTime, zone: activeZone });
      if (res.success && res.data) {
        setTables(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch tables", error);
    } finally {
      setLoading(false);
    }
  }, [date, time, activeZone]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Handle SignalR Updates
  useEffect(() => {
    if (!connection) return;

    const handleUpdate = (data: any) => {
      if (data && data.lockedUntil) {
        const until = new Date(data.lockedUntil).getTime();
        const now = new Date().getTime();
        const delay = until - now;
        if (delay > 0) {
          setTimeout(() => {
            fetchAvailability();
          }, delay + 1000); // Add 1s buffer
        }
      }
      fetchAvailability();
    };

    connection.on("TableLocked", handleUpdate);
    connection.on("TableUnlocked", handleUpdate);
    connection.on("ReservationCreated", handleUpdate);
    connection.on("ReservationStatusChanged", handleUpdate);

    return () => {
      connection.off("TableLocked", handleUpdate);
      connection.off("TableUnlocked", handleUpdate);
      connection.off("ReservationCreated", handleUpdate);
      connection.off("ReservationStatusChanged", handleUpdate);
    };
  }, [connection, fetchAvailability]);

  // Set timeouts for existing locks in `tables`
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    tables.forEach(t => {
      if (!t.isAvailable && t.lockedUntil) {
        const until = new Date(t.lockedUntil).getTime();
        const now = new Date().getTime();
        const delay = until - now;
        if (delay > 0) {
          const timer = setTimeout(() => {
            fetchAvailability();
          }, delay + 1000);
          timers.push(timer);
        }
      }
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [tables, fetchAvailability]);


  // Handle Selection
  const handleSelectTable = (id: number) => {
    const table = tables.find(t => t.tableId === id);
    if (table && table.isAvailable) {
      setSelectedTableId(id);
    }
  };

  const selectedTable = tables.find(t => t.tableId === selectedTableId) || null;

  // Handle Booking - Direct Reservation (No Lock)
  const handleBooking = async (guestData: { name: string; phone: string; email: string; partySize: number }): Promise<boolean> => {
    if (!selectedTableId) return false;

    const reservedTime = `${date}T${time}:00`;

    try {
      // Create Reservation Directly
      const createRes = await reservationApi.createReservation({
        tableId: selectedTableId,
        customerName: guestData.name,
        phone: guestData.phone,
        email: guestData.email,
        partySize: guestData.partySize,
        reservedTime: reservedTime
      });

      if (createRes.success) {
        toast.success(tToast('success'));
        fetchAvailability();
        return true;
      } else {
        toast.error(createRes.userMessage || tToast('error'));
        return false;
      }

    } catch (error: any) {
      toast.error(tToast('error'));
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col">
      <main className="grow max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-12 mb-24">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1A3A52] mb-3">
            {t('title')}
          </h2>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-stone-500 font-light text-sm md:text-base">
              {t('subtitle')}
            </p>
            {/*<Legend />*/}
          </div>
        </div>

        {/* Content */}
        <DateTimeSelect
          date={date}
          time={time}
          onDateTimeChange={(d, t) => {
            setDate(d);
            setTime(t);
          }}
        />

        {/* Filters */}
        <div className="flex flex-row gap-4 mb-6 overflow-x-auto">
          <FilterTabs
            label="Zone"
            options={ZONES}
            value={activeZone}
            onChange={setActiveZone}
          />
        </div>

        <div className="w-full">
          <TableGrid
            tables={tables}
            selectedTableId={selectedTableId} // Although we open modal, we can show selection state if needed, or null if modal covers it.
            onSelect={handleSelectTable}
            isLoading={loading}
          />

          {/* Call Restaurant Button - Show when no tables available */}
          {!loading && tables.length > 0 && tables.filter(t => t.isAvailable).length === 0 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShowCallPopup(true)}
                className="group flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{tCall('buttonText')}</span>
              </button>
            </div>
          )}
        </div>

        <BookingModal
          isOpen={!!selectedTable}
          onClose={() => setSelectedTableId(null)}
          onConfirm={handleBooking}
          tableData={selectedTable}
          date={date}
          time={time}
        />

        {/* Call Restaurant Popup */ }
  <CallRestaurantPopup
    isOpen={showCallPopup}
    onClose={() => setShowCallPopup(false)}
  />
      </main >
    </div >
  );
}

export default function ReservationPage() {
  return (
    <SignalRProvider>
      <ReservationContent />
    </SignalRProvider>
  );
}
