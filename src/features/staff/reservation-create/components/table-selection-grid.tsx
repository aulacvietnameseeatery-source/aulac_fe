import React from 'react';
import { MapPin, CheckCircle, Users } from 'lucide-react';
import { TableAvailabilityDto } from '../types/types';
import { useTranslations } from "next-intl";

interface Props {
  tables: TableAvailabilityDto[];
  selectedTableId: number | null;
  isLoading: boolean;
  isChecked: boolean;
  onSelectTable: (id: number) => void;
}

export const TableSelectionGrid: React.FC<Props> = ({
  tables, selectedTableId, isLoading, isChecked, onSelectTable
}) => {
  const t = useTranslations("StaffReservation.table");

  return (
    <div className="bg-slate-50 rounded-xl p-6 border-2 border-dashed border-slate-200 min-h-45 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2"><MapPin size={16} />{t("availability")}</h3>
        {isLoading ? <span className="text-sm text-blue-600 flex items-center gap-2 animate-pulse">{t("scanning")}</span> 
        : isChecked && tables.length > 0 ? <span className="text-sm text-green-600 flex items-center gap-2 font-medium"><CheckCircle size={16} />{t("found", { count: tables.length })}</span> : null}
      </div>
      
      <div className="flex-1 flex items-center justify-center w-full">
        {!isChecked && !isLoading && <div className="text-center text-slate-400 py-4"><p>{t("emptyHint")}</p></div>}
        
        {isLoading && <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>}
        
        {!isLoading && isChecked && tables.length > 0 && (
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map((table) => (
              <button key={table.tableId} onClick={() => onSelectTable(table.tableId)} 
                className={`relative rounded-lg p-3 flex flex-col items-center justify-center gap-1 transition-all border-2 
                  ${selectedTableId === table.tableId ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'}`}>
                <span className="font-bold text-lg">{table.tableCode}</span>
                <div className={`text-xs flex gap-2 ${selectedTableId === table.tableId ? 'text-blue-100' : 'text-slate-500'}`}>
                  <span><Users size={10} className="inline"/> {table.capacity}</span><span>•</span><span>{table.zone}</span>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {!isLoading && isChecked && tables.length === 0 && <div className="text-center text-red-500">{t("noTable")}</div>}
      </div>
    </div>
  );
};