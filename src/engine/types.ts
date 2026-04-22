/**
 * Core data types for the timeline-driven MV engine.
 *
 * Timeline JSON is the single source of truth. Scenes consume these
 * types only — they never read raw JSON.
 */

export type SectionType =
  | 'intro'
  | 'verse1'
  | 'verse2'
  | 'verse3'
  | 'pre_chorus'
  | 'chorus1'
  | 'chorus2'
  | 'chorus_last'
  | 'bridge'
  | 'solo'
  | 'outro';

export type Mood =
  | 'still'
  | 'soft'
  | 'ache'
  | 'open'
  | 'defy'
  | 'fin';

export type CueType =
  | 'flash-warm'
  | 'flash-cold'
  | 'color-flip'
  | 'shake-subtle'
  | 'iris-open'
  | 'iris-close'
  | 'static-burst';

export interface TimelineMeta {
  song_id: string;
  title: string;
  artist: string;
  duration: number;
  bpm: number;
  key: string;
  created_at: string;
  version: number;
}

export interface Section {
  t: number;
  end: number;
  type: SectionType;
  mood: Mood;
}

export interface TimelineEntry {
  t: number;
  end: number;
  text: string;
  emphasis?: string[];
  text_en?: string;
  text_romaji?: string;
}

export interface Cue {
  t: number;
  type: CueType;
  label?: string;
}

export interface Timeline {
  meta: TimelineMeta;
  sections: Section[];
  lyrics: TimelineEntry[];
  cues: Cue[];
  beats?: number[];
}

export interface PaletteEntry {
  primary: string;
  accent: string;
  mood: Mood;
}

export type Palette = Record<Mood, PaletteEntry>;

export interface SongConfig {
  songId: string;
  audioSrc: string;
  timelineSrc: string;
  palette: Palette;
  sceneMap: Partial<Record<SectionType, string>>;
}

export interface SceneProps {
  progress: number;
  energy: number;
  section: Section;
  palette: PaletteEntry;
  lyric: TimelineEntry | null;
}
