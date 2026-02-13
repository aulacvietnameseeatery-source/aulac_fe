"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useState } from "react";

interface ChangePasswordFormProps {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
  error: string;
  isLoading: boolean;
  isFirstTime: boolean;
  onCurrentPasswordChange?: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

export function ChangePasswordForm({
  currentPassword,
  newPassword,
  confirmPassword,
  error,
  isLoading,
  isFirstTime,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: ChangePasswordFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <Typography variant="h3" className="text-gray-900">
              Change Password
            </Typography>
            {isFirstTime && (
              <Badge variant="outline" className="mt-1 border-amber-300 bg-amber-50 text-amber-700">
                First-time login required
              </Badge>
            )}
          </div>
        </div>
        
        {isFirstTime && (
          <Typography variant="body" className="text-gray-600">
            For security reasons, you must set a new password before continuing.
          </Typography>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {!isFirstTime && (
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-800">
              Current Password
            </label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => onCurrentPasswordChange?.(e.target.value)}
                disabled={isLoading}
                required
                className="pr-12 bg-white border-gray-300 shadow-sm focus:border-primary focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isLoading}
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-800">
            New Password
          </label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password (8-128 characters)"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              disabled={isLoading}
              required
              minLength={8}
              maxLength={128}
              className="pr-12 bg-white border-gray-300 shadow-sm focus:border-primary focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading}
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <Typography variant="caption" className="text-gray-500">
            Must be 8-128 characters long
          </Typography>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800">
            Confirm New Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              disabled={isLoading}
              required
              className="pr-12 bg-white border-gray-300 shadow-sm focus:border-primary focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <Typography variant="small" className="font-semibold text-red-900">
              Error
            </Typography>
            <Typography variant="caption" className="text-red-700 mt-1">
              {error}
            </Typography>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Changing Password...</span>
          </div>
        ) : (
          "Change Password"
        )}
      </Button>
    </form>
  );
}
