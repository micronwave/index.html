import { useEffect, useRef } from 'react';

// 13 evenly-spaced hue stops; first === last so the gradient tiles seamlessly
const BASE_HUES = [0, 28, 55, 80, 120, 150, 180, 205, 225, 255, 285, 322, 360];
const N = BASE_HUES.length;
const SAT = 72;
const LIGHT = 70;

export default function AboutTabBorder({
  buttonRef,
  reducedMotion,
}: {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  reducedMotion: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mainRectRef = useRef<SVGRectElement>(null);
  const glowRectRef = useRef<SVGRectElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  const stopRefs = useRef<SVGStopElement[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const svg = svgRef.current;
    const mainRect = mainRectRef.current;
    const glowRect = glowRectRef.current;
    const gradient = gradientRef.current;
    if (!svg || !mainRect || !glowRect || !gradient) return;

    function updateGeometry(): { w: number; h: number } {
      const btn = buttonRef.current;
      if (!btn) return { w: 0, h: 0 };
      const r = btn.getBoundingClientRect();
      const w = r.width;
      const h = r.height;
      const rx = h / 2;
      svg!.setAttribute('viewBox', `0 0 ${w} ${h}`);
      [mainRect!, glowRect!].forEach((el) => {
        el.setAttribute('width', String(w));
        el.setAttribute('height', String(h));
        el.setAttribute('rx', String(rx));
        el.setAttribute('ry', String(rx));
      });
      // Keep gradient endpoints synced to button size for userSpaceOnUse
      gradient!.setAttribute('x1', '0');
      gradient!.setAttribute('y1', '0');
      gradient!.setAttribute('x2', String(w));
      gradient!.setAttribute('y2', String(h));
      return { w, h };
    }

    if (reducedMotion) {
      const { w } = updateGeometry();
      if (w > 0) {
        stopRefs.current.forEach((stop, i) => {
          if (stop) stop.setAttribute('stop-color', `hsl(${BASE_HUES[i]}, ${SAT}%, ${LIGHT}%)`);
        });
      }
      return;
    }

    function frame(ts: number) {
      const { w } = updateGeometry();
      if (w > 0) {
        const t = ts / 1000;

        // Unidirectional hue drift: full cycle every ~20 s
        const drift = (t * 18) % 360;

        stopRefs.current.forEach((stop, i) => {
          if (!stop) return;
          // Tiny per-stop ripple (±4°, very slow) gives liquid texture without oscillation feel
          const phase = (i / (N - 1)) * Math.PI * 2;
          const ripple = 4 * Math.sin(t * 0.1 * Math.PI * 2 + phase);
          const hue = (BASE_HUES[i]! + drift + ripple + 360) % 360;
          stop.setAttribute('stop-color', `hsl(${hue.toFixed(1)}, ${SAT}%, ${LIGHT}%)`);
        });

        // Glow breathes gently on a 5 s cycle
        const glowOp = 0.38 + 0.13 * Math.sin((t / 5) * Math.PI * 2);
        glowRect!.setAttribute('opacity', glowOp.toFixed(3));
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reducedMotion, buttonRef]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 0,
      }}
    >
      <defs>
        <linearGradient
          id="about-rainbow"
          ref={gradientRef}
          x1="0"
          y1="0"
          x2="100%"
          y2="100%"
          gradientUnits="userSpaceOnUse"
        >
          {BASE_HUES.map((hue, i) => (
            <stop
              key={i}
              ref={(el) => { if (el) stopRefs.current[i] = el; }}
              offset={`${(i / (N - 1)) * 100}%`}
              stopColor={`hsl(${hue}, ${SAT}%, ${LIGHT}%)`}
            />
          ))}
        </linearGradient>
        <filter id="about-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
        </filter>
      </defs>
      {/* Glow layer */}
      <rect
        ref={glowRectRef}
        x="0"
        y="0"
        fill="none"
        stroke="url(#about-rainbow)"
        strokeWidth="3"
        filter="url(#about-glow)"
        opacity="0.38"
      />
      {/* Main stroke */}
      <rect
        ref={mainRectRef}
        x="0"
        y="0"
        fill="none"
        stroke="url(#about-rainbow)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
