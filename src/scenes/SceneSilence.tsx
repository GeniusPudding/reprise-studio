import { motion } from 'motion/react';
import { useMemo } from 'react';
import type { SceneProps } from '@/engine/types';
import { tokens } from '@/theme/tokens';
import { BaseScene } from './_BaseScene';
import styles from './SceneSilence.module.css';

/**
 * SceneSilence — 寂靜
 *
 * Reference implementation. All future scene agents should copy this pattern:
 *
 *   1. Read palette + energy from props; never reach for global state.
 *   2. Drive every visual constant through CSS custom properties on a single
 *      wrapper, set from React. The CSS module then references `var(--…)`
 *      and stays free of literal colors / magic numbers.
 *   3. Use Motion only for values React owns (here: moon scale). Use plain
 *      CSS keyframes for the slow ambient loops (the fog drift) — cheaper
 *      and easier to disable for `prefers-reduced-motion`.
 *   4. Crossfade between scenes is BaseScene's job. This file does not write
 *      its own enter/exit animation.
 *
 * Imagery (per docs/DESIGN.md): moon, still water, low horizon. Cold mood.
 */
export function SceneSilence({ energy, palette }: SceneProps) {
  const moonScale = 1 + energy * 0.04;

  const cssVars = useMemo(
    () =>
      ({
        '--scene-primary': palette.primary,
        '--scene-accent': palette.accent,
        '--scene-ink': tokens.color.ink,
        '--scene-paper': tokens.color.paper,
        '--scene-mist': tokens.color.mist,
        '--scene-cold': tokens.color.cold,
        '--scene-brightness': 0.55 + energy * 0.2,
        '--scene-vignette': tokens.layout.vignetteIntensity,
      }) as React.CSSProperties,
    [palette.primary, palette.accent, energy],
  );

  return (
    <BaseScene id="silence">
      <div className={styles.scene} style={cssVars}>
        <div className={styles.background} aria-hidden />
        <div className={styles.water} aria-hidden />
        <div className={styles.fog} aria-hidden />
        <div className={styles.horizon} aria-hidden />
        <motion.div
          className={styles.moon}
          animate={{ scale: moonScale }}
          transition={{ duration: tokens.motion.breathPeriod, ease: 'easeInOut' }}
          aria-hidden
        />
        <div className={styles.vignette} aria-hidden />
      </div>
    </BaseScene>
  );
}
