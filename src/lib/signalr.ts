/**
 * Singleton SignalR Connection Manager
 *
 * Maintains ONE connection per hub URL across the entire app.
 * Uses reference counting so the connection is only stopped when
 * the last consumer releases it.
 *
 * Usage:
 *   const conn = acquireConnection("/hubs/restaurant", { accessTokenFactory: ... });
 *   conn.on("Event", handler);
 *   // later:
 *   releaseConnection("/hubs/restaurant");
 */

import * as signalR from "@microsoft/signalr";
import { BASE_URL } from "@/lib/http";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AcquireOptions {
  /** Factory that returns the JWT token (called on every reconnect). */
  accessTokenFactory?: () => string;
  /** Reconnect delay sequence. Defaults to [0, 2000, 5000, 10000, 30000]. */
  retryDelays?: number[];
  /** SignalR log level. Defaults to Warning. */
  logLevel?: signalR.LogLevel;
}

interface ManagedConnection {
  connection: signalR.HubConnection;
  refCount: number;
  /** Promise that resolves when the initial .start() settles. */
  startPromise: Promise<void>;
}

// ── Module-level singleton map ─────────────────────────────────────────────

const connections = new Map<string, ManagedConnection>();

/**
 * Build the full hub URL from a relative path.
 * Accepts both "/hubs/restaurant" and full URLs.
 */
function resolveHubUrl(hubPath: string): string {
  if (hubPath.startsWith("http://") || hubPath.startsWith("https://")) {
    return hubPath;
  }
  return `${BASE_URL}${hubPath}`;
}

/**
 * Acquire (or reuse) a SignalR connection to the given hub path.
 *
 * - If a connection already exists and is not Disconnected, it is reused
 *   and the refCount is incremented.
 * - If the existing connection is Disconnected, it is replaced with a fresh one.
 *
 * @returns The shared HubConnection instance.
 */
export function acquireConnection(
  hubPath: string,
  options: AcquireOptions = {}
): signalR.HubConnection {
  const fullUrl = resolveHubUrl(hubPath);
  const existing = connections.get(fullUrl);

  // Reuse healthy connection
  if (
    existing &&
    existing.connection.state !== signalR.HubConnectionState.Disconnected
  ) {
    existing.refCount += 1;
    return existing.connection;
  }

  // Existing connection is dead — clean up before replacing
  if (existing) {
    try {
      existing.connection.stop();
    } catch {
      // ignore
    }
    connections.delete(fullUrl);
  }

  const {
    accessTokenFactory,
    retryDelays = [0, 2000, 5000, 10000, 30000],
    logLevel = signalR.LogLevel.Warning,
  } = options;

  const builder = new signalR.HubConnectionBuilder()
    .withUrl(fullUrl, {
      ...(accessTokenFactory ? { accessTokenFactory } : {}),
    })
    .withAutomaticReconnect(retryDelays)
    .configureLogging(logLevel);

  const connection = builder.build();

  const startPromise = connection.start().catch((err) => {
    console.warn(`[SignalR] Failed to start connection to ${hubPath}:`, err);
  });

  const managed: ManagedConnection = {
    connection,
    refCount: 1,
    startPromise,
  };

  connections.set(fullUrl, managed);

  return connection;
}

/**
 * Wait for the connection's initial .start() to settle.
 * Useful when you need to `invoke()` immediately after acquiring.
 */
export async function waitForStart(hubPath: string): Promise<void> {
  const fullUrl = resolveHubUrl(hubPath);
  const managed = connections.get(fullUrl);
  if (managed) {
    await managed.startPromise;
    if (managed.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`[SignalR] Connection to ${hubPath} is not in Connected state.`);
    }
  }
}

/**
 * Release a reference to the hub connection.
 * When refCount reaches 0, the connection is stopped and removed.
 */
export function releaseConnection(hubPath: string): void {
  const fullUrl = resolveHubUrl(hubPath);
  const managed = connections.get(fullUrl);
  if (!managed) return;

  managed.refCount -= 1;

  if (managed.refCount <= 0) {
    managed.connection.stop().catch(() => {});
    connections.delete(fullUrl);
  }
}

/**
 * Get the current connection for a hub path without changing refCount.
 * Returns null if no connection exists.
 */
export function getConnection(
  hubPath: string
): signalR.HubConnection | null {
  const fullUrl = resolveHubUrl(hubPath);
  return connections.get(fullUrl)?.connection ?? null;
}

/**
 * Check if a connection exists and is in a connected state.
 */
export function isConnected(hubPath: string): boolean {
  const conn = getConnection(hubPath);
  return conn?.state === signalR.HubConnectionState.Connected;
}
