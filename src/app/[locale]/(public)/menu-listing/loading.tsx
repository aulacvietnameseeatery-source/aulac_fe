export default function MenuListingLoading() {
    return (
        <main className="relative flex-1 min-h-screen w-full flex items-center justify-center bg-[#0f172a]">
            <div className="flex flex-col items-center gap-4 text-slate-400">
                <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-[#FFAB2D] animate-spin" />
                <p className="text-sm tracking-widest uppercase font-light">Loading Menu…</p>
            </div>
        </main>
    );
}
