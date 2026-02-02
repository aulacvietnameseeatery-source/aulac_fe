import "../styles/index.css";

export default function TableCardSkeleton() {
  return (
    <div className="table-card-skeleton">
      <div className="table-card-skeleton-image" />

      <div className="flex justify-between items-end px-1 pb-1">
        <div className="space-y-2">
          <div className="table-card-skeleton-text" />
          <div className="table-card-skeleton-info" />
        </div>
        <div className="w-8 h-8 bg-slate-200 rounded-full" />
      </div>
    </div>
  );
};
