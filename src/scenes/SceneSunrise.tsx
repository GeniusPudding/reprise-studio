import type { SceneProps } from '@/engine/types';
import { BaseScene } from './_BaseScene';

/** Placeholder — 看得最遠的地方 (dawn horizon glow). Implement in Phase 3. */
export function SceneSunrise({ palette }: SceneProps) {
  return (
    <BaseScene id="sunrise">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 90%, ${palette.primary} 0%, #0b0f14 70%)`,
        }}
      />
    </BaseScene>
  );
}
