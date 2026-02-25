'use client';

import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -600, y: -600 });
  const currentPos = useRef({ x: -600, y: -600 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      const lerp = 0.1;
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * lerp;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * lerp;

      if (glowRef.current) {
        const x = currentPos.current.x - 350;
        const y = currentPos.current.y - 350;
        glowRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        ref={glowRef}
        className="absolute h-[700px] w-[700px] rounded-full will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(56,152,255,0.35) 0%, rgba(34,211,238,0.18) 25%, rgba(192,132,252,0.08) 50%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
    </div>
  );
}
