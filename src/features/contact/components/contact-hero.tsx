export function ContactHero() {
  return (
    <div className="w-full max-w-2xl flex flex-col items-center text-center gap-6">
      <h1 className="font-serif text-[48px] md:text-[60px] text-[#1A3951] leading-tight">
        Connect With Us
      </h1>
      <div className="w-12 h-px bg-[#C9A961]" />
      <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl">
        Experience the essence of Vietnamese luxury on the shores of Lake Geneva.
        <br className="hidden md:block" />
        We are here to assist with your inquiries, private event bookings, and special requests.
      </p>
    </div>
  );
}
