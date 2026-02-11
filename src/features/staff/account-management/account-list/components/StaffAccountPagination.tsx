interface StaffAccountPaginationProps {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function StaffAccountPagination({
  pageIndex,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: StaffAccountPaginationProps) {
  return (
    <div className="px-6 py-4 border-t border-zinc-200 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-black text-base font-normal font-['Lexend']">
            Page size:
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-3 py-1 border border-stone-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-['Lexend']"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <span className="text-slate-600 text-sm font-bold font-['Lexend']">
          Total: {totalItems} items
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={pageIndex === 1}
          onClick={() => onPageChange(pageIndex - 1)}
          className="px-3 py-1.5 border border-stone-200 rounded text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-['Lexend']"
        >
          Previous
        </button>
        
        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1.5 rounded text-base font-medium transition-colors font-['Lexend'] ${
                page === pageIndex
                  ? 'bg-blue-950 text-white'
                  : 'border border-stone-200 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          disabled={pageIndex >= totalPages}
          onClick={() => onPageChange(pageIndex + 1)}
          className="px-3 py-1.5 border border-stone-200 rounded text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-['Lexend']"
        >
          Next
        </button>
      </div>
    </div>
  );
}
