import { useState, type ComponentType } from 'react';
import { sceneRegistry } from '@/scenes/registry';
import { seeingFarthestPalette } from '@/theme/palettes/seeing-farthest';
import { LyricLayer } from '@/layers/LyricLayer';
import { GrainLayer } from '@/layers/GrainLayer';
import type { Mood, SceneProps, Section, TimelineEntry } from '@/engine/types';

/**
 * Scene preview sandbox — a designer / agent's playground.
 *
 * Pick any scene, pick any mood (palette entry), drag progress / energy
 * sliders, type a fake lyric, and see the scene in isolation. Lets us
 * iterate on a scene without touching audio or timeline.
 *
 * Open via `#preview` in the URL.
 */
export function Preview() {
  const sceneNames = Object.keys(sceneRegistry);
  const [sceneName, setSceneName] = useState(sceneNames[0] ?? 'SceneSilence');
  const [mood, setMood] = useState<Mood>('still');
  const [progress, setProgress] = useState(0.5);
  const [energy, setEnergy] = useState(0.5);
  const [lyricText, setLyricText] = useState('在這裡測試一句歌詞的呼吸');
  const [emphasis, setEmphasis] = useState('');
  const [showLyric, setShowLyric] = useState(true);
  const [showGrain, setShowGrain] = useState(true);

  const Scene = sceneRegistry[sceneName] as ComponentType<SceneProps> | undefined;
  const palette = seeingFarthestPalette[mood];

  const fakeSection: Section = {
    t: 0,
    end: 100,
    type: 'verse1',
    mood,
  };
  const fakeLyric: TimelineEntry | null = showLyric
    ? {
        t: 0,
        end: 100,
        text: lyricText,
        emphasis: emphasis ? emphasis.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      }
    : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: '100vh', width: '100vw' }}>
      {/* Stage */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#0b0f14' }}>
        {Scene ? (
          <Scene
            progress={progress}
            energy={energy}
            section={fakeSection}
            palette={palette}
            lyric={fakeLyric}
          />
        ) : (
          <Empty>Scene "{sceneName}" not in registry</Empty>
        )}
        {showGrain && <GrainLayer />}
        {showLyric && <LyricLayer lyric={fakeLyric} />}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            padding: '4px 10px',
            background: 'rgba(11,15,20,0.5)',
            color: '#f5efe3',
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontSize: 13,
            letterSpacing: '0.1em',
            zIndex: 200,
          }}
        >
          preview · {sceneName} · {mood}
        </div>
      </div>

      {/* Controls */}
      <aside
        style={{
          background: '#15191e',
          color: '#f5efe3',
          padding: 20,
          overflowY: 'auto',
          fontFamily: '"Cormorant Garamond", serif',
          borderLeft: '1px solid rgba(245,239,227,0.08)',
        }}
      >
        <h2 style={{ margin: 0, fontWeight: 400, letterSpacing: '0.2em', fontSize: 14, textTransform: 'uppercase', opacity: 0.6 }}>
          Scene Preview
        </h2>

        <Field label="Scene">
          <select value={sceneName} onChange={(e) => setSceneName(e.target.value)} style={selectStyle}>
            {sceneNames.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </Field>

        <Field label="Mood (palette)">
          <select value={mood} onChange={(e) => setMood(e.target.value as Mood)} style={selectStyle}>
            {(Object.keys(seeingFarthestPalette) as Mood[]).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>

        <Field label={`progress: ${progress.toFixed(2)}`}>
          <input type="range" min={0} max={1} step={0.01} value={progress}
                 onChange={(e) => setProgress(Number(e.target.value))} style={{ width: '100%' }} />
        </Field>

        <Field label={`energy: ${energy.toFixed(2)}`}>
          <input type="range" min={0} max={1} step={0.01} value={energy}
                 onChange={(e) => setEnergy(Number(e.target.value))} style={{ width: '100%' }} />
        </Field>

        <Field label="Lyric text">
          <textarea
            value={lyricText}
            onChange={(e) => setLyricText(e.target.value)}
            rows={2}
            style={{ ...selectStyle, fontFamily: '"Noto Serif TC", serif', resize: 'vertical' }}
          />
        </Field>

        <Field label="Emphasis (comma-separated)">
          <input
            value={emphasis}
            onChange={(e) => setEmphasis(e.target.value)}
            placeholder="敢飛, 看得最遠"
            style={selectStyle}
          />
        </Field>

        <Field>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={showLyric} onChange={(e) => setShowLyric(e.target.checked)} />
            show LyricLayer
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={showGrain} onChange={(e) => setShowGrain(e.target.checked)} />
            show GrainLayer
          </label>
        </Field>

        <hr style={{ border: 0, borderTop: '1px solid rgba(245,239,227,0.08)', margin: '20px 0' }} />

        <p style={{ fontSize: 12, opacity: 0.5, lineHeight: 1.6 }}>
          按 <code>#</code> 清空 hash 回到主播放器。Scene 沒有時間驅動的能量、進度資訊（這裡都是手動拉的滑桿）。
        </p>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: '14px 0' }}>
      {label && (
        <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5, marginBottom: 6 }}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'rgba(245,239,227,0.4)', fontStyle: 'italic' }}>
      {children}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: '#1f262d',
  color: '#f5efe3',
  border: '1px solid rgba(245,239,227,0.15)',
  padding: '6px 10px',
  fontFamily: 'inherit',
  fontSize: 14,
  borderRadius: 4,
};
