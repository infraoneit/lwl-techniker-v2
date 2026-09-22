import Image from 'next/image';
import { cn } from '@/lib/cn';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';
import { LogosLaufschrift as LogosBand } from './LogosLaufschrift';

/**
 * Partner- und Referenzlogos. Zwei Darstellungen, per Häkchen "Als scrollendes Band zeigen" im CMS:
 * - Laufschrift: Logos laufen endlos durch, wie auf www.infraone.ch. Die Redaktion wählt im CMS zwischen weisser
 *   Silhouette und Originalfarben (LogosLaufschrift.tsx). Reine CSS-Animation, Pause beim Überfahren, steht bei
 *   "Bewegung reduzieren" still (globale Regel in globals.css).
 * - Raster: feste Übersicht, alle Logos auf einen Blick, keine Animation. Gleiche Weiss/Farbe-Darstellung wie das Band.
 */
export function Logos({ daten: d }: { daten: BlockDaten<'logos'> }) {
  if (d.laufschrift) return <LogosBand titel={d.titel} darstellung={d.darstellung} logos={d.logos} />;
  return <LogosRaster daten={d} />;
}

/** Festes Raster ohne Laufband. Weiss zeigt alle Logos als weisse Silhouette, Farbe zeigt sie in Originalfarben, ohne Kachel. */
function LogosRaster({ daten: d }: { daten: BlockDaten<'logos'> }) {
  const farbige = d.logos.filter((l) => l.logoFarbig);
  const farbig = d.darstellung === 'farbig' && farbige.length > 0;
  const liste = farbig ? farbige : d.logos;

  return (
    <section className="abschnitt-kompakt border-y border-linie">
      <div className="container-seite">
        {d.titel ? <h2 className="mb-10 text-center text-sm font-semibold tracking-[0.14em] text-text-leise uppercase">{sauberText(d.titel)}</h2> : null}
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 lg:gap-x-16">
          {liste.map((l, i) => {
            const quelle = farbig ? (l.logoFarbig as string) : l.logo;
            const bild = (
              <Image
                src={quelle}
                alt={l.name}
                width={farbig ? 200 : 180}
                height={farbig ? 80 : 72}
                // Farbige Logos haben Transparenz: next/image würde sie beim Verkleinern über AVIF opak einfärben.
                unoptimized={farbig || quelle.endsWith('.svg')}
                className={cn('h-10 w-auto max-w-[160px] object-contain lg:h-12', !farbig && 'opacity-80 transition-opacity duration-300 hover:opacity-100')}
              />
            );
            return (
              <li key={`${l.name}-${i}`}>
                {l.link ? (
                  <a href={l.link} target={l.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                    {bild}
                  </a>
                ) : (
                  bild
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
