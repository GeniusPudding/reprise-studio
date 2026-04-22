import { Composition } from 'remotion';
import { LyricMV } from './Composition';

/**
 * Remotion entry. Wire the final MP4 render via:
 *   npx remotion render src/remotion/Root.tsx LyricMV out/<song>.mp4
 *
 * Phase 4 work — the composition is a thin shell for now.
 */
export function RemotionRoot() {
  return (
    <Composition
      id="LyricMV"
      component={LyricMV}
      durationInFrames={60 * 60 * 4}
      fps={60}
      width={1920}
      height={1080}
      defaultProps={{ songId: 'seeing-farthest' }}
    />
  );
}
