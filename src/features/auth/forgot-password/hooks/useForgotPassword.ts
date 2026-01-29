"use client";

import { useState } from "react";
import { forgotPasswordApi } from "../services/forgot-password.api";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setIsLoading(true);
    setError("");

    try {
      await forgotPasswordApi.sendResetEmail({ email });
      setIsSuccess(true); // luôn success (đúng security)
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    isLoading,
    isSuccess,
    error,
    submit,
  };
}
