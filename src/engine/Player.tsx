import { type ComponentType } from 'react';
import { AnimatePresence } from 'motion/react';
import type { SceneProps, SongConfig, Timeline } from './types';
import { useTimeline } from './useTimeline';
import { SceneRouter } from './SceneRouter';
import { LyricLayer } from '@/layers/LyricLayer';
import { CueFlashLayer } from '@/layers/CueFlashLayer';
import { GrainLayer } from '@/layers/GrainLayer';
import { TimeScrubber } from '@/layers/TimeScrubber';
import type { Clock } from './clock';

export type PlayerMode = 'audio' | 'scrubber';

interface PlayerProps {
  config: SongConfig;
  timeline: Timeline;
  sceneRegistry: Record<string, ComponentType<SceneProps>>;
  clock: Clock;
  energy: number;
  mode: PlayerMode;
}

/**
 * Top-level orchestrator: clock + timeline → scene + lyric + cue + grain.
 *
 * `clock` is shape-compatible with both `useAudioClock` (real audio) and
 * `useScrubber` (dev). The Player itself doesn't care which.
 */
export function Player({ config, timeline, sceneRegistry, clock, energy, mode }: PlayerProps) {
  const { currentLyric, currentSection, recentCue } = useTimeline(clock.currentTime, timeline);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <SceneRouter
          key={currentSection?.type ?? 'none'}
          config={config}
          sceneRegistry={sceneRegistry}
          section={currentSection}
          lyric={currentLyric}
          energy={energy}
          currentTime={clock.currentTime}
        />
      </AnimatePresence>

      <GrainLayer />
      <CueFlashLayer recentCue={recentCue} currentTime={clock.currentTime} />
      <LyricLayer lyric={currentLyric} />
      <TimeScrubber
        clock={clock}
        sections={timeline.sections}
        currentSectionType={currentSection?.type}
        mode={mode}
      />
    </div>
  );
}
