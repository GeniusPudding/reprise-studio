import { AbsoluteFill } from 'remotion';

interface Props {
  songId: string;
}

/**
 * Placeholder composition. In Phase 4 this will drive frame-based playback
 * of scenes + lyrics + cues so Remotion can render deterministic MP4.
 */
export function LyricMV({ songId }: Props) {
  return (
    <AbsoluteFill style={{ background: '#0b0f14', color: '#f5efe3' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'Cormorant Garamond, serif',
          fontStyle: 'italic',
          letterSpacing: '0.2em',
          opacity: 0.6,
        }}
      >
        Remotion composition — {songId} (Phase 4 wiring pending)
      </div>
    </AbsoluteFill>
  );
}
