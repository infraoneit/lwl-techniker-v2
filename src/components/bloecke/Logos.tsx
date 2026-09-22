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

/** Festes Raster ohne Laufband. Weiss zeigt alle Logos als weisse Silhouette, Farbe zeigt sie auf weissen Kacheln. */
function LogosRaster({ daten: d }: { daten: BlockDaten<'logos'> }) {
  const farbige = d.logos.filter((l) => l.logoFarbig);
  const farbig = d.darstellung === 'farbig' && farbige.length > 0;
  const liste = farbig ? farbige : d.logos;

  return (
    <section className="abschnitt-kompakt border-y border-linie">
      <div className="container-seite">
        {d.titel ? <h2 className="mb-10 text-center text-sm font-semibold tracking-[0.14em] text-text-leise uppercase">{sauberText(d.titel)}</h2> : null}
        <ul className={cn('flex flex-wrap items-center justify-center', farbig ? 'gap-6 lg:gap-8' : 'gap-x-12 gap-y-8 lg:gap-x-16')}>
          {liste.map((l, i) => {
            const quelle = farbig ? (l.logoFarbig as string) : l.logo;
            const bild = (
              <Image
                src={quelle}
                alt={l.name}
                width={farbig ? 320 : 180}
                height={farbig ? 128 : 72}
                unoptimized={quelle.endsWith('.svg')}
                className={cn(
                  'object-contain transition-opacity duration-300',
                  farbig ? 'h-full w-full p-2' : 'h-10 w-auto max-w-[160px] opacity-80 hover:opacity-100 lg:h-12'
                )}
              />
            );
            const inhalt = l.link ? (
              <a href={l.link} target={l.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                {bild}
              </a>
            ) : (
              bild
            );
            return (
              <li
                key={`${l.name}-${i}`}
                className={cn(farbig && 'flex h-14 w-36 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-karte)] bg-white lg:h-16 lg:w-44')}
              >
                {inhalt}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
