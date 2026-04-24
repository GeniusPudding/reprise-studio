import { useCallback, useEffect, useRef, useState } from 'react';
import type { Clock } from './clock';

/**
 * Audio-less clock for dev: drives `currentTime` from a slider / keyboard /
 * RAF tick, with the same shape as `useAudioClock`. Lets us build and test
 * Phase 1 + scenes without needing real audio files.
 */
export function useScrubber(duration: number): Clock {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);

  const play = useCallback(() => {
    lastFrameRef.current = performance.now();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => setIsPlaying(false), []);

  const seek = useCallback(
    (t: number) => setCurrentTime(Math.max(0, Math.min(duration, t))),
    [duration],
  );

  useEffect(() => {
    if (!isPlaying) return;
    const tick = () => {
      const now = performance.now();
      const dt = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;
      setCurrentTime((t) => {
        const next = t + dt;
        if (next >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, duration]);

  return { currentTime, duration, isPlaying, play, pause, seek };
}
