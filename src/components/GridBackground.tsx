import { useEffect, useRef } from 'react';

const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='512' height='512' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function GridBackground({ reducedMotion, fadeIn }: { reducedMotion: boolean; fadeIn: boolean }) {
  const auroraRef = useRef<HTMLCanvasElement>(null);
  const auroraRafRef = useRef(0);

  useEffect(() => {
    const aurora = auroraRef.current!;
    const auroraCtx = aurora.getContext('2d')!;
    let auroraFrame = 0;

    function resize() {
      aurora.width = window.innerWidth;
      aurora.height = window.innerHeight;
      drawAurora(performance.now(), true);
    }

    function drawAurora(ts: number, force = false) {
      if (!force && auroraFrame++ % 3 !== 0) return;

      const w = aurora.width;
      const h = aurora.height;
      const cx = w / 2;
      const cy = h / 2;
      const phase = Math.PI / 3;
      const t = reducedMotion ? 0 : ts;

      auroraCtx.clearRect(0, 0, w, h);
      auroraCtx.globalCompositeOperation = 'screen';

      const bottomGlow = auroraCtx.createRadialGradient(cx, h + h * 0.22, 0, cx, h + h * 0.22, Math.max(w, h) * 0.55);
      bottomGlow.addColorStop(0, 'rgba(61,133,96,0.04)');
      bottomGlow.addColorStop(1, 'rgba(61,133,96,0)');
      auroraCtx.fillStyle = bottomGlow;
      auroraCtx.fillRect(0, 0, w, h);

      const ax = cx + Math.sin(t * 0.0003) * 180;
      const ay = cy + Math.cos(t * 0.00025) * 120;
      const ar = Math.max(w, h) * 0.46;
      const a = auroraCtx.createRadialGradient(ax, ay, 0, ax, ay, ar);
      a.addColorStop(0, 'rgba(61,133,96,0.09)');
      a.addColorStop(0.4, 'rgba(61,133,96,0)');
      a.addColorStop(1, 'rgba(61,133,96,0)');
      auroraCtx.fillStyle = a;
      auroraCtx.fillRect(0, 0, w, h);

      const bx = cx + Math.cos(t * 0.00028 + phase) * 220;
      const by = cy + Math.sin(t * 0.0004 + phase) * 100;
      const br = Math.max(w, h) * 0.42;
      const b = auroraCtx.createRadialGradient(bx, by, 0, bx, by, br);
      b.addColorStop(0, 'rgba(30,85,55,0.12)');
      b.addColorStop(0.35, 'rgba(30,85,55,0)');
      b.addColorStop(1, 'rgba(30,85,55,0)');
      auroraCtx.fillStyle = b;
      auroraCtx.fillRect(0, 0, w, h);

      auroraCtx.globalCompositeOperation = 'source-over';
    }

    function auroraLoop(ts: number) {
      drawAurora(ts);
      auroraRafRef.current = requestAnimationFrame(auroraLoop);
    }

    resize();
    window.addEventListener('resize', resize);

    if (!reducedMotion) {
      auroraRafRef.current = requestAnimationFrame(auroraLoop);
    } else {
      drawAurora(0, true);
    }

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(auroraRafRef.current);
    };
  }, [reducedMotion]);

  return (
    <>
      <canvas
        ref={auroraRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -3,
          pointerEvents: 'none',
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 900ms ease',
          mixBlendMode: 'screen',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          opacity: fadeIn ? 0.048 : 0,
          transition: 'opacity 1200ms ease',
          backgroundImage: GRAIN_URL,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />
    </>
  );
}
