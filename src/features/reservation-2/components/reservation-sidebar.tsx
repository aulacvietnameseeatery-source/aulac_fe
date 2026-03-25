import React, { useState, useEffect, useMemo, useRef } from "react";
import {
    Calendar,
    Armchair,
    Check,
    X,
    Clock,
    User,
    Phone,
    Mail,
    ChevronDown,
    ChevronUp, Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { ALCombobox } from "@/components/ui/al-combobox";
import "../styles/index.css";
import { TableAvailabilityDto } from "../types/reservation.types";

interface ReservationSidebarProps {
    selectedTable: TableAvailabilityDto | null;
    date: string;
    time: string;
    onDateTimeChange: (newDate: string, newTime: string) => void;
    onBook: (guestInfo: {
        name: string;
        phone: string;
        email: string;
        partySize: number;
    }) => void;
}

// Helper: Convert the time format for a better display
const formatTimeDisplay = (time24: string) => {
    const [hour, min] = time24.split(":");
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${min} ${ampm}`;
};

// Helper: Convert it back to input
const convertTo24Hour = (timeStr: string) => {
    const [time, modifier] = timeStr.split(" ");
    if (!modifier) return timeStr;
    // eslint-disable-next-line prefer-const
    let [hours, minutes] = time.split(":");
    if (hours === "12") {
        hours = "00";
    }
    if (modifier === "PM") {
        hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours}:${minutes}`;
};

// Helper: Generate Time Slots (e.g., 11:00, 11:30, 12:00...)
const generateTimeSlots = () => {
    const slots = [];
    // Lunch: 11:30 - 14:30
    for (let h = 11; h <= 14; h++) {
        for (let m = 0; m < 60; m += 30) {
            if (h === 11 && m < 30) continue;
            if (h === 14 && m > 30) break;
            slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
        }
    }
    // Dinner: 18:30 - 22:30
    for (let h = 18; h <= 22; h++) {
        for (let m = 0; m < 60; m += 30) {
            if (h === 18 && m < 30) continue;
            if (h === 22 && m > 30) break;
            slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
        }
    }
    return slots;
};

export default function ReservationSidebar({
    selectedTable,
    date,
    time,
    onDateTimeChange,
    onBook,
}: ReservationSidebarProps) {
    const t = useTranslations("reservations.public.sidebar");
    const [isEditing, setIsEditing] = useState(false);

    // Temp State
    const [tempDate, setTempDate] = useState(date);
    const [tempTime, setTempTime] = useState(convertTo24Hour(time));

    // User details
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    // Default party size to 2 if not selected, or selected table capacity?
    // Let's assume user picks a table, so party size <= capacity logic might be handled by BE or validation
    // Ideally, user filters by party size first. But for now, let's just let them type it or defaulted?
    // The existing sidebar didn't have party size input, it just used table capacity?
    // BE requires PartySize in CreateReservationLockRequest.
    // We can add a simple input or default to table capacity.
    // Let's add an input for Party Size, defaulting to selectedTable capacity or 2.
    const [partySize, setPartySize] = useState(2);
    const [timeError, setTimeError] = useState<string | null>(null);

    useEffect(() => {
        if (selectedTable) {
            setPartySize(selectedTable.capacity);
        }
    }, [selectedTable]);

    const isFormValid = phone.trim().length > 0 && name.trim().length > 0;

    const timeOptions = useMemo(() => {
        return generateTimeSlots().map(slot => ({
            value: slot,
            label: slot
        }));
    }, []);


    useEffect(() => {
        setTempDate(date);
        setTempTime(convertTo24Hour(time));
    }, [date, time]);


    const handleSave = () => {
        const now = new Date();
        const selected = new Date(`${tempDate}T${tempTime}`);
        if (selected.getTime() < now.getTime()) {
            setTimeError(t("validation.timePast"));
            return;
        }
        setTimeError(null);
        const formattedTime = formatTimeDisplay(tempTime);
        onDateTimeChange(tempDate, formattedTime);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempDate(date);
        setTempTime(convertTo24Hour(time));
        setTimeError(null);
        setIsEditing(false);
    };

    const handleSelectTime = (slot: string) => {
        setTempTime(slot);
    };

    const handleBookClick = () => {
        if (isFormValid && selectedTable) {
            onBook({ name, phone, email, partySize });
        }
    };

    const displayDate = new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100 sticky top-6 transition-all duration-300 hover:shadow-2xl">
            {/* Header */}
            <div className="bg-[#1A3A52] p-5 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="sidebar-header-title">{t("header.title")}</h3>
                    <p className="sidebar-header-subtitle">{t("header.subtitle")}</p>
                </div>
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
            </div>

            <div className="w-full lg:w-[320px] shrink-0">
                {/* === DATE & TIME SECTION === */}
                <div
                    className={`sidebar-datetime-section ${isEditing ? "sidebar-datetime-section-editing" : ""
                        }`}
                >
                    <div className="sidebar-datetime-header">
                        <div className="sidebar-datetime-icon-box">
                            <Calendar size={14} />
                        </div>
                        <span className="sidebar-datetime-label-wrapper">
                            {t("datetime.label")}
                        </span>

                        <div className="sidebar-datetime-actions">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className="sidebar-datetime-cancel-button"
                                        data-tooltip-content="Cancel"
                                        data-tooltip-id="my-tooltip"
                                    >
                                        <X size={16} />
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="sidebar-datetime-save-button"
                                    >
                                        <span>{t("datetime.save")}</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="sidebar-datetime-edit-button"
                                >
                                    <span>{t("datetime.edit")}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="sidebar-datetime-content">
                        {isEditing ? (
                            <div className="sidebar-date-time-input-container fade-in zoom-in animate-in">
                                <div className="sidebar-date-label-wrapper">
                                    <label className="sidebar-date-label">
                                        {t("datetime.selectDate")}
                                    </label>
                                    <ALDatePicker
                                        value={tempDate}
                                        onChange={(val) => setTempDate(val)}
                                        placeholder={t("datetime.selectDate")}
                                        displayFormat="dd/MM/yyyy"
                                        groupClassName="sidebar-date-input-override"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase flex justify-between">
                                        {t("datetime.selectTime")}
                                        <span className="text-[9px] normal-case text-stone-400">
                                            {t("datetime.openingHours")}
                                        </span>
                                    </label>
                                    <ALCombobox
                                        options={timeOptions}
                                        value={tempTime}
                                        onChange={(val) => handleSelectTime(val as string)}
                                        placeholder={t("datetime.selectTime")}
                                        iconStart={<Clock size={16} className="text-stone-400" />}
                                        className="!h-[40px] !rounded-lg !bg-white !border-stone-300 font-bold text-[#1A3A52]"
                                    />
                                    {timeError && (
                                        <p className="text-[10px] text-red-500 font-bold mt-1 animate-pulse">
                                            {timeError}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="sidebar-datetime-content-display fade-in animate-in slide-in-from-left-2">
                                <div className="sidebar-datetime-value flex flex-wrap items-center gap-x-2">
                                    <p className="sidebar-datetime-date">
                                        {displayDate === "Invalid Date" ? date : displayDate}
                                    </p>
                                    <p className="sidebar-datetime-time">{time}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* === SELECTED TABLE === */}
                <div className="sidebar-table-section">
                    <div className="sidebar-table-icon-box">
                        <Armchair size={18} />
                    </div>
                    <div className="sidebar-table-content">
                        <span className="sidebar-table-label">{t("table.label")}</span>
                        {selectedTable ? (
                            <div className="sidebar-table-selected-display fade-in animate-in slide-in-from-bottom-1">
                                <p className="sidebar-table-name">{selectedTable.tableCode}</p>
                                <p className="sidebar-table-info">
                                    {t("table.zone")} •{" "}
                                    {t("table.guests", { count: selectedTable.capacity })}
                                </p>
                            </div>
                        ) : (
                            <p className="sidebar-table-empty">{t("table.empty")}</p>
                        )}
                    </div>
                </div>

                <hr className="sidebar-form-divider" />

                {/* === GUEST INFORMATION FORM === */}
                <div className="sidebar-guest-form">
                    <span className="sidebar-section-label">{t("guest.label")}</span>

                    <div className="sidebar-input-group group">
                        <User size={16} className="sidebar-input-icon-wrapper" />
                        <input
                            type="text"
                            placeholder={t("guest.name")}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="sidebar-input-field"
                        />
                    </div>

                    <div className="sidebar-input-group group">
                        <Phone size={16} className="sidebar-input-icon-wrapper" />
                        <input
                            type="tel"
                            placeholder={t("guest.phone")}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="sidebar-input-field"
                        />
                    </div>

                    <div className="sidebar-input-group group">
                        <Mail size={16} className="sidebar-input-icon-wrapper" />
                        <input
                            type="email"
                            placeholder={t("guest.email")}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="sidebar-input-field"
                        />
                    </div>

                    {/* Optional: Party Size Input if we want it editable */}
                    <div className="sidebar-input-group group">
                        <Users size={16} className="sidebar-input-icon-wrapper" />
                        <input
                            type="number"
                            min={1}
                            max={50}
                            placeholder="Party Size"
                            value={partySize}
                            onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                            className="sidebar-input-field"
                        />
                    </div>
                </div>

                <button
                    onClick={handleBookClick}
                    disabled={!selectedTable || isEditing || !isFormValid}
                    className="sidebar-book-button"
                >
                    {isEditing ? t("action.saveFirst") : t("action.book")}
                </button>

                {!isFormValid && selectedTable && !isEditing && (
                    <p className="sidebar-validation-message">
                        {t("validation.missingInfo")}
                    </p>
                )}

                <p className="sidebar-legal-text px-4">{t("legal")}</p>
            </div>
        </div>
    );
}
