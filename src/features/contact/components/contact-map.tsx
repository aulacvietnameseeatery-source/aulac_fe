export function ContactMap() {
  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 text-[#1A3951]">
            <b className="tracking-[1.2px] uppercase text-xs">Find Us</b>
            <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="w-full h-75 md:h-87.5 bg-slate-200 relative rounded-sm overflow-hidden border border-slate-300 shadow-sm group">
            <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2745.767919575806!2d6.6076634768636335!3d46.51270416287284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478c302e98355e7f%3A0x6bfac1478ade9d!2sAv.%20Emile-Henri-Jaques-Dalcroze%2C%201007%20Lausanne%2C%20Switzerland!5e0!3m2!1sen!2s!4v1769503094124!5m2!1sen!2s"
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            
            <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 text-[10px] text-slate-500 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition">
                Click to interact
            </div>
        </div>
    </div>
  );
}