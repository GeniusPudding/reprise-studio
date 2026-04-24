import { useEffect, useState } from 'react';
import timelineJson from '@data/songs/seeing-farthest/timeline.json';
import { seeingFarthestConfig } from '@data/songs/seeing-farthest/config';
import { Player } from '@/engine/Player';
import { useScrubber } from '@/engine/useScrubber';
import { useFakeEnergy } from '@/engine/useFakeEnergy';
import { sceneRegistry } from '@/scenes/registry';
import type { Timeline } from '@/engine/types';
import { Preview } from '@/preview/Preview';

const timeline = timelineJson as unknown as Timeline;

export default function App() {
  const route = useHashRoute();

  if (route === 'preview') return <Preview />;
  return <SongView />;
}

function SongView() {
  const clock = useScrubber(timeline.meta.duration);
  const energy = useFakeEnergy(clock.currentTime, clock.isPlaying);

  return (
    <Player
      config={seeingFarthestConfig}
      timeline={timeline}
      sceneRegistry={sceneRegistry}
      clock={clock}
      energy={energy}
    />
  );
}

function useHashRoute(): string {
  const [route, setRoute] = useState(() => window.location.hash.slice(1));
  useEffect(() => {
    const onChange = () => setRoute(window.location.hash.slice(1));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
