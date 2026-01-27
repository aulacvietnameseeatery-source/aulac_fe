"use client";

export default function AboutBreadcrumb() {
  return (
    <div className="sticky top-0 z-10 w-full border-b border-stone-200 bg-stone-100/80 backdrop-blur-sm">
      <div className="mx-auto flex h-20 w-full max-w-[1232px] items-center px-4">
        <div className="flex items-center gap-3 text-sm font-medium text-neutral-950">
          <span>Home</span>
          <span className="opacity-60">-&gt;</span>
          <span>About Us</span>
        </div>
      </div>
    </div>
  );
}
