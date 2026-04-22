import { useMemo } from 'react';
import type { Cue, Section, Timeline, TimelineEntry } from './types';

export interface TimelineSnapshot {
  currentLyric: TimelineEntry | null;
  currentSection: Section | null;
  nextCue: Cue | null;
  recentCue: Cue | null;
}

/**
 * Snapshots which lyric/section/cue is active at a given time.
 *
 * Pure derivation from `currentTime` — no internal state. Recomputes
 * every render; for typical timeline sizes (< 1000 entries) this is fine.
 */
export function useTimeline(currentTime: number, timeline: Timeline | null): TimelineSnapshot {
  return useMemo(() => {
    if (!timeline) {
      return { currentLyric: null, currentSection: null, nextCue: null, recentCue: null };
    }

    const currentLyric = timeline.lyrics.find(
      (l) => currentTime >= l.t && currentTime < l.end && l.text.trim() !== '',
    ) ?? null;

    const currentSection = timeline.sections.find(
      (s) => currentTime >= s.t && currentTime < s.end,
    ) ?? null;

    const nextCue = timeline.cues.find((c) => c.t >= currentTime) ?? null;
    const recentCue = [...timeline.cues].reverse().find((c) => c.t <= currentTime) ?? null;

    return { currentLyric, currentSection, nextCue, recentCue };
  }, [currentTime, timeline]);
}
