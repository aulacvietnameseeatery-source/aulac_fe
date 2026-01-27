interface InputGroupProps {
  label: string;
  placeholder?: string;
  type?: string;
}

export function InputGroup({ label, placeholder, type = "text" }: InputGroupProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="tracking-[1px] uppercase text-[10px] font-bold text-slate-400">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full h-12 border border-slate-300 rounded-sm px-4 text-[#1A3951]"
      />
    </div>
  );
}
