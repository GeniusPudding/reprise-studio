/**
 * Shared time-source contract.
 *
 * Both `useAudioClock` (real `<audio>`) and `useScrubber` (dev fake) return
 * this shape, so `Player` and other consumers don't care which is feeding
 * them. Don't add fields here without updating both implementations.
 */
export interface Clock {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  seek: (t: number) => void;
}
