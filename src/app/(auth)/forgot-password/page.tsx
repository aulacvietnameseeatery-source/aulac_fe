// "use client";
// import React, { useState } from 'react';
// import Link from 'next/link';
// import { Playfair_Display, Inter } from 'next/font/google';
// import { ArrowRight, Mail, ChevronLeft, Flower2 } from 'lucide-react';

// // --- FONTS CONFIG ---
// const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
// const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// export default function ForgotPasswordPage() {
//   const [email, setEmail] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');
    
//     try {
//       // Giả lập gọi API
//       const response = await fetch('/api/forgot-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email }),
//       });

//       if (response.ok) {
//         setIsSuccess(true);
//       } else {
//         setError('Email not found or server error.');
//       }
//     } catch (err) {
//       setError('Something went wrong. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className={`min-h-screen bg-white flex items-center justify-center font-sans ${playfair.variable} ${inter.variable}`}>
//       <div className="w-full relative max-w-[448px] flex flex-col items-center">
        
//         {/* === HEADER LOGO === */}
//         <div className="flex flex-col items-center mb-8">
//           <div className="shadow-[0px_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-sm rounded-full bg-[#E5E7EB] border border-[#D5BA98] p-4 mb-2">
//              <span className="material-icons text-4xl leading-10 text-gray-800">
//                   spa
//               </span>
//           </div>
//           <h1 className="font-serif text-[36px] text-[#132538] font-bold tracking-[-0.9px] leading-10">
//             Au Lac
//           </h1>
//           <p className="font-sans text-[12px] text-[#4B5563] tracking-[2.4px] uppercase font-semibold mt-2">
//             Restaurant Portal
//           </p>
//         </div>

//         {/* === CARD CONTAINER === */}
//         <div className="w-full px-4">
//           <div className="w-full shadow-[0px_20px_40px_-12px_rgba(213,186,152,0.4)] backdrop-blur-sm rounded-[32px] bg-[#FFFCF8] border border-[#E5E7EB] overflow-hidden p-10 relative isolate flex flex-col gap-6">
            
//             {/* Decorative Top Gradient Line */}
//             <div className="w-[calc(100%-2px)] h-1 absolute top-[1px] left-[1px] bg-gradient-to-r from-transparent via-[#D5BA98] to-transparent opacity-50 z-0" />

//             {/* Content */}
//             {!isSuccess ? (
//               <form onSubmit={handleSubmit} className="z-10 flex flex-col gap-6">
//                 <div className="text-center">
//                     <h2 className="font-serif text-2xl text-[#132538] font-semibold mb-2">Forgot Password</h2>
//                     <p className="font-sans text-sm text-gray-500">Enter your email address and we'll send you a link to reset your password.</p>
//                 </div>

//                 {/* Email Input */}
//                 <div className="flex flex-col gap-2">
//                   <label className="font-serif text-[#132538] tracking-[0.35px] font-semibold text-sm">
//                     Email Address
//                   </label>
//                   <div className="shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-2xl bg-white border border-[#D1D5DB] flex items-center py-3.5 px-4 focus-within:border-[#132538] transition-colors">
//                     <input 
//                       type="email" 
//                       required
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       placeholder="admin@lamaison.com"
//                       className="w-full outline-none text-[#132538] placeholder:text-gray-400 font-sans text-sm"
//                     />
//                     <Mail size={18} className="text-gray-400" />
//                   </div>
//                   {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
//                 </div>

//                 {/* Submit Button */}
//                 <button 
//                   type="submit" 
//                   disabled={isLoading}
//                   className="w-full shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-2xl bg-[#132538] py-3.5 px-4 text-white flex items-center justify-center gap-2 hover:bg-[#1a2c42] transition-colors disabled:opacity-70"
//                 >
//                   <span className="font-sans font-bold tracking-[0.4px] text-[16px]">
//                     {isLoading ? 'Sending...' : 'Send Instructions'}
//                   </span>
//                   {!isLoading && <ArrowRight size={20} className="text-[#D5BA98]" />}
//                 </button>
//               </form>
//             ) : (
//               /* Success State */
//               <div className="z-10 flex flex-col items-center text-center gap-4 py-4">
//                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
//                     <Mail size={32} />
//                  </div>
//                  <h2 className="font-serif text-2xl text-[#132538] font-semibold">Check your email</h2>
//                  <p className="font-sans text-sm text-gray-500">
//                     We have sent password recovery instructions to <br/><span className="font-semibold text-[#132538]">{email}</span>
//                  </p>
//               </div>
//             )}
            
//             {/* Footer Link */}
//             <div className="border-t border-[#E5E7EB] pt-6 flex justify-center z-10">
//                 <Link href="/login" className="flex items-center gap-2 text-[#4B5563] text-sm font-medium hover:text-[#132538] transition-colors font-sans">
//                     <ChevronLeft size={16} />
//                     Back to Sign In
//                 </Link>
//             </div>

//           </div>
//         </div>

//         {/* === COPYRIGHT === */}
//         <div className="mt-8 text-center">
//              <p className="text-[10px] text-[#9CA3AF] font-sans">
//                 © 2025 La Maison. All rights reserved.
//              </p>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import {
  ForgotPasswordHeader,
  ForgotPasswordForm,
  ForgotPasswordSuccess,
  ForgotPasswordCard,
  useForgotPassword
} from "@/features/auth/forgot-password";

export default function ForgotPasswordPage() {
  const {
    email,
    setEmail,
    isLoading,
    isSuccess,
    error,
    submit,
  } = useForgotPassword();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full relative max-w-md flex flex-col items-center">
        <ForgotPasswordHeader />

        <ForgotPasswordCard>
          {!isSuccess ? (
            <ForgotPasswordForm
              email={email}
              error={error}
              isLoading={isLoading}
              onEmailChange={setEmail}
              onSubmit={submit}
            />
          ) : (
            <ForgotPasswordSuccess email={email} />
          )}
        </ForgotPasswordCard>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-[#9CA3AF]">
            © 2025 La Maison. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

