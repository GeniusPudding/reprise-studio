import { AbsoluteFill } from 'remotion';

/**
 * Placeholder composition. In Phase 4 this will drive frame-based playback
 * of scenes + lyrics + cues so Remotion can render deterministic MP4.
 *
 * Props are loose (Record<string, unknown>) to match Remotion's
 * `Composition` generic; cast on read.
 */
export function LyricMV(props: Record<string, unknown>) {
  const songId = (props.songId as string | undefined) ?? 'unknown';
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
