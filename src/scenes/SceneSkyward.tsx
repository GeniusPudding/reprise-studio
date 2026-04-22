import type { SceneProps } from '@/engine/types';
import { BaseScene } from './_BaseScene';

/** Placeholder — 仰望星空 (stars and light pillars). Implement in Phase 3. */
export function SceneSkyward({ palette }: SceneProps) {
  return (
    <BaseScene id="skyward">
      <div style={{ position: 'absolute', inset: 0, background: palette.primary, opacity: 0.5 }} />
    </BaseScene>
  );
}
