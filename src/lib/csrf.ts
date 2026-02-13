/**
 * CSRF Token Management
 * Protects against Cross-Site Request Forgery attacks
 * 
 * CSRF tokens should be:
 * - Stored in sessionStorage (not localStorage)
 * - Included in headers for state-changing requests
 * - Validated on backend for POST/PUT/PATCH/DELETE
 * 
 * @example
 * ```tsx
 * // In http.ts
 * const csrfToken = CSRFProtection.getToken();
 * headers['X-CSRF-Token'] = csrfToken;
 * 
 * // In login flow
 * CSRFProtection.generateToken(); // Create new token
 * 
 * // On logout
 * CSRFProtection.clearToken();
 * ```
 */

const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

export class CSRFProtection {
  /**
   * Generate a cryptographically secure random CSRF token
   * 
   * @returns 64-character hex string
   */
  static generateToken(): string {
    if (typeof window === 'undefined') return '';
    
    // Generate 32 random bytes (256 bits)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    
    // Convert to hex string
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get existing CSRF token or create a new one
   * 
   * @returns CSRF token string
   * 
   * @example
   * ```ts
   * const token = CSRFProtection.getToken();
   * ```
   */
  static getToken(): string {
    if (typeof window === 'undefined') return '';
    
    let token = sessionStorage.getItem(CSRF_TOKEN_KEY);
    
    if (!token) {
      token = this.generateToken();
      sessionStorage.setItem(CSRF_TOKEN_KEY, token);
    }
    
    return token;
  }

  /**
   * Set CSRF token manually
   * Useful when receiving token from server
   * 
   * @param token - CSRF token to store
   */
  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  }

  /**
   * Clear CSRF token (call on logout)
   * 
   * @example
   * ```ts
   * CSRFProtection.clearToken();
   * ```
   */
  static clearToken(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
  }

  /**
   * Get the header name used for CSRF token
   */
  static getHeaderName(): string {
    return CSRF_HEADER_NAME;
  }

  /**
   * Check if a request method requires CSRF protection
   * 
   * @param method - HTTP method
   * @returns true if method requires CSRF token
   */
  static requiresCSRF(method: string): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  }
}
