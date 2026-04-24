import { useEffect, useRef, useState } from 'react';
import { loadSong, type LoadedSong } from './songs';
import { Player } from './Player';
import { useAudioClock } from './useAudioClock';
import { useAudioEnergy } from './useAudioEnergy';
import { useScrubber } from './useScrubber';
import { useFakeEnergy } from './useFakeEnergy';
import { sceneRegistry } from '@/scenes/registry';

interface Props {
  songId: string;
  onMissing?: (songId: string, available: string[]) => void;
}

type AudioStatus = 'probing' | 'ready' | 'missing';

/**
 * Loads a song by id, probes its audio file, and renders Player in the
 * appropriate mode. If audio is missing (404 / decode error), falls back
 * to scrubber + fake energy and shows a banner.
 */
export function SongLoader({ songId }: Props) {
  const [song, setSong] = useState<LoadedSong | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSong(songId)
      .then((s) => {
        if (cancelled) return;
        if (!s) setError(`Song "${songId}" not found in data/songs/`);
        else setSong(s);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => { cancelled = true; };
  }, [songId]);

  if (error) return <FullPageMessage title="No such song" body={error} />;
  if (!song) return <FullPageMessage title="loading…" />;
  return <SongStage song={song} />;
}

function SongStage({ song }: { song: LoadedSong }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('probing');

  useEffect(() => {
    const probe = new Audio();
    probe.preload = 'auto';
    const onCanPlay = () => setAudioStatus('ready');
    const onError = () => setAudioStatus('missing');
    probe.addEventListener('canplaythrough', onCanPlay);
    probe.addEventListener('error', onError);
    probe.src = song.config.audioSrc;
    probe.load();
    return () => {
      probe.removeEventListener('canplaythrough', onCanPlay);
      probe.removeEventListener('error', onError);
      probe.src = '';
    };
  }, [song.config.audioSrc]);

  if (audioStatus === 'probing') return <FullPageMessage title="probing audio…" />;

  if (audioStatus === 'ready') {
    return (
      <>
        <audio ref={audioRef} src={song.config.audioSrc} preload="auto" hidden />
        <AudioMode song={song} audioRef={audioRef} />
      </>
    );
  }

  return <ScrubberMode song={song} audioPath={song.config.audioSrc} />;
}

function AudioMode({ song, audioRef }: { song: LoadedSong; audioRef: React.RefObject<HTMLAudioElement | null> }) {
  const clock = useAudioClock(audioRef);
  const { smoothed: energy } = useAudioEnergy(audioRef);
  return (
    <Player
      config={song.config}
      timeline={song.timeline}
      sceneRegistry={sceneRegistry}
      clock={clock}
      energy={energy}
      mode="audio"
    />
  );
}

function ScrubberMode({ song, audioPath }: { song: LoadedSong; audioPath: string }) {
  const clock = useScrubber(song.timeline.meta.duration);
  const energy = useFakeEnergy(clock.currentTime, clock.isPlaying);
  return (
    <>
      <Player
        config={song.config}
        timeline={song.timeline}
        sceneRegistry={sceneRegistry}
        clock={clock}
        energy={energy}
        mode="scrubber"
      />
      <MissingAudioBanner path={audioPath} />
    </>
  );
}

function MissingAudioBanner({ path }: { path: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 200,
        padding: '6px 12px',
        background: 'rgba(58, 30, 36, 0.7)',
        color: '#f5efe3',
        fontFamily: '"Cormorant Garamond", serif',
        fontStyle: 'italic',
        fontSize: 12,
        letterSpacing: '0.08em',
        borderLeft: '2px solid #f2a65a',
        maxWidth: 320,
      }}
    >
      audio missing — running in scrubber mode<br />
      <span style={{ opacity: 0.6, fontSize: 11 }}>{path}</span>
    </div>
  );
}

function FullPageMessage({ title, body }: { title: string; body?: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: '#0b0f14',
        color: '#f5efe3',
        fontFamily: '"Cormorant Garamond", serif',
        textAlign: 'center',
      }}
    >
      <div>
        <div style={{ fontStyle: 'italic', letterSpacing: '0.2em', opacity: 0.7 }}>{title}</div>
        {body && <div style={{ marginTop: 8, opacity: 0.5, fontSize: 13 }}>{body}</div>}
      </div>
    </div>
  );
}
