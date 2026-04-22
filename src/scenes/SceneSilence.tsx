import { motion } from 'motion/react';
import { useMemo } from 'react';
import type { SceneProps } from '@/engine/types';
import { tokens } from '@/theme/tokens';
import { BaseScene } from './_BaseScene';
import styles from './SceneSilence.module.css';

export function SceneSilence({ energy, palette }: SceneProps) {
  const bgBrightness = 0.6 + energy * 0.25;
  const moonScale = 1 + energy * 0.04;

  const bgStyle = useMemo(
    () => ({
      background: `radial-gradient(ellipse at 50% 60%, ${palette.primary} 0%, ${tokens.color.ink} 70%)`,
      filter: `brightness(${bgBrightness})`,
    }),
    [palette.primary, bgBrightness],
  );

  return (
    <BaseScene id="silence">
      <div className={styles.scene} style={bgStyle}>
        <div className={styles.fog} aria-hidden />
        <div className={styles.horizon} aria-hidden />
        <motion.div
          className={styles.moon}
          animate={{ scale: moonScale }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          aria-hidden
        />
      </div>
    </BaseScene>
  );
}
