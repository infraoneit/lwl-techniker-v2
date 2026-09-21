'use client';

import { useEffect, useRef } from 'react';

/**
 * Faserwellen: acht leuchtende Wellenlinien mit wandernden Lichtpunkten, fest hinter der ganzen Seite.
 * Übernommen aus dem Entwurf (index.html im ersten Commit). Auf der Startseite füllt der Startbereich
 * den ganzen Bildschirm, so wird die Animation zur Landefläche.
 *
 * Rücksicht: Bei "Bewegung reduzieren" wird ein einzelnes, ruhiges Bild gezeichnet.
 * Im Hintergrund-Tab pausiert die Animation. Die Zeichenfläche ist für Screenreader unsichtbar.
 */
type Welle = { y: number; amp: number; freq: number; spd: number; farbe: string; op: number; ph: number; pp: number; ps: number };

const FARBEN = ['240,168,0', '240,200,0', '225,120,20', '240,180,0', '255,140,10', '240,220,0', '200,100,10', '240,160,0'];

export function Faserwellen() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let breite = 0;
    let hoehe = 0;
    let wellen: Welle[] = [];
    let t = 0;
    let anfrage = 0;
    let aktiv = true;

    const aufbauen = () => {
      wellen = [];
      for (let i = 0; i < 8; i++) {
        const yf = (i + 0.5) / 8;
        wellen.push({
          y: yf * hoehe,
          amp: 15 + Math.random() * 40,
          freq: 0.005 + Math.random() * 0.009,
          spd: 0.3 + Math.random() * 0.7,
          farbe: FARBEN[i % FARBEN.length],
          op: 0.04 + yf * 0.18,
          ph: Math.random() * Math.PI * 2,
          pp: Math.random(),
          ps: 0.003 + Math.random() * 0.005,
        });
      }
    };

    const groesse = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      breite = window.innerWidth;
      hoehe = window.innerHeight;
      canvas.width = Math.round(breite * dpr);
      canvas.height = Math.round(hoehe * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      aufbauen();
    };

    const zeichnen = () => {
      ctx.clearRect(0, 0, breite, hoehe);
      t += 0.012;

      for (const w of wellen) {
        ctx.beginPath();
        for (let x = 0; x <= breite; x += 4) {
          const wy = w.y + Math.sin(x * w.freq + t * w.spd + w.ph) * w.amp;
          if (x === 0) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.strokeStyle = `rgba(${w.farbe},${w.op})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();

        // Wandernder Lichtpuls auf der Faser
        w.pp += w.ps;
        if (w.pp > 1.08) w.pp = -0.08;
        const px = w.pp * breite;
        if (px > 0 && px < breite) {
          const py = w.y + Math.sin(px * w.freq + t * w.spd + w.ph) * w.amp;
          const px2 = (w.pp - 0.03) * breite;
          const py2 = w.y + Math.sin(px2 * w.freq + t * w.spd + w.ph) * w.amp;
          ctx.beginPath();
          ctx.moveTo(px2, py2);
          ctx.lineTo(px, py);
          ctx.strokeStyle = 'rgba(240,200,0,0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.save();
          ctx.shadowColor = 'rgba(240,168,0,0.8)';
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(px, py, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = '#fff9d0';
          ctx.fill();
          ctx.restore();
        }
      }

      // Verlauf von oben, damit Text und Navigation lesbar bleiben
      const g = ctx.createLinearGradient(0, 0, 0, hoehe);
      g.addColorStop(0, 'rgba(8,17,46,0.97)');
      g.addColorStop(0.35, 'rgba(8,17,46,0.7)');
      g.addColorStop(0.7, 'rgba(8,17,46,0.35)');
      g.addColorStop(1, 'rgba(8,17,46,0.08)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, breite, hoehe);
    };

    const schleife = () => {
      if (!aktiv) return;
      zeichnen();
      anfrage = requestAnimationFrame(schleife);
    };

    const sichtbarkeit = () => {
      aktiv = document.visibilityState === 'visible' && !ruhig;
      cancelAnimationFrame(anfrage);
      if (aktiv) anfrage = requestAnimationFrame(schleife);
    };

    groesse();
    if (ruhig) zeichnen();
    else anfrage = requestAnimationFrame(schleife);

    window.addEventListener('resize', groesse);
    document.addEventListener('visibilitychange', sichtbarkeit);
    return () => {
      aktiv = false;
      cancelAnimationFrame(anfrage);
      window.removeEventListener('resize', groesse);
      document.removeEventListener('visibilitychange', sichtbarkeit);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10 h-full w-full" aria-hidden />;
}
