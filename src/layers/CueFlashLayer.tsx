import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { Cue } from '@/engine/types';
import { tokens } from '@/theme/tokens';

interface CueFlashLayerProps {
  recentCue: Cue | null;
  currentTime: number;
}

/**
 * Renders a momentary flash/iris effect when a cue fires.
 *
 * A cue is "active" for a short window after its timestamp. After that
 * the layer renders nothing, so there's no lingering DOM cost.
 */
export function CueFlashLayer({ recentCue, currentTime }: CueFlashLayerProps) {
  const [activeCue, setActiveCue] = useState<Cue | null>(null);

  useEffect(() => {
    if (!recentCue) return;
    const age = currentTime - recentCue.t;
    const lifetime = tokens.motion.cueFlashIn + tokens.motion.cueFlashOut;
    if (age >= 0 && age <= lifetime) {
      setActiveCue(recentCue);
    } else {
      setActiveCue(null);
    }
  }, [recentCue, currentTime]);

  return (
    <AnimatePresence>
      {activeCue && (
        <motion.div
          key={activeCue.t}
          initial={{ opacity: 0 }}
          animate={{ opacity: flashOpacity(activeCue.type) }}
          exit={{ opacity: 0 }}
          transition={{
            duration: tokens.motion.cueFlashIn,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 50,
            background: flashColor(activeCue.type),
            mixBlendMode: 'screen',
          }}
        />
      )}
    </AnimatePresence>
  );
}

function flashColor(type: Cue['type']): string {
  switch (type) {
    case 'flash-warm': return tokens.color.warm;
    case 'flash-cold': return tokens.color.cold;
    case 'iris-open':  return tokens.color.sun;
    case 'iris-close': return tokens.color.ink;
    default:           return tokens.color.paper;
  }
}

function flashOpacity(type: Cue['type']): number {
  switch (type) {
    case 'flash-warm': return 0.55;
    case 'flash-cold': return 0.4;
    case 'iris-open':  return 0.65;
    case 'iris-close': return 0.5;
    case 'shake-subtle': return 0;
    case 'static-burst': return 0.3;
    default: return 0.3;
  }
}
