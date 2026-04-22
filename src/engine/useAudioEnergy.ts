import { useEffect, useRef, useState, type RefObject } from 'react';

export interface AudioEnergy {
  rms: number;
  smoothed: number;
}

/**
 * Real-time RMS energy from an HTMLAudioElement via Web Audio AnalyserNode.
 *
 * Returns both the raw RMS (0–1) and a low-pass smoothed value to avoid
 * frame-by-frame jitter in visuals. AudioContext is created lazily on first
 * play() because browsers require a user gesture.
 */
export function useAudioEnergy(audioRef: RefObject<HTMLAudioElement | null>): AudioEnergy {
  const [rms, setRms] = useState(0);
  const [smoothed, setSmoothed] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const smoothedRef = useRef(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const ensureGraph = () => {
      if (ctxRef.current) return;
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      const src = ctx.createMediaElementSource(el);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      sourceRef.current = src;
      analyserRef.current = analyser;
    };

    const onPlay = () => {
      ensureGraph();
      ctxRef.current?.resume();
      tick();
    };

    const onPause = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };

    const buf = new Uint8Array(1024);
    const SMOOTHING = 0.12;

    const tick = () => {
      const analyser = analyserRef.current;
      if (!analyser) return;
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i += 1) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const r = Math.sqrt(sum / buf.length);
      smoothedRef.current = smoothedRef.current * (1 - SMOOTHING) + r * SMOOTHING;
      setRms(r);
      setSmoothed(smoothedRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onPause);

    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onPause);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [audioRef]);

  return { rms, smoothed };
}
