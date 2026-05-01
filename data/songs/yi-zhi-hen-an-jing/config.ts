import type { SongConfig } from '@/engine/types';
import { templatePalette } from '@/theme/palettes/_template';

const config: SongConfig = {
  songId: 'yi-zhi-hen-an-jing',
  audioSrc: '/audio/yi-zhi-hen-an-jing.mp3',
  timelineSrc: '/data/songs/yi-zhi-hen-an-jing/timeline.json',
  palette: templatePalette,
  sceneMap: {
    intro:       'SceneSilence',
    verse1:      'SceneUnderstanding',
    verse2:      'SceneUnderstanding',
    pre_chorus:  'SceneRainSnow',
    chorus1:     'SceneBrokenWings',
    chorus2:     'SceneBrokenWings',
    chorus_last: 'SceneBrokenWings',
    bridge:      'SceneSilence',
    solo:        'SceneSilence',
    outro:       'SceneFin',
  },
};

export default config;
