import { useEffect, useState } from 'react';

/**
 * Fake energy curve for dev when there's no real audio.
 *
 * Produces a slow sin wave plus a section-aware bias so visuals don't look
 * frozen during scrubber-only playback. Replace with `useAudioEnergy` once
 * a real audio file is wired in.
 */
export function useFakeEnergy(currentTime: number, isPlaying: boolean): number {
  const [energy, setEnergy] = useState(0.3);

  useEffect(() => {
    if (!isPlaying) {
      setEnergy(0.3);
      return;
    }
    const id = window.setInterval(() => {
      const base = 0.4;
      const wave = 0.25 * Math.sin(currentTime * 0.6);
      const noise = 0.05 * (Math.random() - 0.5);
      setEnergy(Math.max(0, Math.min(1, base + wave + noise)));
    }, 80);
    return () => window.clearInterval(id);
  }, [currentTime, isPlaying]);

  return energy;
}
