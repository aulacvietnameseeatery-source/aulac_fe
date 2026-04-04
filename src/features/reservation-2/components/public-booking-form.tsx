'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { User, Phone, StickyNote, Mail, X, Minus, Plus, Clock, Calendar } from 'lucide-react';
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { ALCombobox } from '@/components/ui/al-combobox';
import { reservationApi } from '../index';
import { ReservationResponseDto } from '../types/reservation.types';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useStoreSettings } from '@/hooks/use-store-settings';
import {
    zurichToUtcISO,
    getZurichTodayStr,
    getZurichCurrentMinutes,
    isZurichTimePast,
    ZURICH_TZ,
} from '../utils/zurich-time';

interface PublicBookingFormProps {
    onSuccess?: (reservation: ReservationResponseDto) => void;
    onClose?: () => void;
}

type CustomerMode = 'existing' | 'new';

export default function PublicBookingForm({ onSuccess, onClose }: PublicBookingFormProps) {
    const t = useTranslations('reservations.public.publicForm');
    const [mode, setMode] = useState<CustomerMode | null>(null);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [customerId, setCustomerId] = useState<number | undefined>(undefined);
    const [pax, setPax] = useState<number | null>(null);
    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [lookingUpCustomer, setLookingUpCustomer] = useState(false);
    const [checkingFit, setCheckingFit] = useState(false);
    const [canBookOnline, setCanBookOnline] = useState(true);
    const [fitMessage, setFitMessage] = useState<string>('');
    const submitLockRef = useRef(false);
    const [timeError, setTimeError] = useState<string | null>(null);
    const { data: storeSettings } = useStoreSettings();
    const phoneNumber = storeSettings?.phone || "+84 28 3822 5264";
    const callHref = `tel:${phoneNumber.replace(/\s+/g, '')}`;

    const mapApiErrorKey = (code?: number, subCode?: number) => {
        if (code === 404) return 'toast.notFound';
        if (code === 409) return 'toast.conflict';
        if (code === 400) return 'toast.invalidRequest';
        if (code === 500) return 'toast.serverError';
        if (subCode && subCode > 0) return 'toast.createFailed';
        return 'toast.unexpected';
    };

    const allSlots = useMemo(() => {
        const slots: string[] = [];
        // Lunch: 11:30 - 14:30
        for (let h = 11; h <= 14; h++) {
            for (let m = 0; m < 60; m += 30) {
                if (h === 11 && m < 30) continue;
                if (h === 14 && m > 30) break;
                slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
            }
        }
        // Dinner: 18:30 - 22:30
        for (let h = 18; h <= 22; h++) {
            for (let m = 0; m < 60; m += 30) {
                if (h === 18 && m < 30) continue;
                if (h === 22 && m > 30) break;
                slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
            }
        }
        return slots;
    }, []);

    // Refresh available slots every 60s to disable past slots in Zurich TZ
    const [slotTick, setSlotTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setSlotTick(t => t + 1), 60_000);
        return () => clearInterval(interval);
    }, []);

    const timeOptions = useMemo(() => {
        const zurichToday = getZurichTodayStr();
        const isToday = date === zurichToday;

        if (!isToday || !date) {
            return allSlots.map(s => ({ value: s, label: s, disabled: false }));
        }

        const currentMinutes = getZurichCurrentMinutes();
        const BUFFER_MINUTES = 30; // cannot book less than 30 min ahead
        return allSlots.map(slot => {
            const [h, m] = slot.split(':').map(Number);
            const slotMinutes = h * 60 + m;
            const disabled = slotMinutes <= currentMinutes + BUFFER_MINUTES;
            return {
                value: slot,
                label: slot,
                disabled,
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date, allSlots, slotTick]);


    const lookupExistingCustomer = async (targetPhone: string) => {
        if (mode !== 'existing') return;
        const normalized = targetPhone.trim();
        if (normalized.length < 8) return;

        setName('');
        setEmail('');
        setCustomerId(undefined);
        setLookingUpCustomer(true);
        try {
            const result = await reservationApi.getCustomerByPhone(normalized);
            if (result.success && result.data && result.data.phone) {
                setName(result.data.fullName || '');
                setEmail(result.data.email || '');
                setCustomerId(result.data.customerId);
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
            const reservedTime = zurichToUtcISO(date, time);
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

    useEffect(() => {
        if (!date || !time) {
            setTimeError(null);
            return;
        }
        if (isZurichTimePast(date, time, 15)) {
            setTimeError(t('validation.timePast'));
        } else {
            setTimeError(null);
        }
    }, [date, time, t, slotTick]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent double submit via ref lock
        if (submitLockRef.current) return;

        if (!mode) {
            toast.error(t('validation.selectCustomerType'));
            return;
        }

        if (timeError) {
            toast.error(timeError);
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

        // Final Zurich time-past guard before submit
        if (isZurichTimePast(date, time, 15)) {
            toast.error(t('validation.timePast'));
            return;
        }

        submitLockRef.current = true;
        setLoading(true);
        try {
            const reservedTime = zurichToUtcISO(date, time);
            const request = {
                customerId: customerId,
                customerName: name,
                phone: phone,
                email: email || undefined,
                partySize: pax,
                reservedTime: reservedTime,
                notes: notes || undefined
            };

            const response = await reservationApi.createReservation(request);

            if (response.success && response.data) {
                toast.success(t('toast.created'));
                if (onSuccess) onSuccess(response.data);

                setName('');
                setPhone('');
                setEmail('');
                setCustomerId(undefined);
                setNotes('');
                setMode(null);
            } else {
                toast.error(t(mapApiErrorKey(response.code, response.subCode)));
            }
        } catch (error: any) {
            const errorCode = error?.response?.data?.code as number | undefined;
            const errorSubCode = error?.response?.data?.subCode as number | undefined;
            const errorMsg = t(mapApiErrorKey(errorCode, errorSubCode));
            toast.error(errorMsg);
        } finally {
            setLoading(false);
            submitLockRef.current = false;
        }
    };

    const handleCallRestaurant = () => {
        window.location.href = callHref;
    };

    return (
        <div className="relative max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Full-form overlay while submitting — blocks all interaction */}
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-3xl">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                        <span className="text-sm font-semibold text-stone-600">{t('processing')}</span>
                    </div>
                </div>
            )}
            <button
                type="button"
                onClick={() => onClose?.()}
                className="absolute top-3 right-3 z-10 rounded-full bg-stone-100 p-2 text-stone-600 hover:bg-stone-200"
                aria-label={t('closeAriaLabel')}
            >
                <X size={18} />
            </button>
            <div className="p-6 sm:p-8 lg:p-10">
                <h1 className="text-2xl sm:text-[32px] lg:text-[36px] leading-tight font-display font-bold text-[#1A3A52] mb-6 mr-10 border-l-4 border-amber-500 pl-4 break-words">
                    {t('title')}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
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
                                        setCustomerId(undefined);
                                    }}
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-6 py-5 text-left hover:border-amber-500 transition-all min-h-[130px]"
                                >
                                    <div className="font-bold text-slate-800 text-lg leading-snug break-words">{t('existingCustomer')}</div>
                                    <div className="text-sm text-stone-500 leading-snug break-words mt-2">{t('existingCustomerHint')}</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode('new');
                                        setName('');
                                        setEmail('');
                                        setCustomerId(undefined);
                                    }}
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-6 py-5 text-left hover:border-amber-500 transition-all min-h-[130px]"
                                >
                                    <div className="font-bold text-slate-800 text-lg leading-snug break-words">{t('newCustomer')}</div>
                                    <div className="text-sm text-stone-500 leading-snug break-words mt-2">{t('newCustomerHint')}</div>
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
                        </div>
                    )}

                    {mode && (
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
                                <p className="text-[11px] text-stone-400 -mt-2">
                                    🕐 {t('timezoneNote', { tz: 'Europe/Zurich' })}
                                </p>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                    <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2 truncate">
                                            {t('reservationDate')}
                                        </label>
                                        <div className="relative">
                                            <ALDatePicker
                                                value={date}
                                                onChange={setDate}
                                                minDate={getZurichTodayStr()}
                                                placeholder={t('selectDate')}
                                                displayFormat="dd/MM/yyyy"
                                                inputSize="sm"
                                                groupClassName="!bg-stone-50 !border-stone-200 !rounded-xl !h-[54px]"
                                                className="text-sm sm:text-base font-semibold"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-1 lg:col-span-1">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2 truncate">
                                            {t('arrivalTime')}
                                        </label>
                                        <div className="relative group">
                                            <ALCombobox
                                                options={timeOptions}
                                                value={time}
                                                onChange={(val) => setTime(val as string)}
                                                placeholder={t('selectTime')}
                                                iconStart={<Clock size={16} className="text-stone-400" />}
                                                className="!h-[54px] !rounded-xl !bg-stone-50 !border-stone-200 font-semibold text-sm sm:text-base"
                                            />
                                            {timeError && (
                                                <div className="mt-1.5 flex items-center gap-1 text-red-500 text-[10px] font-bold animate-pulse">
                                                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                                    {timeError}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-span-1 lg:col-span-1">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2 truncate">
                                            {t('partySize')}
                                        </label>
                                        <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl py-1 px-1 h-[54px]">
                                            <button
                                                type="button"
                                                onClick={() => setPax(Math.max(1, (pax ?? 1) - 1))}
                                                className="p-2 text-stone-500 hover:text-amber-600 transition-colors shrink-0"
                                            >
                                                <Minus size={16} strokeWidth={3} />
                                            </button>
                                            <input
                                                type="number"
                                                min={1}
                                                max={100}
                                                value={pax ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? null : parseInt(e.target.value);
                                                    setPax(val);
                                                }}
                                                className="w-full bg-transparent text-center font-bold text-[#1A3A52] text-lg focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                placeholder="-"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setPax((pax ?? 0) + 1)}
                                                className="p-2 text-stone-500 hover:text-amber-600 transition-colors shrink-0"
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
                                    className="w-full sm:w-auto text-center sm:text-left text-stone-400 font-bold hover:text-stone-600 transition-colors py-2"
                                >
                                    {t('close')}
                                </button>
                                <button
                                    type={canBookOnline ? "submit" : "button"}
                                    onClick={!canBookOnline ? handleCallRestaurant : undefined}
                                    disabled={loading || !mode || checkingFit || !date || !time || !pax || !!timeError}
                                    className={`
                                        relative w-full sm:min-w-[180px] px-5 py-2.5 sm:px-7 sm:py-3 text-sm bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap overflow-hidden
                                        ${loading || !mode || checkingFit || !date || !time || !pax ? 'opacity-70 cursor-not-allowed' : ''}
                                    `}
                                >
                                    <div className="flex items-center justify-center gap-2 min-h-[20px]">
                                        {loading || checkingFit ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>{checkingFit ? t('checkingTables') : t('processing')}</span>
                                            </>
                                        ) : (
                                            <span>{canBookOnline ? t('submit') : t('callRestaurant')}</span>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
