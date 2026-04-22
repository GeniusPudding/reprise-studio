import { tokens } from '@/theme/tokens';

/**
 * Film-grain overlay. Uses an SVG turbulence filter — cheap, GPU-composited.
 * Keep opacity subtle (see DESIGN.md: the grain is a flavor, not a feature).
 */
export function GrainLayer() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 4,
        opacity: tokens.layout.grainOpacity,
        mixBlendMode: 'overlay',
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.7'/></svg>\")",
      }}
    />
  );
}
