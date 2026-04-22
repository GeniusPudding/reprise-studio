import { tokens } from '@/theme/tokens';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
}

export function ProgressBar({ currentTime, duration }: ProgressBarProps) {
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 8,
        height: 1,
        background: 'rgba(245, 239, 227, 0.15)',
        zIndex: 80,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: tokens.color.paper,
          opacity: 0.6,
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  );
}
