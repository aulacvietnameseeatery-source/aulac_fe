const TableCardSkeleton = () => {
  return (
    <div className="p-3 rounded-2xl border border-slate-200 bg-white animate-pulse">
      <div className="w-full aspect-4/3 rounded-xl bg-stone-200 mb-4" />

      <div className="flex justify-between items-end px-1 pb-1">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-stone-200 rounded" />
          <div className="h-3 w-20 bg-stone-200 rounded" />
        </div>
        <div className="w-8 h-8 bg-stone-200 rounded-full" />
      </div>
    </div>
  );
};

export default TableCardSkeleton;
