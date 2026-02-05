import { useState } from 'react';
import { GuestInfo } from '../types/reservation.types';

export const useReservation = () => {
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState('07:30 PM');
  const [guestInfo, setGuestInfo] = useState<GuestInfo | undefined>();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return {
    date,
    time,
    guestInfo,
    isBookingModalOpen,

    setDateTime: (d: string, t: string) => {
      setDate(d);
      setTime(t);
    },

    openBooking: (info: GuestInfo) => {
      setGuestInfo(info);
      setIsBookingModalOpen(true);
    },

    closeBooking: () => setIsBookingModalOpen(false),
    resetGuest: () => setGuestInfo(undefined),
  };
};
