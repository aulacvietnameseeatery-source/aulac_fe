/**
 * Change Password Request
 * Used for both first-time password change (locked account) and normal password change
 */
export interface ChangePasswordRequest {
  /**
   * Current password
   * Optional for first-time password change (locked account)
   * Required for normal password change
   */
  currentPassword?: string;
  
  /**
   * New password (8-128 characters)
   */
  newPassword: string;
  
  /**
   * Password confirmation (must match newPassword)
   */
  confirmPassword: string;
}
