"use client";

import React, { useRef, useState } from 'react';
import { Calendar, Clock, Download, MapPin, User, Users, X } from 'lucide-react';
import domtoimage from 'dom-to-image-more';
import { useTranslations } from 'next-intl';
import PublicBookingForm from './public-booking-form';
import { ReservationResponseDto } from '../types/reservation.types';

interface PublicBookingModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function PublicBookingModal({ isOpen, onClose }: PublicBookingModalProps) {
	const t = useTranslations('reservations.public.publicTicket');
	const [ticketData, setTicketData] = useState<ReservationResponseDto | null>(null);
	const ticketRef = useRef<HTMLDivElement>(null);

	const handleCloseAll = () => {
		setTicketData(null);
		onClose();
	};

	const handleDownloadTicket = async () => {
		if (!ticketRef.current || !ticketData) return;

		const dataUrl = await domtoimage.toPng(ticketRef.current, {
			quality: 1,
			bgcolor: '#ffffff',
		});

		const link = document.createElement('a');
		link.download = `reservation-${ticketData.reservationId}.png`;
		link.href = dataUrl;
		link.click();
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-[200] bg-black/55 backdrop-blur-sm flex items-start lg:items-center justify-center p-3 sm:p-4 pt-20 sm:pt-24 lg:pt-6"
			onClick={(e) => {
				if (e.target === e.currentTarget) handleCloseAll();
			}}
		>
			<div className="relative w-full max-w-md sm:max-w-xl lg:max-w-2xl max-h-[calc(100dvh-5.5rem)] sm:max-h-[calc(100dvh-7rem)] lg:max-h-[92vh] overflow-auto no-scrollbar">
				{ticketData ? (
					<div className="relative max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 sm:p-6">
						<button
							type="button"
							onClick={handleCloseAll}
							className="absolute top-3 right-3 z-20 rounded-full bg-stone-100 p-2 text-stone-600 hover:bg-stone-200"
							aria-label={t('closeAriaLabel')}
						>
							<X size={18} />
						</button>
						<div
							ref={ticketRef}
							className="rounded-2xl border border-stone-200 bg-gradient-to-b from-amber-50 to-white p-4 mt-8"
						>
							<div className="text-center border-b border-dashed border-stone-300 pb-3 mb-3">
								<div className="text-xs uppercase tracking-wider text-stone-500 break-words">{t('title')}</div>
								<div className="text-lg font-bold text-[#1A3A52]">#{ticketData.reservationId}</div>
							</div>

							<div className="space-y-2 text-sm text-[#1A3A52]">
								<div className="flex items-start justify-between gap-3">
									<span className="inline-flex items-center gap-2 text-stone-500 min-w-0 break-words"><User size={14} />{t('customer')}</span>
									<span className="font-semibold text-right max-w-[60%] break-words">{ticketData.customerName}</span>
								</div>
								<div className="flex items-start justify-between gap-3">
									<span className="inline-flex items-center gap-2 text-stone-500 min-w-0 break-words"><Users size={14} />{t('guests')}</span>
									<span className="font-semibold text-right max-w-[60%] break-words">{ticketData.partySize}</span>
								</div>
								<div className="flex items-start justify-between gap-3">
									<span className="inline-flex items-center gap-2 text-stone-500 min-w-0 break-words"><Calendar size={14} />{t('date')}</span>
									<span className="font-semibold text-right max-w-[60%] break-words">{new Date(ticketData.reservedTime).toLocaleDateString()}</span>
								</div>
								<div className="flex items-start justify-between gap-3">
									<span className="inline-flex items-center gap-2 text-stone-500 min-w-0 break-words"><Clock size={14} />{t('time')}</span>
									<span className="font-semibold text-right max-w-[60%] break-words">{new Date(ticketData.reservedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
								</div>
								<div className="flex items-start justify-between gap-3">
									<span className="inline-flex items-center gap-2 text-stone-500 min-w-0 break-words"><MapPin size={14} />{t('table')}</span>
									<span className="font-bold text-right max-w-[60%] break-words">{ticketData.tableCode || t('pendingAssign')}</span>
								</div>
								<div className="flex items-start justify-between gap-3">
									<span className="text-stone-500 min-w-0 break-words">{t('zone')}</span>
									<span className="font-semibold text-right max-w-[60%] break-words">{ticketData.zone || '-'}</span>
								</div>
							</div>
						</div>

						<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
							<button
								type="button"
								onClick={handleDownloadTicket}
								className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-white font-semibold hover:bg-amber-600 break-words text-center"
							>
								<Download size={16} />
								{t('downloadTicket')}
							</button>
							<button
								type="button"
								onClick={handleCloseAll}
								className="rounded-xl border border-stone-300 px-4 py-3 text-stone-700 font-semibold hover:bg-stone-50 break-words"
							>
								{t('close')}
							</button>
						</div>
					</div>
				) : (
					<PublicBookingForm onClose={handleCloseAll} onSuccess={setTicketData} />
				)}
			</div>
		</div>
	);
}
