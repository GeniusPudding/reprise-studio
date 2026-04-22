import { useEffect, useRef, useState } from 'react';
import { useAudioClock } from '@/engine/useAudioClock';
import styles from './App.module.css';

const SAMPLE_AUDIO_SRC = '/audio/seeing-farthest.mp3';

export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ready, setReady] = useState(false);
  const { currentTime, isPlaying, play, pause, seek } = useAudioClock(audioRef);

  useEffect(() => {
    if (!audioRef.current) return;
    const el = audioRef.current;
    const onCanPlay = () => setReady(true);
    el.addEventListener('canplay', onCanPlay);
    return () => el.removeEventListener('canplay', onCanPlay);
  }, []);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.title}>Reprise Studio</div>
        <div className={styles.subtitle}>phase 0 — audio clock skeleton</div>
      </header>

      <main className={styles.stage}>
        <div className={styles.clock}>
          {formatTime(currentTime)}
        </div>
        <div className={styles.status}>
          {ready ? (isPlaying ? 'playing' : 'paused') : 'loading audio…'}
        </div>
      </main>

      <footer className={styles.controls}>
        <button onClick={isPlaying ? pause : play} disabled={!ready}>
          {isPlaying ? 'pause' : 'play'}
        </button>
        <button onClick={() => seek(0)} disabled={!ready}>
          restart
        </button>
        <audio ref={audioRef} src={SAMPLE_AUDIO_SRC} preload="auto" />
      </footer>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}
