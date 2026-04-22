import type { SceneProps } from '@/engine/types';
import { BaseScene } from './_BaseScene';

/** Placeholder — 懂得 (twin beams + drifting light orbs). Implement in Phase 3. */
export function SceneUnderstanding({ palette }: SceneProps) {
  return (
    <BaseScene id="understanding">
      <div style={{ position: 'absolute', inset: 0, background: palette.primary, opacity: 0.5 }} />
    </BaseScene>
  );
}
