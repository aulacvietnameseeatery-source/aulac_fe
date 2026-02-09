import { Lock } from "lucide-react";
import "../styles/index.css";

export function ResetPasswordSuccess() {
  return (
    <div className="success-wrapper">
      <div className="success-icon-box">
        <Lock size={32} />
      </div>
      <h2 className="success-title">All set!</h2>
      <p className="success-description">
        Your password has been reset successfully.
      </p>
    </div>
  );
}
