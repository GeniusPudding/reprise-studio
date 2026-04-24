import { useEffect } from 'react';
import type { Clock } from '@/engine/clock';
import type { Section } from '@/engine/types';

interface Props {
  clock: Clock;
  sections: Section[];
  currentSectionType?: string;
  mode?: 'audio' | 'scrubber';
}

/**
 * Dev-only overlay: play/pause, slider, section markers, keyboard shortcuts.
 *
 *   space     play / pause
 *   ← / ,     -1s
 *   → / .     +1s
 *   [         jump to previous section start
 *   ]         jump to next section start
 *   0..9      jump to N/10 of duration
 */
export function TimeScrubber({ clock, sections, currentSectionType, mode = 'scrubber' }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (clock.isPlaying) clock.pause();
          else clock.play();
          break;
        case 'ArrowLeft':
        case ',':
          e.preventDefault();
          clock.seek(clock.currentTime - 1);
          break;
        case 'ArrowRight':
        case '.':
          e.preventDefault();
          clock.seek(clock.currentTime + 1);
          break;
        case '[': {
          const prev = [...sections].reverse().find((s) => s.t < clock.currentTime - 0.5);
          clock.seek(prev ? prev.t : 0);
          break;
        }
        case ']': {
          const next = sections.find((s) => s.t > clock.currentTime + 0.5);
          if (next) clock.seek(next.t);
          break;
        }
        default:
          if (/^[0-9]$/.test(e.key)) {
            const frac = Number(e.key) / 10;
            clock.seek(clock.duration * frac);
          }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [clock, sections]);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        padding: '12px 16px',
        background: 'linear-gradient(0deg, rgba(11,15,20,0.95), rgba(11,15,20,0.4))',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 16,
        alignItems: 'center',
        fontFamily: '"Cormorant Garamond", serif',
        color: '#f5efe3',
      }}
    >
      <button
        onClick={clock.isPlaying ? clock.pause : clock.play}
        style={{ minWidth: 56 }}
        title="space"
      >
        {clock.isPlaying ? 'pause' : 'play'}
      </button>

      <div style={{ position: 'relative' }}>
        {/* Section markers behind the slider */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 14, height: 6, pointerEvents: 'none' }}>
          {sections.map((s) => {
            const left = (s.t / clock.duration) * 100;
            const width = ((s.end - s.t) / clock.duration) * 100;
            return (
              <div
                key={`${s.t}-${s.type}`}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  width: `${width}%`,
                  top: 0,
                  bottom: 0,
                  background: moodTint(s.mood),
                  opacity: 0.5,
                }}
              />
            );
          })}
        </div>
        <input
          type="range"
          min={0}
          max={clock.duration}
          step={0.01}
          value={clock.currentTime}
          onChange={(e) => clock.seek(Number(e.target.value))}
          style={{ width: '100%', position: 'relative' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontVariantNumeric: 'tabular-nums', fontSize: 14 }}>
        <span style={{ opacity: 0.45, fontStyle: 'italic', fontSize: 12 }}>
          {mode === 'audio' ? 'audio' : 'scrubber'}
        </span>
        <span style={{ opacity: 0.6 }}>{currentSectionType ?? '—'}</span>
        <span>{format(clock.currentTime)} / {format(clock.duration)}</span>
      </div>
    </div>
  );
}

function format(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function moodTint(mood: string): string {
  switch (mood) {
    case 'still': return '#6b8ca8';
    case 'soft':  return '#dce4ea';
    case 'ache':  return '#3a1e24';
    case 'open':  return '#ffd27d';
    case 'defy':  return '#f2a65a';
    case 'fin':   return '#f5efe3';
    default:      return '#888';
  }
}
