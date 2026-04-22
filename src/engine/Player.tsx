import { type ComponentType } from 'react';
import type { SceneProps, SongConfig, Timeline } from './types';
import { useAudioClock } from './useAudioClock';
import { useAudioEnergy } from './useAudioEnergy';
import { useTimeline } from './useTimeline';
import { SceneRouter } from './SceneRouter';
import { useRef } from 'react';

interface PlayerProps {
  config: SongConfig;
  timeline: Timeline;
  sceneRegistry: Record<string, ComponentType<SceneProps>>;
}

/**
 * Top-level orchestrator: audio + clock + timeline → scene + layers.
 *
 * Phase 0 keeps this minimal. Lyric / cue / grain layers will be wired
 * in Phase 1+.
 */
export function Player({ config, timeline, sceneRegistry }: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentTime, isPlaying, play, pause } = useAudioClock(audioRef);
  const { smoothed: energy } = useAudioEnergy(audioRef);
  const { currentLyric, currentSection } = useTimeline(currentTime, timeline);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <SceneRouter
        config={config}
        sceneRegistry={sceneRegistry}
        section={currentSection}
        lyric={currentLyric}
        energy={energy}
        currentTime={currentTime}
      />

      <audio ref={audioRef} src={config.audioSrc} preload="auto" />

      <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12, zIndex: 100 }}>
        <button onClick={isPlaying ? pause : play}>{isPlaying ? 'pause' : 'play'}</button>
      </div>
    </div>
  );
}
