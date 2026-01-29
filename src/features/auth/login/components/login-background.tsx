"use client";

export function LoginBackground() {
  return (
    <>
      {/* Background layer */}
      <div className="absolute inset-0">
        <img
          src="/images/authen/auth-login-background/login-background.png"
          alt="Cozy background"
          className="absolute inset-0 h-full w-full object-cover opacity-30 blur-[2px]"
        />
        <div className="absolute inset-0 mix-blend-multiply bg-orange-50/90" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-red-300/10" />
      </div>

      {/* Decorative blur blobs */}
      <div className="pointer-events-none absolute right-10 top-10 h-64 w-64 rounded-full bg-red-300/20 blur-[32px]" />
      <div className="pointer-events-none absolute left-10 bottom-10 h-80 w-80 rounded-full bg-blue-950/10 blur-[32px]" />
    </>
  );
}
