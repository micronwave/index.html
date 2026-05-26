import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const s = {
      dotX: -200, dotY: -200,
      ringX: -200, ringY: -200,
      ringVx: 0, ringVy: 0,
      ringW: 28, ringH: 28,
      targetW: 28, targetH: 28,
      borderRadius: '50%',
      ringBg: 'transparent',
      ringOpacity: 0.5,
    };

    let rafId = 0;
    let visible = false;

    function setVisible(v: boolean) {
      if (v === visible) return;
      visible = v;
      const opacity = v ? '' : '0';
      dot!.style.opacity = opacity;
      ring!.style.opacity = v ? String(s.ringOpacity) : '0';
    }

    function onMouseMove(e: MouseEvent) {
      s.dotX = e.clientX;
      s.dotY = e.clientY;
      if (!visible) {
        s.ringX = e.clientX;
        s.ringY = e.clientY;
        s.ringVx = 0;
        s.ringVy = 0;
      }
      setVisible(true);
    }

    function onMouseLeave() {
      setVisible(false);
    }

    function animate() {
      dot!.style.transform = `translate(${s.dotX - 3}px, ${s.dotY - 3}px)`;

      if (rm) {
        s.ringX = s.dotX;
        s.ringY = s.dotY;
      } else {
        const dt = 1 / 60;
        const ax = (s.dotX - s.ringX) * 120 - s.ringVx * 14;
        const ay = (s.dotY - s.ringY) * 120 - s.ringVy * 14;
        s.ringVx += ax * dt;
        s.ringVy += ay * dt;
        s.ringX += s.ringVx * dt;
        s.ringY += s.ringVy * dt;
      }

      const el = document.elementFromPoint(s.dotX, s.dotY);
      const nearNode = !!el?.closest?.('.orbit-node');
      const nearCanvas = !!(el?.classList?.contains('particle-name-canvas') || el?.classList?.contains('snake-ring-canvas'));

      if (nearNode) {
        s.targetW = 44; s.targetH = 44;
        s.ringBg = 'rgba(227,182,79,0.08)';
        s.ringOpacity = 0.6;
        s.borderRadius = '50%';
      } else if (nearCanvas) {
        s.targetW = 16; s.targetH = 16;
        s.ringBg = 'transparent';
        s.ringOpacity = 1;
        s.borderRadius = '50%';
      } else {
        s.targetW = 28; s.targetH = 28;
        s.ringBg = 'transparent';
        s.ringOpacity = 0.5;
        s.borderRadius = '50%';
      }

      s.ringW += (s.targetW - s.ringW) * 0.15;
      s.ringH += (s.targetH - s.ringH) * 0.15;

      ring!.style.transform = `translate(${(s.ringX - s.ringW / 2).toFixed(2)}px, ${(s.ringY - s.ringH / 2).toFixed(2)}px)`;
      ring!.style.width = `${s.ringW.toFixed(2)}px`;
      ring!.style.height = `${s.ringH.toFixed(2)}px`;
      ring!.style.borderRadius = s.borderRadius;
      ring!.style.background = s.ringBg;
      if (visible) ring!.style.opacity = String(s.ringOpacity);

      rafId = requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', onMouseMove);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#E3B64F',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-200px, -200px)',
          willChange: 'transform',
        }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1.5px solid rgba(227,182,79,0.5)',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: 'translate(-200px, -200px)',
          willChange: 'transform',
        }}
      />
    </>
  );
}
