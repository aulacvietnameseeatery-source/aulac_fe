"use client";

import { useState, useEffect } from "react";
import { changePasswordApi } from "../services/change-password.api";

/**
 * Change Password Hook
 * Handles first-time password change flow
 * 
 * First-time flow:
 * 1. User logs in with default password
 * 2. Backend returns subCode: 1, systemMessage: 'PASSWORD_CHANGE_REQUIRED'
 * 3. Frontend stores tempToken in sessionStorage and redirects to /change-password
 * 4. User sets new password (no current password required)
 * 5. Account is unlocked and user is redirected to login
 */
export function useChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(true);

  // Check for temporary token in sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('tempToken');
      setTempToken(token);
      
      // If no temp token, this is a normal password change (not first-time)
      if (!token) {
        setIsFirstTime(false);
      }
    }
  }, []);

  const submit = async () => {
    setError("");

    // Validate token for first-time change
    if (isFirstTime && !tempToken) {
      setError("Invalid session. Please login again.");
      return;
    }

    // Validate password length
    if (newPassword.length < 8 || newPassword.length > 128) {
      setError("Password must be between 8 and 128 characters.");
      return;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Validate current password for normal change
    if (!isFirstTime && !currentPassword) {
      setError("Current password is required.");
      return;
    }

    setIsLoading(true);

    try {
      await changePasswordApi.change({
        currentPassword: isFirstTime ? undefined : currentPassword,
        newPassword,
        confirmPassword,
      }, isFirstTime ? tempToken! : undefined);
      
      setIsSuccess(true);
      
      // Clear temp token on success
      if (typeof window !== 'undefined' && isFirstTime) {
        sessionStorage.removeItem('tempToken');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unable to change password. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    isLoading,
    isSuccess,
    error,
    submit,
    isFirstTime, // Expose to hide/show current password field
  };
}
