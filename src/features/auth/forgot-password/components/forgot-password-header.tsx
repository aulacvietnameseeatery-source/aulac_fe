import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export function ForgotPasswordHeader() {
  return (
    <div className={`flex flex-col items-center mb-8 ${playfair.variable} ${inter.variable}`}>
      <div className="shadow-[0px_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-sm rounded-full bg-[#E5E7EB] border border-[#D5BA98] p-4 mb-2">
        <span className="material-icons text-4xl leading-10 text-gray-800">
          spa
        </span>
      </div>
      <h1 className="font-serif text-[36px] text-[#132538] font-bold tracking-[-0.9px] leading-10">
        Au Lac
      </h1>
      <p className="font-sans text-[12px] text-[#4B5563] tracking-[2.4px] uppercase font-semibold mt-2">
        Restaurant Portal
      </p>
    </div>
  );
}
