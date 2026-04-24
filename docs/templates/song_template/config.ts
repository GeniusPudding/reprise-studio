import type { SongConfig } from '@/engine/types';
import { templatePalette } from '@/theme/palettes/_template';

const config: SongConfig = {
  songId: 'SONG_ID',
  audioSrc: '/audio/SONG_ID.mp3',
  timelineSrc: '/data/songs/SONG_ID/timeline.json',
  palette: templatePalette,
  sceneMap: {
    intro:       'SceneSilence',
    verse1:      'SceneUnderstanding',
    chorus1:     'SceneSunrise',
    outro:       'SceneFin',
  },
};

export default config;
