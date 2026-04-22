import { color } from '@/theme/tokens';
import type { Palette } from '@/engine/types';

export const seeingFarthestPalette: Palette = {
  still: { primary: color.ink,   accent: color.cold,  mood: 'still' },
  soft:  { primary: color.mist,  accent: color.cold,  mood: 'soft'  },
  ache:  { primary: color.wound, accent: color.blush, mood: 'ache'  },
  open:  { primary: color.sun,   accent: color.warm,  mood: 'open'  },
  defy:  { primary: color.ink,   accent: color.sun,   mood: 'defy'  },
  fin:   { primary: color.paper, accent: color.wound, mood: 'fin'   },
};
