import React from 'react';
import { User, Search, Mail } from 'lucide-react';
import { CustomerType } from '../types/types';
import { useTranslations } from "next-intl";
import { ALInput } from '@/components/ui/al-input';

interface Props {
  phone: string;
  fullName: string;
  email: string;
  customerType: CustomerType;
  loyaltyPoints: number;
  isSearching: boolean;
  onPhoneChange: (val: string) => void;
  onNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onSearch: () => void;
}

export const CustomerSection: React.FC<Props> = ({
  phone, fullName, email, customerType, loyaltyPoints, isSearching,
  onPhoneChange, onNameChange, onEmailChange, onSearch
}) => {
  const t = useTranslations("StaffReservation.customer");

  return (
    <div className="p-8 border-b border-slate-100 relative">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
          <User size={24} className="text-blue-600" />
          <h2>{t("sectionTitle")}</h2>
        </div>
        <div className={`px-4 py-2 rounded-full border flex flex-col items-end ${
            customerType === 'member' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <span className="font-bold text-sm">
            {customerType === 'member'
              ? t("member", { points: loyaltyPoints })
              : t("newCustomer")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("phone")}<span className="text-red-500">*</span></label>
          <div className="relative flex items-center">
            <ALInput 
              type="tel" 
              value={phone} 
              onChange={(e: any) => onPhoneChange(e.target.value)} 
              onKeyDown={(e: any) => e.key === 'Enter' && onSearch()} 
              placeholder={t("enterPhone")}
              className="w-full pr-12 font-medium"
            />
            <button onClick={onSearch} disabled={isSearching} className="absolute right-2 p-1.5 bg-[#1A3A52] text-white rounded-md hover:bg-[#152E41] transition disabled:opacity-50">
              {isSearching ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div> : <Search size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("fullName")}<span className="text-red-500">*</span></label>
          <ALInput 
            type="text" 
            value={fullName} 
            onChange={(e: any) => onNameChange(e.target.value)} 
            placeholder="Customer Name" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("email")}</label>
          <div className="relative">
            <ALInput 
              type="email" 
              value={email} 
              onChange={(e: any) => onEmailChange(e.target.value)} 
              placeholder="name@example.com" 
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};