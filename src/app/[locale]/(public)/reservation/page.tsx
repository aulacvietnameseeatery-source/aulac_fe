'use client';

import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import {
  TableGrid,
  ReservationSidebar,
  BookingModal,
  Legend,
  MobileDateTimeSelect,
  MobileBookingSheet,
  reservationApi,
  TableAvailabilityDto,
  CreateReservationLockRequest,
} from '@/features/reservation-2';
import { toast } from "sonner"


export default function ReservationPage() {
  const t = useTranslations('Reservation.Header');
  const tToast = useTranslations('Reservation.Toast');

  // State
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [time, setTime] = useState<string>("19:00"); // HH:mm
  const [tables, setTables] = useState<TableAvailabilityDto[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Booking State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentLock, setCurrentLock] = useState<{ lockToken: string; tableCode: string; tableId: number } | null>(null);
  const [guestInfo, setGuestInfo] = useState<{ name: string; phone: string; email: string; partySize: number } | null>(null);

  // Fetch Availability
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        // Construct ISO DateTime for BE
        // date = "2023-10-27", time = "19:00" -> "2023-10-27T19:00:00"
        const reservedTime = `${date}T${time}:00`;
        const res = await reservationApi.getAvailability({ reservedTime });
        if (res.success && res.data) {
          setTables(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch tables", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [date, time]);

  // Handle Selection
  const handleSelectTable = (id: number) => {
    // Determine if table is available
    const table = tables.find(t => t.tableId === id);
    if (table && table.isAvailable) {
      setSelectedTableId(prev => prev === id ? null : id);
    }
  };

  const selectedTable = tables.find(t => t.tableId === selectedTableId) || null;

  // Handle Book Click (Lock)
  const handleBook = async (info: { name: string; phone: string; email: string; partySize: number }) => {
    if (!selectedTableId) return;

    // Changes: Check if we already hold a lock for this table
    if (currentLock && currentLock.tableId === selectedTableId) {
      setGuestInfo(info);
      setIsBookingModalOpen(true);
      return;
    }

    try {
      const reservedTime = `${date}T${time}:00`;
      const req: CreateReservationLockRequest = {
        tableId: selectedTableId,
        customerName: info.name,
        phone: info.phone,
        partySize: info.partySize,
        reservedTime: reservedTime,
      };

      const res = await reservationApi.lockTable(req);
      if (res.success && res.data) {
        setCurrentLock({
          lockToken: res.data.lockToken,
          tableCode: res.data.tableCode,
          tableId: selectedTableId // Save tableId
        });
        setGuestInfo(info);
        setIsBookingModalOpen(true);
        toast.success(tToast('lockSuccess'));
      } else {
        toast.error(res.userMessage || tToast('lockError'));
        setCurrentLock(null); // Clear invalid lock state if any
      }
    } catch (error: any) {
      toast.error(tToast('lockError'));
      setCurrentLock(null);
    }
  };

  // Handle Confirm (Create Reservation)
  const handleConfirmBooking = async () => {
    if (!currentLock || !selectedTableId || !guestInfo) return;

    try {
      const reservedTime = `${date}T${time}:00`;
      const res = await reservationApi.createReservation({
        lockToken: currentLock.lockToken,
        tableId: selectedTableId,
        customerName: guestInfo.name,
        phone: guestInfo.phone,
        email: guestInfo.email,
        partySize: guestInfo.partySize,
        reservedTime: reservedTime
      });

      if (res.success) {
        toast.success(tToast('success'));
        setIsBookingModalOpen(false);
        setSelectedTableId(null);
        setCurrentLock(null); // Clear lock after success
        // Refresh tables to show new status
        // Trigger re-fetch logic
        const availabilityRes = await reservationApi.getAvailability({ reservedTime });
        if (availabilityRes.success && availabilityRes.data) {
          setTables(availabilityRes.data);
        }
      } else {
        toast.error(res.userMessage || tToast('error'));
        // If confirmation fails (e.g. lock expired), clear lock so user can try again (re-lock)
        setCurrentLock(null);
      }
    } catch (error: any) {
      toast.error(tToast('error'));
      setCurrentLock(null);
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
            <Legend />
          </div>
        </div>

        {/* Content */}
        <MobileDateTimeSelect
          date={date}
          time={time}
          onDateTimeChange={(d, t) => {
            setDate(d);
            setTime(t);
          }}
        />

        <div className="flex flex-col lg:flex-row gap-8 lg:items-start items-stretch">
          <div className="w-full lg:flex-1">
            <TableGrid
              tables={tables}
              selectedTableId={selectedTableId}
              onSelect={handleSelectTable}
              isLoading={loading}
            />
          </div>

          <div className="hidden lg:block relative w-96 shrink-0">
            <ReservationSidebar
              selectedTable={selectedTable}
              date={date}
              time={time}
              onDateTimeChange={(d, t) => {
                setDate(d);
                setTime(t);
              }}
              onBook={handleBook}
            />
          </div>
        </div>

        <MobileBookingSheet
          selectedTable={selectedTable}
          onBook={handleBook}
          isOpen={!!selectedTable}
          onClose={() => setSelectedTableId(null)}
        />

        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onConfirm={handleConfirmBooking}
          tableData={
            selectedTable
              ? {
                ...selectedTable,
                reservedTime: isBookingModalOpen ? `${date}T${time}:00` : undefined,
              }
              : null
          }
          guestInfo={guestInfo || undefined}
        />
      </main>
    </div>
  );
}
