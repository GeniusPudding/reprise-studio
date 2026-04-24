import type { SongConfig, Timeline } from './types';

/**
 * Build-time discovery of every song under `data/songs/<id>/`.
 *
 * Vite's `import.meta.glob` enumerates matching files at bundle time and
 * returns a record of dynamic-import loaders. The loaders are async, so we
 * pull a song's config + timeline lazily — useful when we eventually have
 * many songs and don't want to bundle them all up-front.
 */
const timelineLoaders = import.meta.glob<Timeline>(
  '/data/songs/*/timeline.json',
  { import: 'default' },
);

const configLoaders = import.meta.glob<SongConfig>(
  '/data/songs/*/config.ts',
  { import: 'default' },
);

export interface LoadedSong {
  config: SongConfig;
  timeline: Timeline;
}

export function listSongIds(): string[] {
  return Object.keys(timelineLoaders)
    .map((p) => p.match(/\/data\/songs\/([^/]+)\/timeline\.json$/)?.[1])
    .filter((id): id is string => Boolean(id))
    .sort();
}

export async function loadSong(songId: string): Promise<LoadedSong | null> {
  const tlKey = `/data/songs/${songId}/timeline.json`;
  const cfgKey = `/data/songs/${songId}/config.ts`;
  const tlLoader = timelineLoaders[tlKey];
  const cfgLoader = configLoaders[cfgKey];
  if (!tlLoader || !cfgLoader) return null;
  const [timeline, config] = await Promise.all([tlLoader(), cfgLoader()]);
  return { timeline, config };
}
