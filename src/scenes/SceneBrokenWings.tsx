import type { SceneProps } from '@/engine/types';
import { BaseScene } from './_BaseScene';

/** Placeholder — 跌斷翅膀 (falling feathers, cracks). Implement in Phase 3. */
export function SceneBrokenWings({ palette }: SceneProps) {
  return (
    <BaseScene id="broken-wings">
      <div style={{ position: 'absolute', inset: 0, background: palette.primary, opacity: 0.5 }} />
    </BaseScene>
  );
}
