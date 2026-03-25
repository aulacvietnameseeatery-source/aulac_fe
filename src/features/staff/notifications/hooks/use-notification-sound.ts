"use client";

import { useCallback, useRef } from "react";

// Sound configurations per priority — uses Web Audio API oscillator tones
const SOUND_CONFIG: Record<string, { frequency: number; duration: number; type: OscillatorType; repeat?: number }> = {
  notification_critical: { frequency: 880, duration: 200, type: "square", repeat: 3 },
  notification_high: { frequency: 660, duration: 180, type: "triangle", repeat: 2 },
  notification_normal: { frequency: 520, duration: 150, type: "sine", repeat: 1 },
  notification_low: { frequency: 440, duration: 120, type: "sine", repeat: 1 },
};

// Map priority string → sound key
const PRIORITY_SOUND_MAP: Record<string, string> = {
  Critical: "notification_critical",
  High: "notification_high",
  Normal: "notification_normal",
  Low: "notification_low",
};

function playTone(
  audioCtx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType,
  startTime: number
) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  // Smooth envelope to avoid clicks
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration / 1000);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration / 1000);
}

/**
 * Hook that provides a play function for notification sounds via Web Audio API.
 * Respects browser autoplay policies — sound only triggers after user interaction.
 */
export function useNotificationSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const play = useCallback((soundKey?: string | null, priority?: string | null) => {
    const key = soundKey ?? (priority ? PRIORITY_SOUND_MAP[priority] : null) ?? "notification_normal";
    const config = SOUND_CONFIG[key] ?? SOUND_CONFIG.notification_normal;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }

      const ctx = audioCtxRef.current;

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const gap = 0.15; // gap between repeated beeps
      const repeat = config.repeat ?? 1;

      for (let i = 0; i < repeat; i++) {
        playTone(ctx, config.frequency, config.duration, config.type, now + i * (config.duration / 1000 + gap));
      }
    } catch {
      // Silently fail if Web Audio API is not available
    }
  }, []);

  return { play };
}
