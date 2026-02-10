import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDebounce } from "../hooks/useDebounce";

type Props = {
  initialSearchTerm: string; // Get from URL for initial display
  onSearchChange: (value: string) => void; // Function to push to URL
  onAddClick: () => void;
};
export const RoleToolbar = ({ initialSearchTerm, onSearchChange, onAddClick }: Props) => {
  const t = useTranslations("Role.List");
  
  // Local state to allow input to respond immediately upon typing.
  const [localSearch, setLocalSearch] = useState(initialSearchTerm);
  
  // Debounce the localSearch value (e.g., retrieve the value after 500ms of typing stops)
  const debouncedSearch = useDebounce(localSearch, 500);

  // Synchronization: When the URL changes (e.g., user back/forwards browser), update the input.
  useEffect(() => {
    setLocalSearch(initialSearchTerm);
  }, [initialSearchTerm]);

  // Synchronization: When debouncedSearch changes -> Call the parent function to push to the URL
  useEffect(() => {
    // Only call if the actual value is different from the value in the current URL.
    if (debouncedSearch !== initialSearchTerm) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange, initialSearchTerm]);
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      {/* Search Input */}
      <div className="relative w-full md:w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </div>

      {/* Add New Button */}
      <button
        onClick={onAddClick}
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all cursor-pointer active:scale-95"
      >
        <Plus size={18} />
        {t("addNew")}
      </button>
    </div>
  );
};