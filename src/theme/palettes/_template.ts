import { color } from '@/theme/tokens';
import type { Palette } from '@/engine/types';

/**
 * Template palette. Copy this file, rename, tweak per song.
 * Keep `mood` keys identical across palettes so scenes can rely on them.
 */
export const templatePalette: Palette = {
  still: { primary: color.ink,   accent: color.cold,  mood: 'still' },
  soft:  { primary: color.mist,  accent: color.cold,  mood: 'soft'  },
  ache:  { primary: color.wound, accent: color.blush, mood: 'ache'  },
  open:  { primary: color.sun,   accent: color.warm,  mood: 'open'  },
  defy:  { primary: color.ink,   accent: color.sun,   mood: 'defy'  },
  fin:   { primary: color.paper, accent: color.wound, mood: 'fin'   },
};
