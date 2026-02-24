"use client";

import { ArrowRight, Mail } from "lucide-react";
import "../styles/index.css";

interface Props {
  email: string;
  error: string;
  isLoading: boolean;
  onEmailChange: (v: string) => void;
  onSubmit: () => void;
}

export function ForgotPasswordForm({
  email,
  error,
  isLoading,
  onEmailChange,
  onSubmit,
}: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="form-container"
    >
      <div className="form-header">
        <h2 className="form-title">Forgot Password</h2>
        <p className="form-description">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <div className="form-field-group">
        <label className="form-label">Email Address</label>
        <div className="form-input-wrapper">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="admin@lamaison.com"
            className="form-input form-input-text"
          />
          <Mail size={18} className="form-input-icon" />
        </div>
        {error && <p className="form-error-text">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="submit-button"
      >
        <span className="font-sans font-bold tracking-widest text-base">
          {isLoading ? "Sending..." : "Send Instructions"}
        </span>
        {!isLoading && (
          <ArrowRight size={20} className="submit-button-icon" />
        )}
      </button>
    </form>
  );
}
