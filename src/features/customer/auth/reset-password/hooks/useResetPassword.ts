"use client";

import { useState } from "react";
import { resetPasswordApi } from "../services/reset-password.api";

export function useResetPassword(token: string | null) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");

    if (!token) {
      setError("Invalid or expired reset link.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Password must be between 8 and 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordApi.reset({
        token,
        newPassword: password,
      });
      setIsSuccess(true);
    } catch {
      setError("Unable to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    isLoading,
    isSuccess,
    error,
    submit,
  };
}
