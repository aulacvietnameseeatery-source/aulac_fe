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
  const tZone = useTranslations('Reservation.Zone');
  const tControls = useTranslations('Reservation.Controls');

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

  // Multi-Select State
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedTableIds, setSelectedTableIds] = useState<number[]>([]);

  // Filters
  const [activeZone, setActiveZone] = useState("All");

  const ZONES = ["All", "Indoor", "Outdoor", "Rooftop"];

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
    if (!table || !table.isAvailable) return;

    if (isMultiSelect) {
      // Toggle selection
      setSelectedTableIds(prev => {
        if (prev.includes(id)) {
          return prev.filter(tid => tid !== id);
        } else {
          return [...prev, id];
        }
      });
    } else {
      // Single select behavior
      setSelectedTableId(id);
    }
  };

  // Clear selection when toggling mode
  useEffect(() => {
    setSelectedTableIds([]);
    setSelectedTableId(null);
  }, [isMultiSelect]);

  // Derived selected tables for Modal
  const selectedTablesForModal = isMultiSelect
    ? tables.filter(t => selectedTableIds.includes(t.tableId))
    : (selectedTableId ? tables.filter(t => t.tableId === selectedTableId) : []);

  // Modal open condition
  const isModalOpen = isMultiSelect ? false : !!selectedTableId;
  const [isMultiBookModalOpen, setIsMultiBookModalOpen] = useState(false);

  // Constants for selected state display
  const selectedTable = tables.find(t => t.tableId === selectedTableId) || null;

  // Handle Booking - Direct Reservation (No Lock)
  const handleBooking = async (guestData: { name: string; phone: string; email: string; partySize: number }): Promise<boolean> => {
    const tablesToBook = isMultiSelect ? selectedTableIds : (selectedTableId ? [selectedTableId] : []);

    if (tablesToBook.length === 0) return false;

    const reservedTime = `${date}T${time}:00`;

    try {
      // Create Reservation Directly
      const createRes = await reservationApi.createReservation({
        tableId: tablesToBook[0], // Primary table for fallback
        tableIds: tablesToBook,   // List of tables
        customerName: guestData.name,
        phone: guestData.phone,
        email: guestData.email || undefined, // Send undefined if empty
        partySize: guestData.partySize,
        reservedTime: reservedTime
      });

      if (createRes.success) {
        toast.success(tToast('success'));
        fetchAvailability();
        // Do NOT reset state here, let the modal show success view
        // State will be reset when user closes the modal
        return true;
      } else {
        // Show actual error message from API
        toast.error(createRes.userMessage || tToast('error'));
        return false;
      }

    } catch (error: any) {
      // Try to extract error message from response
      const errorMessage = error?.response?.data?.userMessage
        || error?.response?.data?.message
        || error?.message
        || tToast('error');
      toast.error(errorMessage);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col">
      <main className="grow max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-12 mb-24 relative">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1A3A52] mb-3">
            {t('title')}
          </h2>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-stone-500 font-light text-sm md:text-base">
              {t('subtitle')}
            </p>
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
          isMultiSelect={isMultiSelect}
          onMultiSelectChange={setIsMultiSelect}
        />

        {/* Call Restaurant Button - Show when no tables available */}
        {!loading && tables.length > 0 && tables.filter(t => t.isAvailable).length === 0 && (
          <div className="mt-8 mb-8 p-6 bg-orange-50/50 border border-orange-100 rounded-2xl flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-orange-900 font-semibold text-lg mb-2">
              {tCall('subtitle')}
            </h3>
            <p className="text-orange-800/80 text-sm mb-6 max-w-md">
              {tCall('description')}
            </p>
            <button
              onClick={() => setShowCallPopup(true)}
              className="group flex items-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-600/20 hover:shadow-xl hover:shadow-orange-600/30 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{tCall('buttonText')}</span>
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-row gap-4 mb-6 overflow-x-auto">
          <FilterTabs
            label={tZone('label')}
            options={ZONES}
            value={activeZone}
            onChange={setActiveZone}
          />
        </div>

        <div className="w-full">
          <TableGrid
            tables={tables}
            selectedTableId={isMultiSelect ? null : selectedTableId}
            selectedTableIds={isMultiSelect ? selectedTableIds : undefined}
            onSelect={handleSelectTable}
            isLoading={loading}
          />
        </div>

        {/* Multi-Select Floating Action Button */}
        {isMultiSelect && selectedTableIds.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4">
            <button
              onClick={() => setIsMultiBookModalOpen(true)}
              className="bg-[#1A3A52] text-white px-8 py-3.5 rounded-full shadow-lg hover:bg-[#2d5a7b] transition-all font-bold flex items-center gap-3"
            >
              <span>{tControls('bookSelected', { count: selectedTableIds.length })}</span>
              <div className="bg-white/20 rounded-full p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </button>
          </div>
        )}

        {/* Main Booking Modal (Single or Multi) */}
        <BookingModal
          isOpen={!isMultiSelect ? !!selectedTableId : isMultiBookModalOpen}
          onClose={() => {
            setSelectedTableId(null);
            setIsMultiBookModalOpen(false);
          }}
          onConfirm={handleBooking}
          tables={selectedTablesForModal}
          date={date}
          time={time}
        />

        {/* Call Restaurant Popup */}
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
