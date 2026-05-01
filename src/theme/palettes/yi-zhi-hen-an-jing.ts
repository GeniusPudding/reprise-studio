import { color } from '@/theme/tokens';
import type { Palette } from '@/engine/types';

/**
 * 一直很安靜 — 「沒有姓名的存在」frame.
 *
 * Cold-dominant throughout. Critical departure from defaults: `ache` does
 * NOT use the wound (酒紅) base — this song is about silent withdrawal,
 * not romantic wounding. The chorus is colder than the verse, never warmer.
 *
 * Active moods in this song's sections: still, soft, ache.
 * The other three (open, defy, fin) are unused by the timeline but kept
 * as cold-leaning fallbacks for safety.
 */
export const yiZhiHenAnJingPalette: Palette = {
  // intro / solo / bridge — 深藍灰夜霧
  still: { primary: color.ink,   accent: color.cold,  mood: 'still' },

  // verse — 冷感街燈光暈、無暖意
  soft:  { primary: color.cold,  accent: color.mist,  mood: 'soft'  },

  // chorus — 冷主導 + paper 作為「淚 / 負空間 / 微光見證」
  // NOT wound, NOT blush. The hurt here is silent, not bloody.
  ache:  { primary: color.cold,  accent: color.paper, mood: 'ache'  },

  // unused by this song — cold-aligned fallbacks
  open:  { primary: color.cold,  accent: color.paper, mood: 'open'  },
  defy:  { primary: color.ink,   accent: color.cold,  mood: 'defy'  },
  fin:   { primary: color.mist,  accent: color.cold,  mood: 'fin'   },
};
