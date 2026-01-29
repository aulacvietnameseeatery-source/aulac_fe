"use client";

export function LoginHeader() {
  return (
    <div className="flex flex-col items-center">
      <div className="pb-2">
        <div className="rounded-full bg-white/80 px-4 pt-4 pb-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-red-300/20 backdrop-blur-[2px]">
          <span className="material-icons text-4xl leading-10 text-gray-800">
            spa
          </span>
        </div>
      </div>

      <div className="pt-2 text-center text-4xl font-bold leading-10 text-gray-800">
        Au Lac
      </div>

      <div className="pt-2 text-center text-xs font-semibold uppercase leading-4 tracking-[2.40px] text-blue-950/70">
        Restaurant Portal
      </div>
    </div>
  );
}
    