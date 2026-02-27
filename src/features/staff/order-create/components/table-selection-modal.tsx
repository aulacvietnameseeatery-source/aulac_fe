import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { X, Check, AlertTriangle } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { TableDto } from '../types/create-order.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tables: TableDto[];
  selectedTable: TableDto | null;
  onSelectTable: (table: TableDto) => void;
}

export const TableSelectionModal: React.FC<Props> = ({ isOpen, onClose, tables, selectedTable, onSelectTable }) => {
  const t = useTranslations("Order.Create");
  const [activeZoneId, setActiveZoneId] = useState<number | 'ALL'>('ALL');
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; type: string | null; table: TableDto | null }>({ isOpen: false, type: null, table: null });

  // Lấy danh sách Zone duy nhất từ tables dựa theo API mới
  const zones = useMemo(() => {
    const uniqueZones = new Map<number, string>();
    tables.forEach(t => uniqueZones.set(t.zoneId, t.zoneName));
    return Array.from(uniqueZones.entries()).map(([id, name]) => ({ id, name }));
  }, [tables]);

  const filteredTables = useMemo(() => {
    if (activeZoneId === 'ALL') return tables;
    return tables.filter(tb => tb.zoneId === activeZoneId);
  }, [tables, activeZoneId]);

  const handleTableClick = (table: TableDto) => {
    if (table.statusCode === 'LOCKED') return;
    if (table.statusCode === 'OCCUPIED' || table.statusCode === 'RESERVED') {
      setConfirmDialog({ isOpen: true, type: table.statusCode, table });
      return;
    }
    onSelectTable(table);
    onClose();
  };

  const handleConfirm = () => {
    if (confirmDialog.table) {
      onSelectTable(confirmDialog.table);
      onClose();
    }
    setConfirmDialog({ isOpen: false, type: null, table: null });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="flex justify-between p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg">{t('diningTable')}</h3>
            <button onClick={onClose} className="cursor-pointer text-gray-400 bg-gray-100 p-1.5 rounded-full"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              <button onClick={() => setActiveZoneId('ALL')} className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium border ${activeZoneId === 'ALL' ? 'bg-[#1A3A51] text-white border-[#1A3A51]' : 'bg-white text-gray-600 border-gray-200'}`}>{t('selectFilterAll')}</button>
              {zones.map(zone => (
                <button key={zone.id} onClick={() => setActiveZoneId(zone.id)} className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium border ${activeZoneId === zone.id ? 'bg-[#1A3A51] text-white border-[#1A3A51]' : 'bg-white text-gray-600 border-gray-200'}`}>
                  {zone.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredTables.map(table => {
                const isSelected = selectedTable?.tableId === table.tableId;
                const isOccupied = table.statusCode === 'OCCUPIED';
                const isReserved = table.statusCode === 'RESERVED';
                const isLocked = table.statusCode === 'LOCKED';

                return (
                  <button key={table.tableId} onClick={() => handleTableClick(table)} disabled={isLocked}
                    className={`cursor-pointer relative flex flex-col items-center justify-center p-4 rounded-xl border-2 w-full h-full min-h-[100px]
                      ${isSelected ? 'border-[#1A3A51] bg-[#1A3A51]/5' : 'border-transparent bg-white shadow-sm'}
                      ${isOccupied ? 'opacity-80 bg-red-50/50 border-red-100' : ''}
                      ${isReserved ? 'border-orange-200 bg-orange-50' : ''}
                      ${isLocked ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
                    `}
                  >
                    {isSelected && <div className="absolute top-2 right-2 bg-[#1A3A51] text-white rounded-full p-0.5"><Check className="w-3 h-3" /></div>}
                    <span className={`font-bold text-xl mb-1 ${isOccupied ? 'text-red-700' : isReserved ? 'text-orange-700' : 'text-gray-900'}`}>{table.tableCode}</span>
                    <div className="text-xs font-medium text-gray-500 mb-1">{table.capacity} Seats</div>
                    
                    {!isOccupied && !isReserved && !isLocked && <span className="text-[10px] uppercase font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-auto">Available</span>}
                    {isOccupied && <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full mt-auto">Occupied</span>}
                    {isReserved && <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full mt-auto"><AlertTriangle className="w-3 h-3 inline mr-1" /> Reserved</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={confirmDialog.isOpen} onClose={() => setConfirmDialog({ isOpen: false, type: null, table: null })} title={t('confirmSelection')}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button className="cursor-pointer px-4 py-2 font-medium bg-gray-100 text-gray-700 rounded-lg" onClick={() => setConfirmDialog({ isOpen: false, type: null, table: null })}>{t('cancel')}</button>
            <button className="cursor-pointer px-4 py-2 font-medium bg-[#1A3A51] text-white rounded-lg" onClick={handleConfirm}>{t('confirm')}</button>
          </div>
        }
      >
        <div className="p-2 text-gray-600">
          {confirmDialog.type === 'OCCUPIED' && <p>Table <b>{confirmDialog.table?.tableCode}</b> is currently occupied. Select it to add more items?</p>}
          {confirmDialog.type === 'RESERVED' && <p>Table <b>{confirmDialog.table?.tableCode}</b> is reserved. Are you sure?</p>}
        </div>
      </Dialog>
    </>
  );
};