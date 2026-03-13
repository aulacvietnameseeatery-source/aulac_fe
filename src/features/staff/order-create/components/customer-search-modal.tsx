import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, Search, Loader2, Award, Star } from 'lucide-react';
import { createOrderService } from '../services/create-edit-order.service';
import { CustomerDto } from '../types/create-order.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentCustomer: CustomerDto | null;
  onSelectCustomer: (customer: CustomerDto | null) => void;
}

export const CustomerSearchModal: React.FC<Props> = ({ isOpen, onClose, currentCustomer, onSelectCustomer }) => {
  const t = useTranslations("Order.Create");
  const [phone, setPhone] = useState('');
  const [searchedCustomer, setSearchedCustomer] = useState<CustomerDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      setPhone(currentCustomer?.phone || '');
      setSearchedCustomer(currentCustomer);
      setError('');
    }
  }, [isOpen, currentCustomer]);

  const handleSearch = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await createOrderService.getCustomerByPhone(phone);
      if (result && result.customerId) {
        setSearchedCustomer(result);
      } else {
        setError('Customer not found.');
        setSearchedCustomer(null);
      }
    } catch (err) {
      setError('Error finding customer or not exists.');
      setSearchedCustomer(null);
    } finally {
      console.log(searchedCustomer)
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSelectCustomer(searchedCustomer);
    onClose();
  };

  const handleClear = () => {
    onSelectCustomer(null);
    onClose();
  };

  if (!isOpen) return null;

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
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
          </div>

            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">{t('fullName')}</label>
                <input disabled value={searchedCustomer ? searchedCustomer.fullName : ''} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-medium" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">{t('email')}</label>
                <input disabled value={searchedCustomer ? searchedCustomer.email : ''} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700" />
              </div>
            </div>

            {searchedCustomer && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1A3A52]/5 border border-[#1A3A52]/10 rounded-lg p-2.5 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-[#1A3A52]/60 uppercase flex items-center gap-1 mb-1">
                  <Award className="w-3 h-3" /> Membership
                </span>
                <span className={`text-sm font-bold ${searchedCustomer.isMember ? 'text-green-600' : 'text-[#1A3A52]/70'}`}>
                  {searchedCustomer.isMember ? 'VIP Member' : 'Standard'}
                </span>
              </div>

              <div className="bg-[#D5BA98]/10 border border-[#D5BA98]/30 rounded-lg p-2.5 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-[#1A3A52]/60 uppercase flex items-center gap-1 mb-1">
                  <Star className="w-3 h-3 text-[#D5BA98]" /> Loyalty Points
                </span>
                <span className="text-sm font-bold text-[#1A3A52]">
                  {searchedCustomer.loyaltyPoints} pts
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex gap-3">
             <button onClick={handleClear} className="cursor-pointer flex-1 py-2.5 font-medium bg-red-50 text-red-600 rounded-xl text-sm">
                Clear Customer
             </button>
            <button onClick={handleSave} disabled={!searchedCustomer} className="cursor-pointer flex-1 py-2.5 font-medium bg-[#1A3A51] text-white rounded-xl text-sm disabled:opacity-50">
              {t('saveDetails')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};