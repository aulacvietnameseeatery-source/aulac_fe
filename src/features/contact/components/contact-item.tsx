interface ContactItemProps {
  icon: React.ReactNode;
  label: string;
  content: React.ReactNode;
}

export function ContactItem({ icon, label, content }: ContactItemProps) {
  return (
    <div className="flex items-start gap-5">
      <div className="w-6 mt-1 flex justify-center text-[#C9A961]">
        {icon}
      </div>

      <div className="flex flex-col gap-1">
        <b className="tracking-[1px] uppercase text-xs text-[#C9A961]">
          {label}
        </b>
        <div className="font-display text-xl text-[#1A3951]">
          {content}
        </div>
      </div>
    </div>
  );
}
