import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 2000;
const NAME_TEXT = 'AARON ALTERGOTT';

interface ParticleNameProps {
  reducedMotion: boolean;
  panelOpen: boolean;
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader compile failed');
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertex = compileShader(
    gl,
    gl.VERTEX_SHADER,
    `
      attribute vec2 a_position;
      attribute float a_alpha;
      uniform vec2 u_resolution;
      varying float v_alpha;
      void main() {
        vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
        gl_PointSize = 2.0;
        v_alpha = a_alpha;
      }
    `,
  );
  const fragment = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    `
      precision mediump float;
      varying float v_alpha;
      void main() {
        vec2 p = gl_PointCoord - vec2(0.5);
        float d = length(p);
        if (d > 0.5) discard;
        float edge = smoothstep(0.5, 0.18, d);
        gl_FragColor = vec4(0.878, 0.835, 0.690, v_alpha * edge);
      }
    `,
  );
  const program = gl.createProgram();
  if (!program) throw new Error('Unable to create WebGL program');
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'Program link failed');
  }
  return program;
}

function sampleName(width: number, height: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = Math.max(1, Math.floor(width * dpr));
  sampleCanvas.height = Math.max(1, Math.floor(height * dpr));
  const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  ctx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
  const fontSize = Math.min(sampleCanvas.width / 10.5, sampleCanvas.height * 0.52);
  ctx.font = `300 ${fontSize}px "Space Grotesk", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = `${fontSize * 0.1}px`;
  ctx.fillStyle = '#fff';
  ctx.fillText(NAME_TEXT, sampleCanvas.width / 2, sampleCanvas.height / 2);

  const image = ctx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
  const candidates: Array<{ x: number; y: number }> = [];
  const stride = Math.max(2, Math.floor(dpr * 3));
  for (let y = 0; y < sampleCanvas.height; y += stride) {
    for (let x = 0; x < sampleCanvas.width; x += stride) {
      if ((image[(y * sampleCanvas.width + x) * 4 + 3] ?? 0) > 24) {
        candidates.push({ x: x / dpr, y: y / dpr });
      }
    }
  }
  return candidates;
}

export default function ParticleName({ reducedMotion, panelOpen }: ParticleNameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const wasPanelOpenRef = useRef(false);
  const panelOpenRef = useRef(panelOpen);

  useEffect(() => {
    panelOpenRef.current = panelOpen;
  }, [panelOpen]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true })!;
    if (!gl) return;

    const program = createProgram(gl);
    const positionBuffer = gl.createBuffer();
    const alphaBuffer = gl.createBuffer();
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const alphaLocation = gl.getAttribLocation(program, 'a_alpha');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

    const positions = new Float32Array(PARTICLE_COUNT * 2);
    const velocities = new Float32Array(PARTICLE_COUNT * 2);
    const targets = new Float32Array(PARTICLE_COUNT * 2);
    const alphas = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);
    const order = new Float32Array(PARTICLE_COUNT);
    let startedAt = performance.now();
    let width = 1;
    let height = 1;

    function resetTargets(scatter: boolean) {
      width = canvas.clientWidth || 1;
      height = canvas.clientHeight || 1;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);

      const samples = sampleName(width, height);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const sample = samples[Math.floor((i / PARTICLE_COUNT) * samples.length)] ?? {
          x: width / 2,
          y: height / 2,
        };
        const jitterX = (Math.random() - 0.5) * 2;
        const jitterY = (Math.random() - 0.5) * 2;
        targets[i * 2] = sample.x + jitterX;
        targets[i * 2 + 1] = sample.y + jitterY;
        if (scatter) {
          positions[i * 2] = Math.random() * width;
          positions[i * 2 + 1] = Math.random() * height;
          velocities[i * 2] = (Math.random() - 0.5) * 5;
          velocities[i * 2 + 1] = (Math.random() - 0.5) * 5;
        }
        alphas[i] = 0.5 + Math.random() * 0.5;
        phases[i] = Math.random() * Math.PI * 2;
        order[i] = i / PARTICLE_COUNT;
      }
      startedAt = performance.now();
    }

    function frame(ts: number) {
      const isPanelOpen = panelOpenRef.current;
      if (wasPanelOpenRef.current && !isPanelOpen && !reducedMotion) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          velocities[i * 2] = (velocities[i * 2] ?? 0) + (Math.random() - 0.5) * 2.5;
          velocities[i * 2 + 1] = (velocities[i * 2 + 1] ?? 0) + (Math.random() - 0.5) * 2.5;
        }
        startedAt = ts;
      }
      wasPanelOpenRef.current = isPanelOpen;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      const elapsed = Math.max(0, ts - startedAt);
      const { x: mx, y: my } = mouseRef.current;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 2;
        const phase = phases[i] ?? 0;
        const ambient = reducedMotion ? 0 : Math.sin(ts * 0.0008 + phase) * 1.1;
        const stagger = Math.min(1, Math.max(0, (elapsed - (order[i] ?? 0) * 420) / 1200));
        const strength = reducedMotion ? 1 : 0.035 + 0.055 * stagger;
        const px = positions[ix] ?? 0;
        const py = positions[ix + 1] ?? 0;
        const tx = (targets[ix] ?? px) + ambient;
        const ty = (targets[ix + 1] ?? py) + Math.cos(ts * 0.0007 + phase) * 0.8;
        let ax = (tx - px) * strength;
        let ay = (ty - py) * strength;

        if (!reducedMotion && !isPanelOpen) {
          const dx = px - mx;
          const dy = py - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0 && dist < 120) {
            const force = ((1 - dist / 120) ** 2) * 4.2;
            ax += (dx / dist) * force;
            ay += (dy / dist) * force;
          }
        }

        velocities[ix] = ((velocities[ix] ?? 0) + ax) * 0.85;
        velocities[ix + 1] = ((velocities[ix + 1] ?? 0) + ay) * 0.85;
        if (isPanelOpen && !reducedMotion) {
          velocities[ix] = (velocities[ix] ?? 0) + Math.sin(ts * 0.0004 + phase) * 0.002;
          velocities[ix + 1] = (velocities[ix + 1] ?? 0) + Math.cos(ts * 0.00035 + phase) * 0.002;
        }
        positions[ix] = (positions[ix] ?? 0) + (velocities[ix] ?? 0);
        positions[ix + 1] = (positions[ix + 1] ?? 0) + (velocities[ix + 1] ?? 0);
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, alphas, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(alphaLocation);
      gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionLocation, width, height);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);

      rafRef.current = requestAnimationFrame(frame);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function onMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }

    const onResize = () => resetTargets(false);

    resetTargets(!reducedMotion);
    window.addEventListener('resize', onResize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(rafRef.current);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(alphaBuffer);
      gl.deleteProgram(program);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="particle-name-canvas" aria-hidden="true" />;
}
