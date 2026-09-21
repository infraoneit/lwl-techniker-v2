'use client';

import { useEffect, useRef } from 'react';

/**
 * Fadenkreuz-Cursor aus dem Entwurf: vier Eckwinkel in Bernstein folgen der Maus,
 * über Links und Knöpfen werden sie grösser. Nur auf Geräten mit Maus und ohne
 * "Bewegung reduzieren". Auf Touch-Geräten und für Screenreader existiert er nicht.
 */
export function Fadenkreuz() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const maus = window.matchMedia('(hover: hover) and (pointer: fine)');
    const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!maus.matches || ruhig.matches) return;

    document.documentElement.classList.add('fadenkreuz');
    el.hidden = false;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let anfrage = 0;
    const malen = () => {
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      anfrage = 0;
    };
    const bewegen = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!anfrage) anfrage = requestAnimationFrame(malen);
    };
    const ueber = (e: MouseEvent) => {
      const ziel = e.target instanceof Element ? e.target.closest('a, button, summary, label, [role="button"]') : null;
      el.classList.toggle('gross', Boolean(ziel));
    };
    const verlassen = () => el.classList.add('weg');
    const betreten = () => el.classList.remove('weg');

    document.addEventListener('mousemove', bewegen, { passive: true });
    document.addEventListener('mouseover', ueber, { passive: true });
    document.documentElement.addEventListener('mouseleave', verlassen);
    document.documentElement.addEventListener('mouseenter', betreten);
    return () => {
      document.documentElement.classList.remove('fadenkreuz');
      document.removeEventListener('mousemove', bewegen);
      document.removeEventListener('mouseover', ueber);
      document.documentElement.removeEventListener('mouseleave', verlassen);
      document.documentElement.removeEventListener('mouseenter', betreten);
      cancelAnimationFrame(anfrage);
    };
  }, []);

  return (
    <div
      ref={ref}
      hidden
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[9999] size-[30px] transition-[width,height,opacity] duration-200 [&.gross]:size-[46px] [&.weg]:opacity-0"
    >
      <span className="absolute top-0 left-0 size-[9px] border-t-[1.5px] border-l-[1.5px] border-marke" />
      <span className="absolute top-0 right-0 size-[9px] border-t-[1.5px] border-r-[1.5px] border-marke" />
      <span className="absolute bottom-0 left-0 size-[9px] border-b-[1.5px] border-l-[1.5px] border-marke" />
      <span className="absolute right-0 bottom-0 size-[9px] border-r-[1.5px] border-b-[1.5px] border-marke" />
    </div>
  );
}
