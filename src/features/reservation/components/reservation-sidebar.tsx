import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, Armchair, Check, Edit3, X, Clock, User, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
           <h3 className="font-display text-xl font-medium tracking-wide">{t('header.title')}</h3>
           <p className="text-white/60 text-xs mt-1">{t('header.subtitle')}</p>
        </div>
        {/* Decor */}
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
      </div>
      
      <div className="p-5 space-y-5">
        
        {/* === DATE & TIME SECTION === */}
        <div className={`relative flex flex-col bg-stone-50 p-4 rounded-xl border border-stone-100 hover:border-stone-200 transition-colors duration-300 ${isEditing ? 'border-[#DEA048] shadow-md scale-[1.02]' : 'border-stone-100'}`}>
           
           {/* Row: Icon + Title */}
           <div className="flex items-center gap-3 mb-1">
             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1A3A52] border border-stone-200 shadow-sm shrink-0">
               <Calendar size={14} />
             </div>
             <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex-1">{t('datetime.label')}</span>
             
             {/* === BUTTONS ACTION (EDIT / SAVE) === */}
             <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleCancel}
                      className="p-1.5 rounded-md text-stone-400 hover:bg-stone-200 transition-colors cursor-pointer"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                    <button 
                      onClick={handleSave}
                      className="flex items-center gap-1.5 bg-[#1A3A52] text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#DEA048] hover:text-[#1A3A52] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                    >
                      <span>{t('datetime.save')}</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 bg-white border border-stone-200 text-[#1A3A52] px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm hover:border-[#1A3A52] hover:bg-[#1A3A52] hover:text-white hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
                  >
                    <span>{t('datetime.edit')}</span>
                  </button>
                )}
             </div>
           </div>

           {/* Content Area */}
           <div className="pl-11">
              {isEditing ? (
                <div className="grid grid-cols-1 gap-3 animate-in fade-in zoom-in duration-200">
                  {/* Input Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase">{t('datetime.selectDate')}</label>
                    <input 
                      type="date" 
                      value={tempDate}
                      onChange={(e) => setTempDate(e.target.value)}
                      className="w-full text-sm font-bold text-[#132538] bg-white border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1A3A52] focus:ring-1 focus:ring-[#1A3A52] transition-all"
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
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <p className="text-base font-bold text-[#1A3A52]">{displayDate === 'Invalid Date' ? date : displayDate}</p>
                  <p className="text-sm text-stone-500 font-medium flex items-center gap-1.5 mt-0.5">
                    {time}
                  </p>
                </div>
              )}
           </div>
        </div>

        {/* === SELECTED TABLE === */}
        <div className="flex gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100 hover:border-stone-200 transition-colors">
           <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1A3A52] border border-stone-200 shadow-sm shrink-0">
             <Armchair size={18} />
           </div>
           <div className="flex-1">
             <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{t('table.label')}</span>
             {selectedTable ? (
               <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                 <p className="text-sm font-bold text-[#1A3A52] mt-0.5">{selectedTable.name}</p>
                 <p className="text-xs text-stone-500">{t('table.zone')} • {t('table.guests', { count: selectedTable.guests })}</p>
               </div>
             ) : (
               <p className="text-sm text-stone-400 italic mt-1">{t('table.empty')}</p>
             )}
           </div>
        </div>

        <hr className="border-dashed border-stone-200" />
        
        {/* === GUEST INFORMATION FORM === */}
        <div className="space-y-3">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{t('guest.label')}</span>
            
            {/* Name Input */}
            <div className="relative group">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#132538] transition-colors"/>
                <input 
                    type="text" 
                    placeholder={t('guest.name')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2.5 pl-10 pr-3 text-sm text-[#132538] placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#132538] focus:ring-1 focus:ring-[#132538] transition-all"
                />
            </div>

            {/* Phone Input */}
            <div className="relative group">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#132538] transition-colors"/>
                <input 
                    type="tel" 
                    placeholder={t('guest.phone')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2.5 pl-10 pr-3 text-sm text-[#132538] placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#132538] focus:ring-1 focus:ring-[#132538] transition-all"
                />
            </div>

            {/* Email Input */}
            <div className="relative group">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#132538] transition-colors"/>
                <input 
                    type="email" 
                    placeholder={t('guest.email')} 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2.5 pl-10 pr-3 text-sm text-[#132538] placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#132538] focus:ring-1 focus:ring-[#132538] transition-all"
                />
            </div>
        </div>

        {/* Main Action Button */}
        <button 
          onClick={handleBookClick}
          disabled={!selectedTable || isEditing || !isFormValid} 
          className="w-full bg-[#1A3A52] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#1a2c42] hover:shadow-lg hover:-translate-y-1 shadow-md shadow-[#132538]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 cursor-pointer"
        >
          {isEditing ? t('action.saveFirst') : t('action.book')}
        </button>

        {!isFormValid && selectedTable && !isEditing && (
            <p className="text-[10px] text-center text-red-500 font-medium animate-pulse">
                {t('validation.missingInfo')}
            </p>
        )}

        <p className="text-[10px] text-center text-stone-400 leading-relaxed px-4">
          {t('legal')}
        </p>
      </div>
    </div>
  );
};