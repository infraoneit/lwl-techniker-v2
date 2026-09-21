'use client';

import { useEffect, useRef } from 'react';

/**
 * Faserbündel: rund 30 dünne, leicht verdrillte Fasern laufen als Bündel in einer weichen Kurve
 * über den Bildschirm, wie ein LWL-Kabel ohne Mantel. Lichtpulse werden in Schüben ausgesendet und
 * laufen gemeinsam durch das Bündel, ein Leuchtsaum um das Bündel atmet langsam mit.
 * Liegt fest hinter der ganzen Seite, auf der Startseite füllt der Startbereich den Bildschirm.
 *
 * Rücksicht: Bei "Bewegung reduzieren" wird ein einzelnes, ruhiges Bild gezeichnet.
 * Im Hintergrund-Tab pausiert die Animation. Die Zeichenfläche ist für Screenreader unsichtbar.
 */
type Faser = {
  /** Grundabstand zur Bündelachse */
  abstand: number;
  /** Verdrillung: Amplitude, Frequenz, Phase, Geschwindigkeit */
  amp: number;
  freq: number;
  phase: number;
  tempo: number;
  farbe: string;
  alpha: number;
  breite: number;
};

type Puls = { faser: number; pos: number; tempo: number; staerke: number };

/** Bernstein bis Gelb mit wenigen fast weissen Fasern, wie die Adern eines Bündels im Gegenlicht */
const FARBEN = ['240,168,0', '240,200,0', '255,150,20', '240,180,40', '250,220,90', '255,240,200', '225,120,20', '240,160,0'];

const SCHRITT = 6;

export function Faserwellen() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let breite = 0;
    let hoehe = 0;
    let fasern: Faser[] = [];
    let pulse: Puls[] = [];
    let t = 0;
    let naechsterSchub = 0;
    let anfrage = 0;
    let aktiv = true;

    const zufall = (min: number, max: number) => min + Math.random() * (max - min);

    /** Bündelachse: weiche S-Kurve, die langsam wandert */
    const achse = (x: number) => hoehe * 0.52 + Math.sin(x * 0.0011 + t * 0.12) * hoehe * 0.16 + Math.sin(x * 0.0027 - t * 0.07) * hoehe * 0.05;

    /** Position einer Faser an der Stelle x: Achse plus Grundabstand plus Verdrillung */
    const faserY = (f: Faser, x: number) => achse(x) + f.abstand + Math.sin(x * f.freq + f.phase + t * f.tempo) * f.amp;

    const aufbauen = () => {
      const dicke = Math.max(70, hoehe * 0.065);
      fasern = [];
      for (let i = 0; i < 30; i++) {
        // Abstände dichter in der Mitte, damit das Bündel einen Kern hat
        const lage = (Math.random() * 2 - 1) * (Math.random() * 0.6 + 0.4);
        fasern.push({
          abstand: lage * dicke,
          amp: zufall(6, 22),
          freq: zufall(0.004, 0.009),
          phase: Math.random() * Math.PI * 2,
          tempo: zufall(0.4, 1.1) * (Math.random() < 0.5 ? -1 : 1),
          farbe: FARBEN[i % FARBEN.length],
          alpha: zufall(0.1, 0.32),
          breite: zufall(0.8, 1.4),
        });
      }
      pulse = [];
      naechsterSchub = 0;
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

    /** Ein Schub: mehrere Fasern senden fast gleichzeitig einen Puls, so entsteht ein wanderndes Lichtbündel */
    const schub = () => {
      const anzahl = Math.round(zufall(8, 16));
      const tempo = zufall(0.0035, 0.0055);
      for (let i = 0; i < anzahl && pulse.length < 90; i++) {
        pulse.push({ faser: Math.floor(Math.random() * fasern.length), pos: -0.04 - Math.random() * 0.06, tempo: tempo * zufall(0.9, 1.1), staerke: zufall(0.5, 1) });
      }
      naechsterSchub = t + zufall(1.2, 2.4);
    };

    const zeichnen = (bewegt: boolean) => {
      ctx.clearRect(0, 0, breite, hoehe);
      if (bewegt) t += 0.012;
      // Atmen des ganzen Bündels
      const atem = 0.5 + 0.5 * Math.sin(t * 1.3);

      // Leuchtsaum entlang der Achse, zwei Lagen für einen weichen Rand
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let x = 0; x <= breite; x += SCHRITT * 2) {
        const y = achse(x);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(240,168,0,${0.025 + 0.035 * atem})`;
      ctx.lineWidth = Math.max(140, hoehe * 0.16);
      ctx.stroke();
      ctx.strokeStyle = `rgba(240,200,0,${0.03 + 0.04 * atem})`;
      ctx.lineWidth = Math.max(60, hoehe * 0.07);
      ctx.stroke();

      // Fasern
      for (const f of fasern) {
        ctx.beginPath();
        for (let x = 0; x <= breite; x += SCHRITT) {
          const y = faserY(f, x);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${f.farbe},${f.alpha * (0.75 + 0.25 * atem)})`;
        ctx.lineWidth = f.breite;
        ctx.stroke();
      }

      // Lichtpulse: Schweif entlang der Faser und leuchtender Kopf, additiv gemischt
      if (bewegt && t >= naechsterSchub) schub();
      ctx.globalCompositeOperation = 'lighter';
      for (const p of pulse) {
        if (bewegt) p.pos += p.tempo;
        const f = fasern[p.faser];
        const kopfX = p.pos * breite;
        if (kopfX < -40 || kopfX > breite + 40) continue;
        const laenge = breite * 0.06;
        const startX = kopfX - laenge;
        ctx.beginPath();
        for (let x = Math.max(0, startX); x <= Math.min(breite, kopfX); x += SCHRITT) {
          const y = faserY(f, x);
          if (x === Math.max(0, startX)) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(Math.min(breite, kopfX), faserY(f, Math.min(breite, kopfX)));
        const schweif = ctx.createLinearGradient(startX, 0, kopfX, 0);
        schweif.addColorStop(0, 'rgba(240,200,0,0)');
        schweif.addColorStop(1, `rgba(255,230,120,${0.55 * p.staerke})`);
        ctx.strokeStyle = schweif;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        const kopfY = faserY(f, kopfX);
        const radius = 9 + 7 * p.staerke;
        const glut = ctx.createRadialGradient(kopfX, kopfY, 0, kopfX, kopfY, radius);
        glut.addColorStop(0, `rgba(255,250,220,${0.9 * p.staerke})`);
        glut.addColorStop(0.35, `rgba(240,200,0,${0.5 * p.staerke})`);
        glut.addColorStop(1, 'rgba(240,168,0,0)');
        ctx.fillStyle = glut;
        ctx.beginPath();
        ctx.arc(kopfX, kopfY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      pulse = pulse.filter((p) => p.pos < 1.12);

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
      zeichnen(true);
      anfrage = requestAnimationFrame(schleife);
    };

    const sichtbarkeit = () => {
      aktiv = document.visibilityState === 'visible' && !ruhig;
      cancelAnimationFrame(anfrage);
      if (aktiv) anfrage = requestAnimationFrame(schleife);
    };

    groesse();
    if (ruhig) {
      // Ruhiges Standbild mit einem Lichtschub mitten im Bündel
      for (let i = 0; i < 12; i++) pulse.push({ faser: Math.floor(Math.random() * fasern.length), pos: 0.55 + Math.random() * 0.08, tempo: 0, staerke: zufall(0.5, 1) });
      zeichnen(false);
    } else {
      anfrage = requestAnimationFrame(schleife);
    }

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
