import React, { useState, useEffect } from 'react';
import { ShoppingBag, Utensils, LayoutGrid, Clock, RefreshCw } from 'lucide-react';
import { createOrderService } from '../services/create-edit-order.service';
import { RecentOrderDto } from '../types/create-order.types';
import { useTranslations } from 'next-intl';
import { useDraggableScroll } from '@/hooks/use-draggable-scroll';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
    case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const formatDateTime = (utcDateString: string) => {
  const dateStringWithZ = utcDateString.endsWith('Z') ? utcDateString : `${utcDateString}Z`;
  const date = new Date(dateStringWithZ);
  
  // Convert to Local Time format: DD/MM/YYYY, HH:mm
  return date.toLocaleString(undefined, { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit' 
  });
};

export const RecentOrders = () => {
  const t = useTranslations("Order.RecentOrders");

  const [filter, setFilter] = useState<'ALL' | 'DINE_IN' | 'TAKEAWAY'>('ALL');
  const [orders, setOrders] = useState<RecentOrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollProps = useDraggableScroll<HTMLDivElement>();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await createOrderService.getRecentOrders(20);
      setOrders(data || []);
    } catch (error) {
      console.error("Failed to fetch recent orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => filter === 'ALL' || o.source === filter);

  return (
    <div className="flex flex-col gap-3 font-sans h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-[#1A3A52] text-lg font-semibold tracking-wide">{t('title')}</h2>
          <button 
            onClick={fetchOrders} 
            className="p-1.5 text-[#1A3A52]/50 hover:text-[#1A3A52] hover:bg-[#D5BA98]/20 rounded-md transition"
            title={t('refresh')}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* Filter */}
        <div className="flex gap-1.5 p-1 bg-[#FDFBF9] border border-[#D5BA98]/40 rounded-lg shrink-0">
          <button onClick={() => setFilter('ALL')} className={`text-xs px-3 py-1 rounded font-semibold transition ${filter === 'ALL' ? 'bg-[#1A3A52] text-[#D5BA98]' : 'text-[#1A3A52]/70 hover:bg-[#D5BA98]/20'}`}>{t('filterAll')}</button>
          <button onClick={() => setFilter('DINE_IN')} className={`text-xs px-3 py-1 rounded font-semibold transition ${filter === 'DINE_IN' ? 'bg-[#1A3A52] text-[#D5BA98]' : 'text-[#1A3A52]/70 hover:bg-[#D5BA98]/20'}`}>{t('dineIn')}</button>
          <button onClick={() => setFilter('TAKEAWAY')} className={`text-xs px-3 py-1 rounded font-semibold transition ${filter === 'TAKEAWAY' ? 'bg-[#1A3A52] text-[#D5BA98]' : 'text-[#1A3A52]/70 hover:bg-[#D5BA98]/20'}`}>{t('takeAway')}</button>
        </div>
      </div>

      <div {...scrollProps} className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
        {loading && orders.length === 0 ? (
          <div className="text-[#1A3A52]/50 text-xs py-4 flex items-center gap-2">
             <RefreshCw className="w-4 h-4 animate-spin" /> {t('loading')}
          </div>
        ) : filteredOrders.length === 0 ? (
          <p className="text-[#1A3A52]/50 text-xs py-4 italic">{t('noOrdersFound')}</p>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.orderId} className="bg-white border border-[#D5BA98]/30 rounded-lg p-3 w-[250px] shrink-0 hover:border-[#1A3A52] hover:shadow-md transition-all">
              
              <div className="flex justify-between items-start mb-2 border-b border-[#D5BA98]/20 pb-2">
                <span className="text-xs text-[#1A3A52] font-bold">#{order.orderId}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(order.status)}`}>
                  {t(`status.${order.status}`)}
                </span>
              </div>
              
              <p className="text-sm font-bold text-[#1A3A52] truncate mb-2">{order.customerName}</p>

              <div className="flex items-center gap-3 text-xs text-[#1A3A52]/70 font-medium">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#D5BA98]" /> {formatDateTime(order.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  {order.source === 'DINE_IN' ? <Utensils className="w-3 h-3 text-[#D5BA98]" /> : <ShoppingBag className="w-3 h-3 text-[#D5BA98]" />}
                  {order.source === 'DINE_IN' ? t('dineIn') : t('takeAway')}
                </div>
              </div>

              {order.source === 'DINE_IN' && order.tableCode && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#1A3A52] bg-[#D5BA98]/10 w-max px-2 py-1 rounded">
                  <LayoutGrid className="w-3 h-3" /> {t('table')}: {order.tableCode}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};