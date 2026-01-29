// "use client";
// import React, { useState, Suspense } from 'react';
// import Link from 'next/link';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { Playfair_Display, Inter } from 'next/font/google';
// import { ArrowRight, Lock, Flower2 } from 'lucide-react';

// // --- FONTS CONFIG ---
// const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
// const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// function ResetPasswordForm() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const token = searchParams.get('token'); // Lấy token từ URL

//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setMessage(null);

//     if (password !== confirmPassword) {
//       setMessage({ type: 'error', text: 'Passwords do not match.' });
//       return;
//     }

//     if (!token) {
//         setMessage({ type: 'error', text: 'Invalid or missing token.' });
//         return;
//     }

//     setIsLoading(true);

//     try {
//       // Giả lập gọi API
//       const response = await fetch('/api/reset-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ token, newPassword: password }),
//       });

//       if (response.ok) {
//         setMessage({ type: 'success', text: 'Password reset successfully!' });
//         // Chuyển hướng về login sau 2s
//         setTimeout(() => router.push('/login'), 2000);
//       } else {
//         setMessage({ type: 'error', text: 'Failed to reset password. Token may be expired.' });
//       }
//     } catch (err) {
//         setMessage({ type: 'error', text: 'Something went wrong.' });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (message?.type === 'success') {
//       return (
//         <div className="z-10 flex flex-col items-center text-center gap-4 py-8">
//             <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
//             <Lock size={32} />
//             </div>
//             <h2 className="font-serif text-2xl text-[#132538] font-semibold">All set!</h2>
//             <p className="font-sans text-sm text-gray-500">
//             Your password has been reset. Redirecting to login...
//             </p>
//         </div>
//       )
//   }

//   return (
//     <form onSubmit={handleSubmit} className="z-10 flex flex-col gap-6">
//         <div className="text-center">
//             <h2 className="font-serif text-2xl text-[#132538] font-semibold mb-2">Set New Password</h2>
//             <p className="font-sans text-sm text-gray-500">Please create a new password that you don't use on any other site.</p>
//         </div>

//         {/* New Password */}
//         <div className="flex flex-col gap-2">
//             <label className="font-serif text-[#132538] tracking-[0.35px] font-semibold text-sm">
//             New Password
//             </label>
//             <div className="shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-2xl bg-white border border-[#D1D5DB] flex items-center py-3.5 px-4 focus-within:border-[#132538] transition-colors">
//             <input 
//                 type="password" 
//                 required
//                 minLength={8}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="••••••••"
//                 className="w-full outline-none text-[#132538] placeholder:text-gray-400 font-sans text-sm"
//             />
//             <Lock size={18} className="text-gray-400" />
//             </div>
//         </div>

//         {/* Confirm Password */}
//         <div className="flex flex-col gap-2">
//             <label className="font-serif text-[#132538] tracking-[0.35px] font-semibold text-sm">
//             Confirm Password
//             </label>
//             <div className="shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-2xl bg-white border border-[#D1D5DB] flex items-center py-3.5 px-4 focus-within:border-[#132538] transition-colors">
//             <input 
//                 type="password" 
//                 required
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 placeholder="••••••••"
//                 className="w-full outline-none text-[#132538] placeholder:text-gray-400 font-sans text-sm"
//             />
//             <Lock size={18} className="text-gray-400" />
//             </div>
//             {message?.type === 'error' && <p className="text-red-500 text-xs mt-1">{message.text}</p>}
//         </div>

//         {/* Submit Button */}
//         <button 
//             type="submit" 
//             disabled={isLoading}
//             className="w-full shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-2xl bg-[#132538] py-3.5 px-4 text-white flex items-center justify-center gap-2 hover:bg-[#1a2c42] transition-colors disabled:opacity-70"
//         >
//             <span className="font-sans font-bold tracking-[0.4px] text-[16px]">
//             {isLoading ? 'Resetting...' : 'Reset Password'}
//             </span>
//             {!isLoading && <ArrowRight size={20} className="text-[#D5BA98]" />}
//         </button>
//     </form>
//   );
// }

// export default function ResetPasswordPage() {
//   return (
//     <div className={`min-h-screen bg-white flex items-center justify-center font-sans ${playfair.variable} ${inter.variable}`}>
//       <div className="w-full relative max-w-md flex flex-col items-center">
        
//         {/* === HEADER === */}
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

//         {/* === CARD === */}
//         <div className="w-full px-4">
//           <div className="w-full shadow-[0px_20px_40px_-12px_rgba(213,186,152,0.4)] backdrop-blur-sm rounded-[32px] bg-[#FFFCF8] border border-[#E5E7EB] overflow-hidden p-10 relative isolate flex flex-col gap-6">
            
//             {/* Top Gradient */}
//             <div className="w-[calc(100%-2px)] h-1 absolute top-px left-px bg-linear-to-r from-transparent via-[#D5BA98] to-transparent opacity-50 z-0" />

//             {/* Form Content (Wrapped in Suspense for useSearchParams) */}
//             <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
//                 <ResetPasswordForm />
//             </Suspense>

//             {/* Link to Login */}
//             {/* Nếu đang ở trạng thái success thì không cần hiện link này vì đã auto redirect, nhưng giữ lại để an toàn */}
//             <div className="border-t border-[#E5E7EB] pt-6 flex justify-center z-10">
//                 <Link href="/login" className="text-[#4B5563] text-sm font-medium hover:text-[#132538] transition-colors font-sans">
//                    Back to Sign In
//                 </Link>
//             </div>
//           </div>
//         </div>

//         {/* === FOOTER === */}
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

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ResetPasswordHeader,
  ResetPasswordCard,
  ResetPasswordForm,
  ResetPasswordSuccess,
  useResetPassword,
} from "@/features/auth/reset-password";

function Content() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    isLoading,
    isSuccess,
    error,
    submit,
  } = useResetPassword(token);

  if (isSuccess) {
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <ResetPasswordCard>
      {!isSuccess ? (
        <ResetPasswordForm
          password={password}
          confirmPassword={confirmPassword}
          error={error}
          isLoading={isLoading}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={submit}
        />
      ) : (
        <ResetPasswordSuccess />
      )}
    </ResetPasswordCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full flex flex-col items-center">
        <ResetPasswordHeader />
        <Suspense fallback={<div>Loading...</div>}>
          <Content />
        </Suspense>
      </div>
    </div>
  );
}
