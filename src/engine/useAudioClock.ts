import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { Clock } from './clock';

/**
 * Drives a high-precision clock from an HTMLAudioElement.
 *
 * Reads `audio.currentTime` on each animation frame. Audio playback is the
 * authoritative time source — visuals must follow it, never the other way.
 */
export function useAudioClock(audioRef: RefObject<HTMLAudioElement | null>): Clock {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onLoaded = () => setDuration(el.duration || 0);

    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onPause);
    el.addEventListener('loadedmetadata', onLoaded);

    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onPause);
      el.removeEventListener('loadedmetadata', onLoaded);
    };
  }, [audioRef]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const tick = () => {
      setCurrentTime(el.currentTime);
      rafRef.current = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      setCurrentTime(el.currentTime);
    }

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [audioRef, isPlaying]);

  const play = useCallback(() => {
    audioRef.current?.play();
  }, [audioRef]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, [audioRef]);

  const seek = useCallback((t: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = t;
    setCurrentTime(t);
  }, [audioRef]);

  return { currentTime, duration, isPlaying, play, pause, seek };
}
