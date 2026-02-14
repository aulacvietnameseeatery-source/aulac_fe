/**
 * Cross-tab authentication synchronization
 * Syncs login/logout events across browser tabs using BroadcastChannel API
 * 
 * @example
 * ```tsx
 * // In AuthProvider
 * useEffect(() => {
 *   const unsubscribe = authSync.subscribe((event) => {
 *     if (event.type === 'LOGIN') {
 *       // Sync login to this tab
 *     } else if (event.type === 'LOGOUT') {
 *       // Sync logout to this tab
 *     }
 *   });
 * 
 *   return () => unsubscribe();
 * }, []);
 * ```
 */

export type AuthSyncEvent = {
  type: 'LOGIN' | 'LOGOUT' | 'TOKEN_UPDATE';
  timestamp: number;
  token?: string;
};

class AuthSync {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(event: AuthSyncEvent) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('auth_sync');
      this.channel.onmessage = (event) => {
        this.notifyListeners(event.data);
      };
    } else if (typeof window !== 'undefined') {
      // Fallback to localStorage events for older browsers
      (window as Window).addEventListener('storage', this.handleStorageEvent);
    }
  }

  /**
   * Handle localStorage events (fallback for browsers without BroadcastChannel)
   */
  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key === 'auth_sync_event' && event.newValue) {
      try {
        const syncEvent: AuthSyncEvent = JSON.parse(event.newValue);
        this.notifyListeners(syncEvent);
      } catch (error) {
        console.error('[AuthSync] Failed to parse storage event:', error);
      }
    }
  };

  /**
   * Notify all listeners
   */
  private notifyListeners(event: AuthSyncEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[AuthSync] Listener error:', error);
      }
    });
  }

  /**
   * Broadcast auth event to other tabs
   * 
   * @param event - Auth event to broadcast
   * 
   * @example
   * ```ts
   * authSync.broadcast({
   *   type: 'LOGIN',
   *   timestamp: Date.now(),
   *   token: 'new_token'
   * });
   * ```
   */
  broadcast(event: AuthSyncEvent) {
    if (this.channel) {
      this.channel.postMessage(event);
    } else if (typeof window !== 'undefined') {
      // Fallback to localStorage
      localStorage.setItem('auth_sync_event', JSON.stringify(event));
      // Clear immediately to allow same event to fire again
      localStorage.removeItem('auth_sync_event');
    }
  }

  /**
   * Listen for auth events from other tabs
   * 
   * @param callback - Function to call when event is received
   * @returns Unsubscribe function
   * 
   * @example
   * ```ts
   * const unsubscribe = authSync.subscribe((event) => {
   *   console.log('Auth event received:', event.type);
   * });
   * 
   * // Later, cleanup
   * unsubscribe();
   * ```
   */
  subscribe(callback: (event: AuthSyncEvent) => void) {
    this.listeners.add(callback);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Cleanup on unmount
   */
  destroy() {
    if (this.channel) {
      this.channel.close();
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent);
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const authSync = new AuthSync();
