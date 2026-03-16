'use client';

import React, { useState, useEffect } from 'react';
import { User, Phone, StickyNote, ChevronDown, Minus, Plus, Mail, X } from 'lucide-react';
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { reservationApi } from '../index';
import { ReservationResponseDto } from '../types/reservation.types';
import { toast } from 'sonner';
import CallRestaurantPopup from './call-restaurant-popup';
import { useTranslations } from 'next-intl';

interface PublicBookingFormProps {
    onSuccess?: (reservation: ReservationResponseDto) => void;
    onClose?: () => void;
}

type CustomerMode = 'existing' | 'new';

export default function PublicBookingForm({ onSuccess, onClose }: PublicBookingFormProps) {
    const t = useTranslations('Reservation.PublicForm');
    const [mode, setMode] = useState<CustomerMode | null>(null);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [pax, setPax] = useState<number | null>(null);
    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [lookingUpCustomer, setLookingUpCustomer] = useState(false);
    const [checkingFit, setCheckingFit] = useState(false);
    const [canBookOnline, setCanBookOnline] = useState(true);
    const [fitMessage, setFitMessage] = useState<string>('');
    const [showCallPopup, setShowCallPopup] = useState(false);

    const resetBookingSelection = () => {
        setDate('');
        setTime('');
        setPax(null);
        setCanBookOnline(true);
        setFitMessage('');
    };

    const lookupExistingCustomer = async (targetPhone: string) => {
        if (mode !== 'existing') return;
        const normalized = targetPhone.trim();
        if (normalized.length < 8) return;

        setName('');
        setEmail('');
        setLookingUpCustomer(true);
        try {
            const result = await reservationApi.getCustomerByPhone(normalized);
            if (result.success && result.data && result.data.phone) {
                setName(result.data.fullName || '');
                setEmail(result.data.email || '');
            } else {
                toast.error(t('lookup.notFound'));
            }
        } catch {
            toast.error(t('lookup.notFound'));
        } finally {
            setLookingUpCustomer(false);
        }
    };

    useEffect(() => {
        if (!mode) return;
        if (!date || !time || !pax) {
            setCanBookOnline(true);
            setFitMessage('');
            return;
        }

        const runFitCheck = async () => {
            const reservedTime = `${date}T${time}:00`;
            setCheckingFit(true);
            try {
                const result = await reservationApi.fitCheck({
                    partySize: pax,
                    reservedTime,
                });

                if (result.success && result.data) {
                    setCanBookOnline(result.data.canBookOnline);
                    setFitMessage(result.data.message || '');
                }
            } catch {
                setCanBookOnline(true);
            } finally {
                setCheckingFit(false);
            }
        };

        void runFitCheck();
    }, [date, time, pax, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!mode) {
            toast.error(t('validation.selectCustomerType'));
            return;
        }

        if (!phone) {
            toast.error(t('validation.phoneRequired'));
            return;
        }

        if (mode === 'new' && !name) {
            toast.error(t('validation.nameRequired'));
            return;
        }

        if (mode === 'existing' && !name) {
            toast.error(t('validation.existingCustomerNotFound'));
            return;
        }

        if (!date) {
            toast.error(t('validation.dateRequired'));
            return;
        }

        if (!time) {
            toast.error(t('validation.timeRequired'));
            return;
        }

        if (!pax || pax < 1) {
            toast.error(t('validation.partySizeRequired'));
            return;
        }

        setLoading(true);
        try {
            const reservedTime = `${date}T${time}:00`;
            const request = {
                customerName: name,
                phone: phone,
                email: email || undefined,
                partySize: pax,
                reservedTime: reservedTime,
                notes: notes || undefined
            };

            const response = await reservationApi.createReservation(request);

            if (response.success && response.data) {
                toast.success(response.userMessage || t('toast.created'));
                if (onSuccess) onSuccess(response.data);

                setName('');
                setPhone('');
                setEmail('');
                setNotes('');
                setMode(null);
            } else {
                toast.error(response.userMessage || t('toast.createFailed'));
                if (response.userMessage?.toLowerCase().includes("không") && response.userMessage?.toLowerCase().includes("bàn")) {
                    setShowCallPopup(true);
                }
            }
        } catch (error: any) {
            const errorMsg = error?.response?.data?.userMessage || t('toast.unexpected');
            toast.error(errorMsg);
            if (errorMsg.toLowerCase().includes("không") && errorMsg.toLowerCase().includes("bàn")) {
                setShowCallPopup(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
                type="button"
                onClick={() => onClose?.()}
                className="absolute top-3 right-3 z-10 rounded-full bg-stone-100 p-2 text-stone-600 hover:bg-stone-200"
                aria-label={t('closeAriaLabel')}
            >
                <X size={18} />
            </button>
            <div className="p-4 sm:p-5 md:p-6">
                <h1 className="text-xl sm:text-[30px] leading-tight font-display font-bold text-[#1A3A52] mb-4 mr-10 border-l-4 border-amber-500 pl-3 break-words">
                    {t('title')}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    {!mode && (
                        <div className="space-y-4">
                            <h2 className="text-xs font-bold text-amber-600 uppercase tracking-widest leading-relaxed break-words">
                                {t('chooseCustomerType')}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode('existing');
                                        setName('');
                                        setEmail('');
                                    }}
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-4 text-left hover:border-amber-500 transition-all min-h-[110px]"
                                >
                                    <div className="font-bold text-slate-800 leading-snug break-words">{t('existingCustomer')}</div>
                                    <div className="text-sm text-stone-500 leading-snug break-words mt-1">{t('existingCustomerHint')}</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode('new');
                                        setName('');
                                        setEmail('');
                                    }}
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-4 text-left hover:border-amber-500 transition-all min-h-[110px]"
                                >
                                    <div className="font-bold text-slate-800 leading-snug break-words">{t('newCustomer')}</div>
                                    <div className="text-sm text-stone-500 leading-snug break-words mt-1">{t('newCustomerHint')}</div>
                                </button>
                            </div>
                        </div>
                    )}

                    {mode && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            {mode === 'existing' ? t('existingModeNote') : t('newModeNote')}
                        </div>
                    )}

                    {mode && !canBookOnline && (
                        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-center">
                            <div className="font-semibold text-orange-900">{t('noFitTitle')}</div>
                            {fitMessage && <p className="text-sm text-orange-700 mt-1">{fitMessage}</p>}
                            <div className="mt-4 flex flex-col items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCallPopup(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white font-semibold hover:bg-orange-700 w-full sm:w-auto sm:min-w-[180px]"
                                >
                                    <Phone size={16} />
                                    <span>{t('callRestaurant')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={resetBookingSelection}
                                    className="inline-flex items-center justify-center rounded-lg border border-orange-300 bg-white px-4 py-2 text-orange-800 font-semibold hover:bg-orange-100 w-full sm:w-auto sm:min-w-[180px]"
                                >
                                    {t('goBack')}
                                </button>
                            </div>
                        </div>
                    )}

                    {mode && canBookOnline && (
                    <>
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-3 bg-amber-500 rounded-full"></span>
                            {t('yourInfo')}
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors" size={18} />
                                <input
                                    type="tel"
                                    placeholder={t('phone')}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    onBlur={(e) => void lookupExistingCustomer(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                                    required
                                />
                            </div>

                            {mode === 'new' && (
                                <>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder={t('yourName')}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                                            required
                                        />
                                    </div>

                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            placeholder={t('email')}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                                        />
                                    </div>
                                </>
                            )}

                            {mode === 'existing' && (name || email || lookingUpCustomer) && (
                                <>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder={lookingUpCustomer ? t('loadingCustomerName') : t('existingCustomerName')}
                                            value={name}
                                            readOnly
                                            className="w-full bg-stone-100 border border-stone-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 placeholder-stone-400 font-medium"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder={lookingUpCustomer ? t('loadingCustomerEmail') : t('existingCustomerEmail')}
                                            value={email}
                                            readOnly
                                            className="w-full bg-stone-100 border border-stone-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 placeholder-stone-400 font-medium"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 sm:space-y-5">
                        <h2 className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-3 bg-amber-500 rounded-full"></span>
                            {t('bookingInfo')}
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                            <div className="col-span-1 md:col-span-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">
                                    {t('reservationDate')}
                                </label>
                                <div className="relative">
                                    <ALDatePicker
                                        value={date}
                                        onChange={setDate}
                                        minDate={new Date().toISOString().split('T')[0]}
                                        placeholder={t('selectDate')}
                                        inputSize="sm"
                                        groupClassName="!bg-stone-50 !border-stone-200 !rounded-xl !h-[54px]"
                                        className="text-sm sm:text-base font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">
                                    {t('arrivalTime')}
                                </label>
                                <div className="relative group">
                                    <select
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full h-[54px] bg-stone-50 border border-stone-200 rounded-xl px-4 pr-10 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-semibold appearance-none"
                                    >
                                        <option value="" disabled>{t('selectTime')}</option>
                                        {Array.from({ length: 14 }, (_, i) => i + 10).flatMap(h =>
                                            ['00', '30'].map(m => {
                                                const hour = h.toString().padStart(2, '0');
                                                return `${hour}:${m}`;
                                            })
                                        ).map(slot => (
                                            <option key={slot} value={slot}>
                                                {slot}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">
                                    {t('partySize')}
                                </label>
                                <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl py-1 px-1">
                                    <button
                                        type="button"
                                        onClick={() => setPax(Math.max(1, (pax ?? 1) - 1))}
                                        className="p-3 text-stone-500 hover:text-amber-600 transition-colors"
                                    >
                                        <Minus size={16} strokeWidth={3} />
                                    </button>
                                    <div className="flex-1 text-center font-bold text-[#1A3A52] text-lg">
                                        {pax ?? '-'}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setPax((pax ?? 0) + 1)}
                                        className="p-3 text-stone-500 hover:text-amber-600 transition-colors"
                                    >
                                        <Plus size={16} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="relative group pb-1">
                            <StickyNote className="absolute left-4 top-4 text-stone-400 group-focus-within:text-amber-600 transition-colors" size={18} />
                            <textarea
                                placeholder={t('notes')}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium min-h-[88px] sm:min-h-[110px]"
                            />
                        </div>
                    </div>

                    <div className="pt-2 mt-1 border-t border-stone-200/80 bg-white flex flex-col-reverse sm:flex-row sm:items-center gap-3 sm:justify-between">
                        <button
                            type="button"
                            onClick={() => {
                                if (mode) {
                                    setMode(null);
                                    return;
                                }
                                onClose?.();
                            }}
                            className="w-full sm:w-auto text-center sm:text-left text-stone-400 font-bold hover:text-stone-600 transition-colors"
                        >
                            {t('close')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !mode || checkingFit || !date || !time || !pax}
                            className={`
                                relative w-full sm:w-auto px-5 py-2.5 sm:px-7 sm:py-3 text-sm bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-normal leading-tight
                                ${loading || !mode || checkingFit || !date || !time ? 'opacity-70 cursor-not-allowed' : ''}
                            `}
                        >
                            {loading || checkingFit ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>{checkingFit ? t('checkingTables') : t('processing')}</span>
                                </div>
                            ) : (
                                t('submit')
                            )}
                        </button>
                    </div>
                    </>
                    )}
                </form>
            </div>

            <CallRestaurantPopup
                isOpen={showCallPopup}
                onClose={() => {
                    setShowCallPopup(false);
                    resetBookingSelection();
                }}
            />
        </div>
    );
}
