import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, Search, Loader2, Award, Star, Info } from 'lucide-react';
import { createOrderService } from '../services/create-edit-order.service';
import { CustomerDto } from '../types/create-order.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentCustomer: Partial<CustomerDto> | null;
  onSelectCustomer: (customer: CustomerDto | null) => void;
}

export const CustomerSearchModal: React.FC<Props> = ({ isOpen, onClose, currentCustomer, onSelectCustomer }) => {
  const t = useTranslations("orders.management.Create");
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [customerId, setCustomerId] = useState<number | null>(null);

  const [originalCustomerData, setOriginalCustomerData] = useState<CustomerDto | null>(null);

  const [searchedCustomer, setSearchedCustomer] = useState<CustomerDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Reset form mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      setPhone(currentCustomer?.phone || '');
      setFullName(currentCustomer?.fullName || '');
      setEmail(currentCustomer?.email || '');
      setCustomerId(currentCustomer?.customerId || null);

      // Nếu customer có ID thì lưu làm originalData để hiện thẻ VIP
      if (currentCustomer?.customerId && currentCustomer.customerId != 68) {
        setOriginalCustomerData(currentCustomer as CustomerDto);
      } else {
        setOriginalCustomerData(null);
      }
      setMessage({ text: '', type: '' });
    }
  }, [isOpen, currentCustomer]);

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setCustomerId(null);
    setOriginalCustomerData(null);
    setMessage({ text: '', type: '' });
  };

  const handleSearch = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const result = await createOrderService.getCustomerByPhone(phone);
      if (result && result.customerId) {
        setCustomerId(result.customerId);
        setFullName(result.fullName || '');
        setEmail(result.email || '');
        setOriginalCustomerData(result);
        setMessage({ text: 'Customer found. You can update details below.', type: 'success' });
      } else {
        setCustomerId(null);
        setOriginalCustomerData(null);
        setMessage({ text: 'Customer not found. You can enter details to create a new one.', type: 'info' });
      }
    } catch (err) {
      setCustomerId(null);
      setOriginalCustomerData(null);
      setMessage({ text: 'Customer not found. Enter info to create new.', type: 'info' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSelectCustomer({
      customerId: customerId || 0,
      phone,
      fullName,
      email,
      isMember: originalCustomerData?.isMember || false,
      loyaltyPoints: originalCustomerData?.loyaltyPoints || 0
    } as CustomerDto);
    onClose();
  };

  const handleClear = () => {
    onSelectCustomer(null);
    onClose();
  };

  if (!isOpen) return null;

  const canSave = phone.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 z-50">
        <div className="flex justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">{t('customerDetails')}</h3>
          <button onClick={onClose} className="cursor-pointer bg-gray-100 p-1.5 rounded-full"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">{t('phoneNumber')}</label>
            <div className="relative flex gap-2">
              <input
                type="text"
                placeholder="090..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1A3A51]"
              />
              <button onClick={handleSearch} disabled={loading} className="cursor-pointer flex-shrink-0 bg-[#1A3A51] text-white px-4 rounded-xl flex items-center justify-center">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>
            {message.text && (
              <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${message.type === 'success' ? 'text-green-600' : 'text-blue-600'}`}>
                <Info className="w-3.5 h-3.5" /> {message.text}
              </p>
            )}
          </div>

          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#1A3A52]/50 block mb-1 uppercase tracking-wide">{t('fullName', { fallback: 'Full Name' })} *</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full bg-white border border-[#D5BA98]/40 rounded-lg px-3 py-2 text-sm text-[#1A3A52] font-bold outline-none focus:border-[#1A3A52] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1A3A52]/50 block mb-1 uppercase tracking-wide">{t('email', { fallback: 'Email' })}</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-white border border-[#D5BA98]/40 rounded-lg px-3 py-2 text-sm text-[#1A3A52] outline-none focus:border-[#1A3A52] transition-colors"
              />
            </div>
          </div>

          {originalCustomerData && customerId && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1A3A52]/5 border border-[#1A3A52]/10 rounded-lg p-2.5 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-[#1A3A52]/60 uppercase flex items-center gap-1 mb-1">
                  <Award className="w-3 h-3" /> Membership
                </span>
                <span className={`text-sm font-bold ${originalCustomerData.isMember ? 'text-green-600' : 'text-[#1A3A52]/70'}`}>
                  {originalCustomerData.isMember ? 'VIP Member' : 'Standard'}
                </span>
              </div>

              <div className="bg-[#D5BA98]/10 border border-[#D5BA98]/30 rounded-lg p-2.5 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-[#1A3A52]/60 uppercase flex items-center gap-1 mb-1">
                  <Star className="w-3 h-3 text-[#D5BA98]" /> Loyalty Points
                </span>
                <span className="text-sm font-bold text-[#1A3A52]">
                  {originalCustomerData.loyaltyPoints} pts
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button onClick={handleClear} className="cursor-pointer flex-1 py-2.5 font-medium bg-red-50 text-red-600 rounded-xl text-sm">
              Clear Customer
            </button>
            <button onClick={handleSave} disabled={!canSave} className="cursor-pointer flex-1 py-2.5 font-medium bg-[#1A3A51] text-white rounded-xl text-sm disabled:opacity-50">
              {t('saveDetails')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};