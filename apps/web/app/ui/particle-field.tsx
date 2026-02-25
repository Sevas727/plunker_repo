'use client';

import { useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Perlin Noise 2D (classic implementation)
// ---------------------------------------------------------------------------
function createNoise() {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number) => {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  return (x: number, y: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const A = perm[X] + Y;
    const B = perm[X + 1] + Y;
    return lerp(
      lerp(grad(perm[A], x, y), grad(perm[B], x - 1, y), u),
      lerp(grad(perm[A + 1], x, y - 1), grad(perm[B + 1], x - 1, y - 1), u),
      v,
    );
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Shape = 'circle' | 'triangle' | 'diamond' | 'hexagon';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  shape: Shape;
  color: string;
  alpha: number;
  noiseX: number;
  noiseY: number;
  speed: number;
  pulsePhase: number;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const COLORS = [
  '56,152,255', // blue
  '34,211,238', // cyan
  '192,132,252', // purple
  '139,92,246', // violet
  '96,165,250', // light-blue
  '167,139,250', // lavender
];
const SHAPES: Shape[] = ['circle', 'triangle', 'diamond', 'hexagon'];
const CONNECTION_DISTANCE = 150;
const CURSOR_RADIUS = 200;
const CURSOR_FORCE = 8;
const NOISE_SCALE = 0.0008;
const NOISE_SPEED = 0.0003;
const BASE_PARTICLE_COUNT = 90; // at 1920×1080

// ---------------------------------------------------------------------------
// Draw helpers
// ---------------------------------------------------------------------------
function drawShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  shape: Shape,
) {
  ctx.beginPath();
  switch (shape) {
    case 'circle':
      ctx.arc(x, y, size, 0, Math.PI * 2);
      break;
    case 'triangle': {
      const h = size * 1.15;
      ctx.moveTo(x, y - h);
      ctx.lineTo(x - size, y + h * 0.58);
      ctx.lineTo(x + size, y + h * 0.58);
      ctx.closePath();
      break;
    }
    case 'diamond':
      ctx.moveTo(x, y - size * 1.2);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y + size * 1.2);
      ctx.lineTo(x - size, y);
      ctx.closePath();
      break;
    case 'hexagon':
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const hx = x + size * Math.cos(angle);
        const hy = y + size * Math.sin(angle);
        i === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      break;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999, active: false });
  const particles = useRef<Particle[]>([]);
  const noise = useRef(createNoise());
  const raf = useRef(0);
  const time = useRef(0);
  const dpr = useRef(1);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    dpr.current = Math.min(window.devicePixelRatio || 1, 2);

    // ---- resize ----
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr.current;
      canvas.height = h * dpr.current;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr.current, 0, 0, dpr.current, 0, 0);
      initParticles(w, h);
    };

    // ---- init particles ----
    const initParticles = (w: number, h: number) => {
      const area = w * h;
      const refArea = 1920 * 1080;
      const count = Math.round(BASE_PARTICLE_COUNT * (area / refArea));
      const clamped = Math.max(40, Math.min(count, 160));

      particles.current = Array.from({ length: clamped }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0,
        vy: 0,
        baseSize: 1.5 + Math.random() * 3,
        size: 1.5 + Math.random() * 3,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.15 + Math.random() * 0.45,
        noiseX: Math.random() * 1000,
        noiseY: Math.random() * 1000,
        speed: 0.3 + Math.random() * 0.7,
        pulsePhase: Math.random() * Math.PI * 2,
      }));
    };

    // ---- mouse ----
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.active = true;
    };
    const onMouseLeave = () => {
      mouse.current.active = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      mouse.current.x = e.touches[0].clientX;
      mouse.current.y = e.touches[0].clientY;
      mouse.current.active = true;
    };
    const onTouchEnd = () => {
      mouse.current.active = false;
    };

    // ---- render loop ----
    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      time.current += 1;

      ctx.clearRect(0, 0, w, h);

      const pts = particles.current;
      const n2d = noise.current;
      const t = time.current * NOISE_SPEED;
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const mActive = mouse.current.active;

      // ---- update particles ----
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];

        // Noise-driven force
        const angle =
          n2d(p.noiseX + p.x * NOISE_SCALE, p.noiseY + p.y * NOISE_SCALE + t) * Math.PI * 2;
        p.vx += Math.cos(angle) * p.speed * 0.15;
        p.vy += Math.sin(angle) * p.speed * 0.15;

        // Cursor repulsion
        if (mActive) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const distSq = dx * dx + dy * dy;
          const r = CURSOR_RADIUS;
          if (distSq < r * r && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / r) * CURSOR_FORCE;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Damping
        p.vx *= 0.92;
        p.vy *= 0.92;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -50) p.x = w + 50;
        if (p.x > w + 50) p.x = -50;
        if (p.y < -50) p.y = h + 50;
        if (p.y > h + 50) p.y = -50;

        // Size pulse
        p.size = p.baseSize + Math.sin(time.current * 0.02 + p.pulsePhase) * 0.5;
      }

      // ---- draw connections ----
      const connDist = CONNECTION_DISTANCE;
      const connDistSq = connDist * connDist;

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < connDistSq) {
            const dist = Math.sqrt(distSq);
            const opacity = (1 - dist / connDist) * 0.2;
            ctx.strokeStyle = `rgba(100,180,255,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // ---- draw cursor glow (subtle) ----
      if (mActive) {
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 250);
        grd.addColorStop(0, 'rgba(56,152,255,0.08)');
        grd.addColorStop(0.4, 'rgba(34,211,238,0.04)');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(mx - 250, my - 250, 500, 500);
      }

      // ---- draw particles ----
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        drawShape(ctx, p.x, p.y, p.size, p.shape);
        ctx.fill();
      }

      // ---- draw cursor-nearby highlight ----
      if (mActive) {
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CURSOR_RADIUS) {
            const intensity = (1 - dist / CURSOR_RADIUS) * 0.6;
            ctx.fillStyle = `rgba(${p.color},${intensity})`;
            drawShape(ctx, p.x, p.y, p.size * 1.8, p.shape);
            ctx.fill();
          }
        }
      }

      raf.current = requestAnimationFrame(render);
    };

    // ---- start ----
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', resize);
    resize();
    raf.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
}
