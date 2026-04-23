import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, Search, Loader2, Star, Info } from 'lucide-react';
import { formatPhoneToDomesticDisplay } from '@/lib/phone-format';
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
  const [searchResults, setSearchResults] = useState<CustomerDto[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Reset the form every time you open the modal.
  useEffect(() => {
    if (isOpen) {
      setPhone(formatPhoneToDomesticDisplay(currentCustomer?.phone || ''));
      setFullName(currentCustomer?.fullName || '');
      setEmail(currentCustomer?.email || '');
      setCustomerId(currentCustomer?.customerId || null);

      if (currentCustomer?.customerId && currentCustomer.customerId != 68) {
        setOriginalCustomerData(currentCustomer as CustomerDto);
      } else {
        setOriginalCustomerData(null);
      }
      setMessage({ text: '', type: '' });
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [isOpen, currentCustomer]);

  // Debounce 1 s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phone.trim() && !customerId) { // Only search if a specific customerId has not been selected
        executeSearch(phone);
      } else if (!phone.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [customerId, phone]);

  const executeSearch = async (keyword: string) => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const results = await createOrderService.searchCustomers(keyword);
      if (results && results.length > 0) {
        setSearchResults(results);
        setShowDropdown(true);
        setMessage({ text: 'Select a customer from the list or create new.', type: 'info' });
      } else {
        setFullName('');
        setEmail('');
        setCustomerId(null);
        setOriginalCustomerData(null);
        setSearchResults([]);
        setShowDropdown(false);
        setMessage({ text: 'Customer not found. You can enter details to create a new one.', type: 'info' });
      }
    } catch {
      setFullName('');
      setEmail('');
      setCustomerId(null);
      setOriginalCustomerData(null);
      setSearchResults([]);
      setShowDropdown(false);
      setMessage({ text: 'Customer not found. Enter info to create new.', type: 'info' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setCustomerId(null); 
    setOriginalCustomerData(null);
    setMessage({ text: '', type: '' });
    setShowDropdown(false);
  };

  const handleSelectCustomer = (customer: CustomerDto) => {
    setPhone(formatPhoneToDomesticDisplay(customer.phone));
    setFullName(customer.fullName || '');
    setEmail(customer.email || '');
    setCustomerId(customer.customerId);
    setOriginalCustomerData(customer);
    
    setSearchResults([]);
    setShowDropdown(false);
    setMessage({ text: 'Customer selected.', type: 'success' });
  };

  const handleSave = () => {
    onSelectCustomer({
      customerId: customerId || 0,
      phone,
      fullName,
      email,
      isMember: originalCustomerData?.isMember || true,
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
          {/* Phone Search Section */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">{t('phoneNumber')}</label>
            <div className="relative">
              <div className="relative flex gap-2">
                <input
                  type="text"
                  placeholder="090..."
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1A3A51]"
                />
                <div className="flex-shrink-0 bg-gray-100 text-gray-500 px-4 rounded-xl flex items-center justify-center">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#1A3A51]" /> : <Search className="w-4 h-4" />}
                </div>
              </div>

              {/* Dropdown Selection */}
              {showDropdown && searchResults.length > 0 && (
                <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50">
                  {searchResults.map((c) => (
                    <li
                      key={c.customerId}
                      onClick={() => handleSelectCustomer(c)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0 transition-colors"
                    >
                      <div className="font-bold text-gray-800">{formatPhoneToDomesticDisplay(c.phone)}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{c.fullName}</div>
                    </li>
                  ))}
                </ul>
              )}
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
              <div className="bg-[#D5BA98]/10 border border-[#D5BA98]/30 rounded-lg p-2.5 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-[#1A3A52]/60 uppercase flex items-center gap-1 mb-1">
                  <Star className="w-3 h-3 text-[#D5BA98]" /> Loyalty Points
                </span>
                <span className="text-sm font-bold text-[#1A3A52]">
                  {originalCustomerData.loyaltyPoints} pts
                </span>
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