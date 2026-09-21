'use client';

import { useEffect, useRef } from 'react';

/**
 * Zählt eine Kennzahl hoch, sobald sie ins Bild kommt (wie im Entwurf).
 * Der Wert aus dem CMS darf einen Zusatz enthalten, z. B. "1200 km" oder "24 h".
 * Ohne JavaScript oder bei "Bewegung reduzieren" steht sofort der Endwert.
 */
export function Zaehler({ wert }: { wert: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const treffer = wert.match(/^(\d[\d']*)(.*)$/);

  useEffect(() => {
    const el = ref.current;
    if (!el || !treffer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ende = Number(treffer[1].replaceAll("'", ''));
    const rest = treffer[2];
    let gestartet = false;

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        if (!eintraege[0].isIntersecting || gestartet) return;
        gestartet = true;
        beobachter.disconnect();
        const dauer = 1900;
        const start = performance.now();
        const schritt = (jetzt: number) => {
          const t = Math.min((jetzt - start) / dauer, 1);
          const e = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(e * ende).toLocaleString('de-CH') + rest;
          if (t < 1) requestAnimationFrame(schritt);
        };
        requestAnimationFrame(schritt);
      },
      { threshold: 0.3 }
    );
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, [treffer]);

  return <span ref={ref}>{wert}</span>;
}
