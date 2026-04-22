/**
 * Scene 元件範例 — SceneSilence
 *
 * 這是建議的 scene 元件寫法範本。所有 scene 都應遵循以下原則：
 *
 * 1. 只消費 props，不讀全局狀態
 * 2. 顏色、時長從 tokens / palette 讀
 * 3. 動畫用 CSS + Motion，避免 requestAnimationFrame 手刻
 *    （除非是粒子等大量元素才用 Canvas）
 * 4. 單一職責：一個 scene 只負責一段情緒的視覺語彙
 *
 * 對應 DESIGN.md 的「寂靜」意象：月、霧、地平線、冷色
 */

import { motion } from 'motion/react';
import { useMemo } from 'react';
import type { SceneProps } from '@/engine/types';
import { tokens } from '@/theme/tokens';
import styles from './SceneSilence.module.css';

export function SceneSilence({ progress, energy, palette }: SceneProps) {
  // energy: 0–1，來自 useAudioEnergy，用來讓背景呼吸
  // progress: 0–1，當前 scene 已經播了多少（做進退場用）
  // palette: 當首歌的色票 mood 對應

  const bgBrightness = 0.6 + energy * 0.25;  // 能量越高背景越亮（但幅度要小）
  const moonScale = 1 + energy * 0.04;       // 月亮輕微呼吸

  const bgStyle = useMemo(() => ({
    background: `radial-gradient(ellipse at 50% 60%,
      ${palette.primary} 0%,
      ${tokens.color.ink} 70%)`,
    filter: `brightness(${bgBrightness})`,
  }), [palette.primary, bgBrightness]);

  return (
    <motion.div
      className={styles.scene}
      style={bgStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: tokens.motion.sceneTransition }}
    >
      {/* 霧層 */}
      <div className={styles.fog} aria-hidden />

      {/* 地平線 */}
      <div className={styles.horizon} aria-hidden />

      {/* 月 */}
      <motion.div
        className={styles.moon}
        animate={{ scale: moonScale }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        aria-hidden
      />
    </motion.div>
  );
}

/* -----------------------------------------------------------
 * 對應的 SceneSilence.module.css 大致長這樣：
 *
 * .scene {
 *   position: absolute;
 *   inset: 0;
 *   overflow: hidden;
 * }
 *
 * .fog {
 *   position: absolute;
 *   inset: -10%;
 *   background:
 *     radial-gradient(600px 300px at 30% 40%,
 *       rgba(107, 140, 168, 0.25), transparent 60%),
 *     radial-gradient(800px 400px at 70% 70%,
 *       rgba(107, 140, 168, 0.18), transparent 60%);
 *   filter: blur(30px);
 *   animation: drift 18s ease-in-out infinite alternate;
 * }
 *
 * .horizon {
 *   position: absolute;
 *   left: 0;
 *   right: 0;
 *   top: 62%;
 *   height: 1px;
 *   background: linear-gradient(90deg,
 *     transparent,
 *     rgba(220, 228, 234, 0.5),
 *     transparent);
 * }
 *
 * .moon {
 *   position: absolute;
 *   left: 50%;
 *   top: 38%;
 *   width: 180px;
 *   height: 180px;
 *   border-radius: 50%;
 *   transform: translate(-50%, -50%);
 *   background: radial-gradient(circle at 35% 35%,
 *     #e8efe4, #8a9aa6 70%, transparent 72%);
 *   box-shadow: 0 0 120px 20px rgba(220, 228, 234, 0.15);
 * }
 *
 * @keyframes drift {
 *   0% { transform: translate(-3%, -2%) scale(1); }
 *   100% { transform: translate(4%, 3%) scale(1.08); }
 * }
 * ----------------------------------------------------------- */
