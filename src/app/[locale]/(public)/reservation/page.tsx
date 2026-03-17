'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import PublicBookingModal from '@/features/reservation-2/components/public-booking-modal';

export default function ReservationPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const homePath = params?.locale ? `/${params.locale}` : '/';

  return (
    <PublicBookingModal
      isOpen={true}
      onClose={() => router.push(homePath)}
    />
  );
}
