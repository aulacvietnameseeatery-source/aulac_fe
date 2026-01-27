import React, { useState, useEffect } from 'react';
import { Calendar, Armchair, Check, Edit3, X, Clock, User, Phone, Mail } from 'lucide-react';

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

export default function ReservationSidebar({ 
  selectedTable, 
  date, 
  time, 
  onDateTimeChange, 
  onBook 
} : ReservationSidebarProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Temp State
  const [tempDate, setTempDate] = useState(date);
  // Input type="time" needs to be formatted as 24 hours (e.g., 19:30), so we convert it during initialization.
  const [tempTime, setTempTime] = useState(convertTo24Hour(time));

  // --- STATE FOR CUSTOMER FORM ---
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Validate: A phone number is required to place an order.
  const isFormValid = phone.trim().length > 0;

  useEffect(() => {
    setTempDate(date);
    setTempTime(convertTo24Hour(time));
  }, [date, time]);

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
           <h3 className="font-serif text-xl font-medium tracking-wide">Reservation Summary</h3>
           <p className="text-white/60 text-xs mt-1">Please review your selection</p>
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
             <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex-1">Date & Time</span>
             
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
                      <span>Save</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 bg-white border border-stone-200 text-[#1A3A52] px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm hover:border-[#1A3A52] hover:bg-[#1A3A52] hover:text-white hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
                  >
                    <span>Edit</span>
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
                    <label className="text-[10px] font-bold text-stone-400 uppercase">Select Date</label>
                    <input 
                      type="date" 
                      value={tempDate}
                      onChange={(e) => setTempDate(e.target.value)}
                      className="w-full text-sm font-bold text-[#132538] bg-white border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1A3A52] focus:ring-1 focus:ring-[#1A3A52] transition-all"
                    />
                  </div>

                  {/* Input Time */}
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-stone-400 uppercase flex justify-between">
                        Select Time 
                        <span className="text-[9px] normal-case text-stone-400">(11:00 AM - 10:00 PM)</span>
                     </label>
                     <div className="relative">
                        <input 
                          type="time" 
                          value={tempTime}
                          min="11:00" // Opening time limits
                          max="22:00" // Closing time limits
                          onChange={(e) => setTempTime(e.target.value)}
                          className="w-full text-sm font-bold text-[#1A3A52] bg-white border border-stone-300 rounded-lg px-3 py-2 pl-9 focus:outline-none focus:border-[#1A3A52] focus:ring-1 focus:ring-[#1A3A52] transition-all"
                        />
                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"/>
                     </div>
                  </div>
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
             <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Selected Table</span>
             {selectedTable ? (
               <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                 <p className="text-sm font-bold text-[#1A3A52] mt-0.5">{selectedTable.name}</p>
                 <p className="text-xs text-stone-500">Standard Zone • {selectedTable.guests} Guests</p>
               </div>
             ) : (
               <p className="text-sm text-stone-400 italic mt-1">Please select a table</p>
             )}
           </div>
        </div>

        <hr className="border-dashed border-stone-200" />
        
        {/* === GUEST INFORMATION FORM === */}
        <div className="space-y-3">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Your Details</span>
            
            {/* Name Input */}
            <div className="relative group">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#132538] transition-colors"/>
                <input 
                    type="text" 
                    placeholder="Full Name" 
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
                    placeholder="Phone Number *" 
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
                    placeholder="Email Address (Optional)" 
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
          {isEditing ? 'Save Changes First' : 'Book Selected Table'}
        </button>

        {!isFormValid && selectedTable && !isEditing && (
            <p className="text-[10px] text-center text-red-500 font-medium animate-pulse">
                * Please enter Name & Phone to book
            </p>
        )}

        <p className="text-[10px] text-center text-stone-400 leading-relaxed px-4">
          By booking, you agree to our Terms & Conditions and Cancellation Policy.
        </p>
      </div>
    </div>
  );
};