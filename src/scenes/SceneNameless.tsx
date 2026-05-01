import { useMemo } from 'react';
import type { SceneProps } from '@/engine/types';
import { tokens } from '@/theme/tokens';
import { BaseScene } from './_BaseScene';
import styles from './SceneNameless.module.css';

/**
 * SceneNameless — 「沒有姓名的存在」
 *
 * Visualizes the chorus of 一直很安靜: "明明是三個人的電影 / 我卻始終
 * 不能有姓名." Three vertical beams stand low-mid, equally spaced. The
 * middle beam is the absent one — its alpha is inversely tied to energy,
 * so the louder the music swells, the more invisible it becomes. There
 * is no consoling reveal: the missing presence stays missing.
 *
 * Pattern follows SceneSilence: every visual constant flows through CSS
 * custom properties set on a wrapper from React; the CSS module derives
 * tints via `color-mix()` from those vars. No literal hex / rgba.
 *
 * Imagery (per docs/DESIGN.md and the scene brief):
 *   1. Three vertical beams (one near-invisible) — the "三人電影 / 沒有姓名"
 *   2. Empty name plate — a thin-stroked, contentless rectangle
 *   3. Low horizon line + 60%+ negative space — the song of "沒有"
 *
 * Cold-only palette. No warm tones.
 */
export function SceneNameless({ energy, palette }: SceneProps) {
  // The absent beam's alpha is INVERSELY proportional to energy.
  // Base 0.12, swing 0.06: louder → less visible. Capped under 0.15 per brief.
  const absentAlpha = 0.12 + (1 - energy) * 0.06;

  // Restrained brightness curve (chorus is colder, not brighter).
  const sceneBrightness = 0.55 + energy * 0.18;

  // Visible beams stay restrained (alpha 0.4–0.6 per brief).
  const visibleBeamAlpha = 0.4 + energy * 0.2;

  // Horizon glow follows energy lightly.
  const horizonGlow = 0.15 + energy * 0.08;

  const cssVars = useMemo(
    () =>
      ({
        '--scene-primary': palette.primary,
        '--scene-accent': palette.accent,
        '--scene-ink': tokens.color.ink,
        '--scene-paper': tokens.color.paper,
        '--scene-mist': tokens.color.mist,
        '--scene-cold': tokens.color.cold,
        '--scene-brightness': sceneBrightness,
        '--scene-vignette': tokens.layout.vignetteIntensity,
        '--scene-absent-alpha': absentAlpha,
        '--scene-visible-alpha': visibleBeamAlpha,
        '--scene-horizon-glow': horizonGlow,
      }) as React.CSSProperties,
    [
      palette.primary,
      palette.accent,
      sceneBrightness,
      absentAlpha,
      visibleBeamAlpha,
      horizonGlow,
    ],
  );

  return (
    <BaseScene id="nameless">
      <div className={styles.scene} style={cssVars}>
        <div className={styles.background} aria-hidden />
        <div className={styles.horizon} aria-hidden />
        {/*
          Three beams, equally spaced on the lower-mid band.
          The MIDDLE one is the absent presence — barely visible, heavier blur.
          Order matters only for the DOM; positions are absolute.
        */}
        <div className={`${styles.beam} ${styles.beamLeft}`} aria-hidden />
        <div className={`${styles.beam} ${styles.beamAbsent}`} aria-hidden />
        <div className={`${styles.beam} ${styles.beamRight}`} aria-hidden />
        {/*
          Empty name plate — thin stroke only, no fill, no text. Offset from
          centre, tiny horizontal drift driven by a CSS keyframe (period 8s,
          amplitude < 2px). Disabled under prefers-reduced-motion.
        */}
        <div className={styles.plate} aria-hidden />
        <div className={styles.vignette} aria-hidden />
      </div>
    </BaseScene>
  );
}
