import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, Armchair, Check, Edit3, X, Clock, User, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import "../styles/index.css";

interface ReservationSidebarProps {
  selectedTable: { id: string; name: string; guests: number } | null;
  date: string;
  time: string;
  onDateTimeChange: (newDate: string, newTime: string) => void;
  onBook: (guestInfo: { name: string; phone: string; email: string }) => void;
}

// Helper: Convert the time format for a better display
const formatTimeDisplay = (time24: string) => {
  const [hour, min] = time24.split(':');
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${min} ${ampm}`;
};

// Helper: Convert it back to input
const convertTo24Hour = (timeStr: string) => {
  const [time, modifier] = timeStr.split(' ');
  if (!modifier) return timeStr;
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  return `${hours}:${minutes}`;
};

// Helper: Generate Time Slots (e.g., 11:00, 11:30, 12:00...)
const generateTimeSlots = (startHour: number, endHour: number, intervalMinutes: number) => {
    const slots = [];
    for (let h = startHour; h <= endHour; h++) {
        for (let m = 0; m < 60; m += intervalMinutes) {
             if (h === endHour && m > 0) break; 
             
             const hourStr = h.toString().padStart(2, '0');
             const minStr = m.toString().padStart(2, '0');
             slots.push(`${hourStr}:${minStr}`);
        }
    }
    return slots;
};

export default function ReservationSidebar({ 
  selectedTable, 
  date, 
  time, 
  onDateTimeChange, 
  onBook 
} : ReservationSidebarProps) {
  const t = useTranslations('Reservation.Sidebar');

  const [isEditing, setIsEditing] = useState(false);
  
  // Temp State
  const [tempDate, setTempDate] = useState(date);
  // Input type="time" needs to be formatted as 24 hours (e.g., 19:30), so we convert it during initialization.
  const [tempTime, setTempTime] = useState(convertTo24Hour(time));

  // State to manage the opening/closing of the time dropdown.
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // --- STATE FOR CUSTOMER FORM ---
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Validate: A phone number is required to place an order.
  const isFormValid = phone.trim().length > 0;

  // Create a schedule: From 11:00 to 22:00, each slot spaced 30 minutes apart.
  const timeSlots = useMemo(() => generateTimeSlots(11, 22, 30), []);

  // The reference will close the dropdown if you click outside the specified area.
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempDate(date);
    setTempTime(convertTo24Hour(time));
  }, [date, time]);

  // Handle click-out actions to close the dropdown.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = () => {
    // When saving, reformat it to AM/PM for consistent display.
    const formattedTime = formatTimeDisplay(tempTime);
    onDateTimeChange(tempDate, formattedTime);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset old data
    setTempDate(date);
    setTempTime(convertTo24Hour(time));
    setIsEditing(false);
  };

  const handleSelectTime = (slot: string) => {
      setTempTime(slot);
      setIsTimeDropdownOpen(false);
  };

  const handleBookClick = () => {
    if (isFormValid && selectedTable) {
        onBook({ name, phone, email });
    }
  };

  const displayDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100 sticky top-6 transition-all duration-300 hover:shadow-2xl">
      {/* Header */}
      <div className="bg-[#1A3A52] p-5 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="sidebar-header-title">{t("header.title")}</h3>
          <p className="sidebar-header-subtitle">{t("header.subtitle")}</p>
        </div>
        {/* Decor */}
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
      </div>

      <div className="p-5 space-y-5">
        {/* === DATE & TIME SECTION === */}
        <div
          className={`sidebar-datetime-section ${
            isEditing ? "sidebar-datetime-section-editing" : ""
          }`}
        >
          {/* Row: Icon + Title */}
          <div className="sidebar-datetime-header">
            <div className="sidebar-datetime-icon-box">
              <Calendar size={14} />
            </div>
            <span className="sidebar-datetime-label-wrapper">
              {t("datetime.label")}
            </span>

            {/* === BUTTONS ACTION (EDIT / SAVE) === */}
            <div className="sidebar-datetime-actions">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="sidebar-datetime-cancel-button"
                    title="Cancel"
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

          {/* Content Area */}
          <div className="sidebar-datetime-content">
            {isEditing ? (
              <div className="sidebar-date-time-input-container fade-in zoom-in animate-in">
                {/* Input Date */}
                <div className="sidebar-date-label-wrapper">
                  <label className="sidebar-date-label">
                    {t("datetime.selectDate")}
                  </label>
                  <input
                    type="date"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    className="sidebar-date-input"
                  />
                </div>

                {/* === CUSTOM TIME DROPDOWN === */}
                  <div className="space-y-1 relative" ref={dropdownRef}>
                      <label className="text-[10px] font-bold text-stone-400 uppercase flex justify-between">
                         {t('datetime.selectTime')}
                         <span className="text-[9px] normal-case text-stone-400">{t('datetime.openingHours')}</span>
                      </label>
                      
                      {/* Button Dropdown */}
                      <div 
                        onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                        className={`w-full text-sm font-bold text-[#1A3A52] bg-white border rounded-lg px-3 py-2 pl-9 flex items-center justify-between cursor-pointer transition-all ${isTimeDropdownOpen ? 'border-[#1A3A52] ring-1 ring-[#1A3A52]' : 'border-stone-300 hover:border-[#1A3A52]'}`}
                      >
                         <span>{formatTimeDisplay(tempTime)}</span>
                         {isTimeDropdownOpen ? <ChevronUp size={14} className="text-stone-400"/> : <ChevronDown size={14} className="text-stone-400"/>}
                      </div>
                      <Clock size={16} className="absolute left-3 top-[2.4rem] -translate-y-1/2 text-stone-400 pointer-events-none"/>
                      
                      {/* Dropdown List Body */}
                      {isTimeDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-xl max-h-43 overflow-y-auto z-50 
                        [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-stone-50 [&::-webkit-scrollbar-thumb]:bg-stone-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-stone-400">
                           {timeSlots.map((slot) => {
                             const isSelected = slot === tempTime;
                             return (
                               <div 
                                 key={slot} 
                                 onClick={() => handleSelectTime(slot)}
                                 className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${isSelected ? 'bg-[#F0F5F9] text-[#1A3A52] font-bold' : 'text-stone-600 hover:bg-stone-50'}`}
                               >
                                 {formatTimeDisplay(slot)}
                                 {isSelected && <Check size={14} className="text-[#DEA048]" />}
                               </div>
                             )
                           })}
                        </div>
                      )}
                  </div>
                  {/* End Custom Dropdown */}
              </div>
            ) : (
              <div className="sidebar-datetime-content-display fade-in animate-in slide-in-from-left-2">
                <p className="sidebar-datetime-date">
                  {displayDate === "Invalid Date" ? date : displayDate}
                </p>
                <p className="sidebar-datetime-time">{time}</p>
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
                <p className="sidebar-table-name">{selectedTable.name}</p>
                <p className="sidebar-table-info">
                  {t("table.zone")} • {t("table.guests", { count: selectedTable.guests })}
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

          {/* Name Input */}
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

          {/* Phone Input */}
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

          {/* Email Input */}
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
        </div>

        {/* Main Action Button */}
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
};