import type { SceneProps } from '@/engine/types';
import { BaseScene } from './_BaseScene';

/** Placeholder — 尾幕 (final fade with lingering warmth). Implement in Phase 3. */
export function SceneFin({ palette }: SceneProps) {
  return (
    <BaseScene id="fin">
      <div style={{ position: 'absolute', inset: 0, background: palette.primary, opacity: 0.4 }} />
    </BaseScene>
  );
}
