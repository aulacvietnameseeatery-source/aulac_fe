import { jwtDecode } from 'jwt-decode';

/**
 * Shape of decoded JWT token from backend
 */
export interface DecodedToken {
  sub: string; // user_id
  unique_name: string; // username
  permission: string | string[]; // Can be single string or array
  role: string | string[]; // Can be single string or array
  exp: number; // Expiration timestamp
  iat?: number; // Issued at timestamp
}

/**
 * Decodes a JWT token and returns its payload
 * 
 * @param token - JWT token string
 * @returns Decoded token object or null if invalid
 * 
 * @example
 * ```ts
 * const token = "eyJhbGciOiJIUzI1NiIs...";
 * const decoded = decodeToken(token);
 * if (decoded) {
 *   console.log(decoded.unique_name); // "john_doe"
 * }
 * ```
 */
export function decodeToken(token: string | null | undefined): DecodedToken | null {
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Checks if a token is expired
 * 
 * @param token - JWT token string
 * @returns true if expired or invalid, false otherwise
 * 
 * @example
 * ```ts
 * if (isTokenExpired(token)) {
 *   // Redirect to login
 * }
 * ```
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Gets time remaining until token expiration in seconds
 * 
 * @param token - JWT token string
 * @returns Seconds until expiration, or 0 if expired/invalid
 */
export function getTokenExpirationTime(token: string | null | undefined): number {
  const decoded = decodeToken(token);
  if (!decoded) return 0;

  const currentTime = Math.floor(Date.now() / 1000);
  const remaining = decoded.exp - currentTime;
  return remaining > 0 ? remaining : 0;
}

/**
 * Extracts permissions from a JWT token, normalizing to array format
 * Handles both single string and array of strings
 * 
 * @param token - JWT token string
 * @returns Array of permission strings
 * 
 * @example
 * ```ts
 * const permissions = getPermissions(token);
 * // ["ACCOUNT:READ", "ACCOUNT:CREATE", "DISH:READ"]
 * ```
 */
export function getPermissions(token: string | null | undefined): string[] {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.permission) return [];

  // Normalize to array
  if (Array.isArray(decoded.permission)) {
    return decoded.permission;
  }

  return [decoded.permission];
}

/**
 * Extracts roles from a JWT token, normalizing to array format
 * 
 * @param token - JWT token string
 * @returns Array of role strings
 */
export function getRoles(token: string | null | undefined): string[] {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.role) return [];

  // Normalize to array
  if (Array.isArray(decoded.role)) {
    return decoded.role;
  }

  return [decoded.role];
}

/**
 * Checks if user has a specific permission
 * 
 * @param token - JWT token string
 * @param permission - Permission to check (e.g., "ACCOUNT:READ")
 * @returns true if user has the permission
 * 
 * @example
 * ```ts
 * if (hasPermission(token, "ACCOUNT:CREATE")) {
 *   // Show create button
 * }
 * ```
 */
export function hasPermission(
  token: string | null | undefined,
  permission: string
): boolean {
  const permissions = getPermissions(token);
  return permissions.includes(permission);
}

/**
 * Checks if user has ANY of the specified permissions
 * 
 * @param token - JWT token string
 * @param permissionsToCheck - Array of permissions to check
 * @returns true if user has at least one permission
 * 
 * @example
 * ```ts
 * // User can edit OR update accounts
 * if (hasAnyPermission(token, ["ACCOUNT:EDIT", "ACCOUNT:UPDATE"])) {
 *   // Show edit form
 * }
 * ```
 */
export function hasAnyPermission(
  token: string | null | undefined,
  permissionsToCheck: string[]
): boolean {
  const permissions = getPermissions(token);
  return permissionsToCheck.some((p) => permissions.includes(p));
}

/**
 * Checks if user has ALL of the specified permissions
 * 
 * @param token - JWT token string
 * @param permissionsToCheck - Array of permissions to check
 * @returns true if user has all permissions
 * 
 * @example
 * ```ts
 * // User needs both read AND create permissions
 * if (hasAllPermissions(token, ["ACCOUNT:READ", "ACCOUNT:CREATE"])) {
 *   // Show advanced admin panel
 * }
 * ```
 */
export function hasAllPermissions(
  token: string | null | undefined,
  permissionsToCheck: string[]
): boolean {
  const permissions = getPermissions(token);
  return permissionsToCheck.every((p) => permissions.includes(p));
}

/**
 * Gets user information from token
 * 
 * @param token - JWT token string
 * @returns User info object or null
 */
export function getUserInfo(token: string | null | undefined): {
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
} | null {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    userId: decoded.sub,
    username: decoded.unique_name,
    roles: getRoles(token),
    permissions: getPermissions(token),
  };
}

// NOTE: Frontend permissions are UX only - always validate on backend
