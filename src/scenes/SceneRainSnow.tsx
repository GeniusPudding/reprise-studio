import type { SceneProps } from '@/engine/types';
import { BaseScene } from './_BaseScene';

/** Placeholder — 雨雪堅持 (cold rain with warm core). Implement in Phase 3. */
export function SceneRainSnow({ palette }: SceneProps) {
  return (
    <BaseScene id="rain-snow">
      <div style={{ position: 'absolute', inset: 0, background: palette.primary, opacity: 0.5 }} />
    </BaseScene>
  );
}
