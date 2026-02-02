import { Mail } from "lucide-react";
import "../styles/index.css";

export function ForgotPasswordSuccess({ email }: { email: string }) {
  return (
    <div className="success-wrapper">
      <div className="success-icon-box">
        <Mail size={32} />
      </div>
      <h2 className="success-title">Check your email</h2>
      <p className="success-description">
        We have sent password recovery instructions to <br />
        <span className="success-email">{email}</span>
      </p>
    </div>
  );
}
