import type { Timeline } from '@/engine/types';

/**
 * Load a timeline JSON from a URL and do cheap structural validation.
 * Heavy validation (schema, overlap checks) lives in `scripts/validate_timeline.py`.
 */
export async function loadTimeline(url: string): Promise<Timeline> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load timeline: ${res.status} ${url}`);
  const data = (await res.json()) as Timeline;
  assertTimeline(data);
  return data;
}

function assertTimeline(t: Timeline): void {
  if (!t.meta || !t.sections || !t.lyrics || !t.cues) {
    throw new Error('Timeline missing required top-level keys (meta/sections/lyrics/cues).');
  }
  if (typeof t.meta.duration !== 'number' || t.meta.duration <= 0) {
    throw new Error('Timeline meta.duration must be a positive number.');
  }
  for (let i = 1; i < t.lyrics.length; i += 1) {
    const prev = t.lyrics[i - 1];
    const cur = t.lyrics[i];
    if (cur.t < prev.t) {
      throw new Error(`Lyric timestamps must be non-decreasing (index ${i}).`);
    }
  }
}
