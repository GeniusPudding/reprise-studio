import type { SongConfig } from '@/engine/types';
import { seeingFarthestPalette } from '@/theme/palettes/seeing-farthest';

export const seeingFarthestConfig: SongConfig = {
  songId: 'seeing-farthest',
  audioSrc: '/audio/seeing-farthest.mp3',
  timelineSrc: '/data/songs/seeing-farthest/timeline.json',
  palette: seeingFarthestPalette,
  sceneMap: {
    intro:       'SceneSilence',
    verse1:      'SceneUnderstanding',
    verse2:      'SceneBrokenWings',
    pre_chorus:  'SceneRainSnow',
    chorus1:     'SceneSunrise',
    chorus2:     'SceneSunrise',
    chorus_last: 'SceneSkyward',
    bridge:      'SceneBrokenWings',
    outro:       'SceneFin',
  },
};
