"use client";

import React, { useRef, useState } from 'react';
import { Calendar, Clock, Download, MapPin, User, Users, X } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { useTranslations } from 'next-intl';
import PublicBookingForm from './public-booking-form';
import { ReservationResponseDto } from '../types/reservation.types';
import { formatZurichDate, formatZurichTime } from '../utils/zurich-time';

interface PublicBookingModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function PublicBookingModal({ isOpen, onClose }: PublicBookingModalProps) {
	const t = useTranslations('reservations.public.publicTicket');
	const [ticketData, setTicketData] = useState<ReservationResponseDto | null>(null);
	const ticketRef = useRef<HTMLDivElement>(null);
	const downloadRef = useRef<HTMLDivElement>(null);

	const handleCloseAll = () => {
		setTicketData(null);
		onClose();
	};

	const handleDownloadTicket = async () => {
		// Capture from the hidden Master Ticket for consistency
		if (!downloadRef.current || !ticketData) return;

		try {
			const dataUrl = await htmlToImage.toPng(downloadRef.current, {
				quality: 1,
				cacheBust: true,
				backgroundColor: '#ffffff',
				pixelRatio: 2,
			});

			const link = document.createElement('a');
			link.download = `reservation-${ticketData.reservationId}.png`;
			link.href = dataUrl;
			link.click();
		} catch (error) {
			console.error('Error generating ticket:', error);
		}
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
					<div className="relative max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 sm:p-6 pb-8">
						<button
							type="button"
							onClick={handleCloseAll}
							className="absolute top-3 right-3 z-20 rounded-full bg-stone-100 p-2 text-stone-600 hover:bg-stone-200"
							aria-label={t('closeAriaLabel')}
						>
							<X size={18} />
						</button>
						{/* Visible Ticket (Responsive) */}
						<div
							ref={ticketRef}
							className="rounded-2xl border border-stone-200 p-6 mt-8 w-full max-w-sm mx-auto"
							style={{ backgroundColor: '#FFF9E6' }}
						>
							<div className="text-center border-b border-dashed border-stone-300 pb-4 mb-6">
								<div className="text-[10px] uppercase tracking-[0.2em] font-medium mb-1" style={{ color: '#78716C' }}>
									{t('title')}
								</div>
								<div className="text-3xl font-bold" style={{ color: '#1A3A52' }}>
									#{ticketData.reservationId}
								</div>
							</div>

							<div className="space-y-4 text-sm" style={{ color: '#1A3A52' }}>
								<div className="flex items-center justify-between gap-6">
									<span className="inline-flex items-center gap-2 font-medium shrink-0" style={{ color: '#78716C' }}>
										<User size={16} color="#78716C" />
										{t('customer')}
									</span>
									<span className="font-semibold text-right truncate pl-4">{ticketData.customerName}</span>
								</div>
								<div className="flex items-center justify-between gap-6">
									<span className="inline-flex items-center gap-2 font-medium shrink-0" style={{ color: '#78716C' }}>
										<Users size={16} color="#78716C" />
										{t('guests')}
									</span>
									<span className="font-semibold text-right">{ticketData.partySize}</span>
								</div>
								<div className="flex items-center justify-between gap-6">
									<span className="inline-flex items-center gap-2 font-medium shrink-0" style={{ color: '#78716C' }}>
										<Calendar size={16} color="#78716C" />
										{t('date')}
									</span>
									<span className="font-semibold text-right">{formatZurichDate(ticketData.reservedTime)}</span>
								</div>
								<div className="flex items-center justify-between gap-6">
									<span className="inline-flex items-center gap-2 font-medium shrink-0" style={{ color: '#78716C' }}>
										<Clock size={16} color="#78716C" />
										{t('time')}
									</span>
									<span className="font-semibold text-right">{formatZurichTime(ticketData.reservedTime)}</span>
								</div>
								<div className="flex items-center justify-between gap-6">
									<span className="inline-flex items-center gap-2 font-medium shrink-0" style={{ color: '#78716C' }}>
										<MapPin size={16} color="#78716C" />
										{t('table')}
									</span>
									<span className="font-bold text-right px-2 py-0.5 border border-stone-800">{ticketData.tableCode || t('pendingAssign')}</span>
								</div>
								{ticketData.zone && (
									<div className="flex items-center justify-between gap-6">
										<span className="font-medium shrink-0 pl-6" style={{ color: '#78716C' }}>
											{t('zone')}
										</span>
										<span className="font-semibold text-right">{ticketData.zone}</span>
									</div>
								)}
							</div>

							<div className="border-t border-dashed border-stone-300 mt-6 pt-4 text-center">
								<p className="text-[10px] font-bold tracking-widest text-stone-500">THANK YOU & SEE YOU SOON!</p>
							</div>
						</div>

						{/* Hidden Master Ticket (Fixed Width for perfect download) */}
						<div className="fixed -left-[9999px] top-0 pointer-events-none">
							<div
								ref={downloadRef}
								className="rounded-2xl border border-stone-200 p-8"
								style={{ 
									backgroundColor: '#FFF9E6', 
									width: '400px',
								}}
							>
								<div className="text-center border-b border-dashed border-stone-300 pb-4 mb-6">
									<div className="text-[10px] uppercase tracking-[0.2em] font-medium mb-1" style={{ color: '#78716C' }}>
										{t('title')}
									</div>
									<div className="text-3xl font-bold" style={{ color: '#1A3A52' }}>
										#{ticketData.reservationId}
									</div>
								</div>

								<div className="space-y-4 text-sm" style={{ color: '#1A3A52' }}>
									<div className="flex items-center justify-between gap-6">
										<span className="inline-flex items-center gap-2 font-medium shrink-0" style={{ color: '#78716C' }}>
											<User size={16} color="#78716C" />
											{t('customer')}
										</span>
										<span className="font-semibold text-right truncate pl-4">{ticketData.customerName}</span>
									</div>
									<div className="flex items-center justify-between gap-6">
										<span className="inline-flex items-center gap-2 font-medium shrink-0" style={{ color: '#78716C' }}>
											<Users size={16} color="#78716C" />
											{t('guests')}
										</span>
										<span className="font-semibold text-right">{ticketData.partySize}</span>
									</div>
									<div className="flex items-center justify-between gap-6">
										<span className="inline-flex items-center gap-2 font-medium shrink-0" style={{ color: '#78716C' }}>
											<Calendar size={16} color="#78716C" />
											{t('date')}
										</span>
										<span className="font-semibold text-right">{formatZurichDate(ticketData.reservedTime)}</span>
									</div>
									<div className="flex items-center justify-between gap-6">
										<span className="inline-flex items-center gap-2 font-medium shrink-0" style={{ color: '#78716C' }}>
											<Clock size={16} color="#78716C" />
											{t('time')}
										</span>
										<span className="font-semibold text-right">{formatZurichTime(ticketData.reservedTime)}</span>
									</div>
									<div className="flex items-center justify-between gap-6">
										<span className="inline-flex items-center gap-2 font-medium shrink-0" style={{ color: '#78716C' }}>
											<MapPin size={16} color="#78716C" />
											{t('table')}
										</span>
										<span className="font-bold text-right px-2 py-0.5 border border-stone-800">{ticketData.tableCode || t('pendingAssign')}</span>
									</div>
								</div>

								<div className="border-t border-dashed border-stone-300 mt-8 pt-4 text-center">
									<p className="text-[10px] font-bold tracking-widest text-stone-500">THANK YOU & SEE YOU SOON!</p>
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
