import { useEffect, useRef } from 'react';

const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`;
const AURORA_FRAME_MS = 50;

export default function GridBackground({ reducedMotion, fadeIn }: { reducedMotion: boolean; fadeIn: boolean }) {
  const auroraRef = useRef<HTMLCanvasElement>(null);
  const auroraRafRef = useRef(0);

  useEffect(() => {
    const aurora = auroraRef.current!;
    const auroraCtx = aurora.getContext('2d')!;
    let bottomGlow: CanvasGradient | null = null;
    let lastAuroraDraw = 0;
    let resizeRaf = 0;
    let auroraTimeout: ReturnType<typeof setTimeout> | null = null;
    let isAnimating = false;

    const mobileQuery = window.matchMedia('(max-width: 700px)');
    const isStaticMode = () => reducedMotion || mobileQuery.matches;

    function drawAurora(ts: number, force = false) {
      if (!force && ts - lastAuroraDraw < AURORA_FRAME_MS) return;
      lastAuroraDraw = ts;

      const w = aurora.width;
      const h = aurora.height;
      const cx = w / 2;
      const cy = h / 2;
      const phase = Math.PI / 3;
      const t = isStaticMode() ? 0 : ts;

      auroraCtx.clearRect(0, 0, w, h);
      auroraCtx.globalCompositeOperation = 'screen';

      if (!bottomGlow) return;
      auroraCtx.fillStyle = bottomGlow;
      auroraCtx.fillRect(0, 0, w, h);

      const ax = cx + Math.sin(t * 0.0003) * 180;
      const ay = cy + Math.cos(t * 0.00025) * 120;
      const ar = Math.max(w, h) * 0.46;
      const a = auroraCtx.createRadialGradient(ax, ay, 0, ax, ay, ar);
      a.addColorStop(0, 'rgba(92,122,77,0.09)');
      a.addColorStop(0.4, 'rgba(92,122,77,0)');
      a.addColorStop(1, 'rgba(92,122,77,0)');
      auroraCtx.fillStyle = a;
      auroraCtx.fillRect(0, 0, w, h);

      const bx = cx + Math.cos(t * 0.00028 + phase) * 220;
      const by = cy + Math.sin(t * 0.0004 + phase) * 100;
      const br = Math.max(w, h) * 0.42;
      const b = auroraCtx.createRadialGradient(bx, by, 0, bx, by, br);
      b.addColorStop(0, 'rgba(92,122,77,0.12)');
      b.addColorStop(0.35, 'rgba(92,122,77,0)');
      b.addColorStop(1, 'rgba(92,122,77,0)');
      auroraCtx.fillStyle = b;
      auroraCtx.fillRect(0, 0, w, h);

      auroraCtx.globalCompositeOperation = 'source-over';
    }

    function resize() {
      aurora.width = window.innerWidth;
      aurora.height = window.innerHeight;
      const w = aurora.width;
      const h = aurora.height;
      const cx = w / 2;
      bottomGlow = auroraCtx.createRadialGradient(cx, h + h * 0.22, 0, cx, h + h * 0.22, Math.max(w, h) * 0.55);
      bottomGlow.addColorStop(0, 'rgba(92,122,77,0.04)');
      bottomGlow.addColorStop(1, 'rgba(92,122,77,0)');
      drawAurora(performance.now(), true);
    }

    function onResize() {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    }

    function scheduleAuroraFrame() {
      auroraTimeout = setTimeout(() => {
        auroraRafRef.current = requestAnimationFrame(auroraLoop);
      }, AURORA_FRAME_MS);
    }

    function auroraLoop(ts: number) {
      if (!isAnimating) return;
      drawAurora(ts);
      scheduleAuroraFrame();
    }

    function startAnimation() {
      if (!isStaticMode() && !isAnimating) {
        isAnimating = true;
        auroraRafRef.current = requestAnimationFrame(auroraLoop);
      }
    }

    function stopAnimation() {
      isAnimating = false;
      cancelAnimationFrame(auroraRafRef.current);
      if (auroraTimeout) {
        clearTimeout(auroraTimeout);
        auroraTimeout = null;
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        stopAnimation();
      } else {
        startAnimation();
      }
    }

    resize();
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibilityChange);
    startAnimation();

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      cancelAnimationFrame(auroraRafRef.current);
      if (auroraTimeout) clearTimeout(auroraTimeout);
      cancelAnimationFrame(resizeRaf);
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
          transform: 'translateZ(0)',
          willChange: 'transform, opacity',
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
          transform: 'translateZ(0)',
          willChange: 'transform, opacity',
        }}
      />
    </>
  );
}
