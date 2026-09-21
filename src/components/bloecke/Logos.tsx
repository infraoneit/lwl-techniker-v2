import Image from 'next/image';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

/**
 * Partner- und Referenzlogos. Zwei Darstellungen, per Häkchen "Als scrollendes Band zeigen" im CMS:
 * - Laufschrift: Logos laufen endlos durch, wie auf www.infraone.ch. Reine CSS-Animation (@keyframes
 *   laufschrift in globals.css), Pause beim Überfahren, steht still bei "Bewegung reduzieren"
 *   (globale Regel in globals.css). Die Liste wird einmal verdoppelt, damit die Schlaufe nahtlos ist;
 *   die zweite, gleiche Liste ist für Screenreader unsichtbar (aria-hidden).
 * - Raster: ruhige, feste Reihe wie bisher, für wenige Logos.
 */
export function Logos({ daten: d }: { daten: BlockDaten<'logos'> }) {
  if (d.laufschrift) return <LogosLaufschrift daten={d} />;
  return <LogosRaster daten={d} />;
}

function LogosLaufschrift({ daten: d }: { daten: BlockDaten<'logos'> }) {
  // Gleichmässiges Lauftempo unabhängig von der Anzahl: mehr Logos, länger die Schlaufe.
  const dauer = Math.round(d.logos.length * 2.2);

  const reihe = (versteckt: boolean) => (
    <ul className="logos-laufschrift-track flex shrink-0 items-center gap-16 pr-16" aria-hidden={versteckt || undefined}>
      {d.logos.map((l, i) => (
        <li key={`${l.name}-${i}`} className="flex h-14 w-36 shrink-0 items-center justify-center lg:h-16 lg:w-44">
          <Image
            src={l.logo}
            alt={versteckt ? '' : l.name}
            width={180}
            height={72}
            unoptimized={l.logo.endsWith('.svg')}
            className="h-full w-full object-contain opacity-80 transition-opacity duration-300 hover:opacity-100"
          />
        </li>
      ))}
    </ul>
  );

  return (
    <section className="abschnitt-kompakt overflow-hidden border-y border-linie">
      {d.titel ? (
        <div className="container-seite">
          <h2 className="mb-10 text-center text-sm font-semibold tracking-[0.14em] text-text-leise uppercase">{sauberText(d.titel)}</h2>
        </div>
      ) : null}
      <div className="logos-laufschrift relative w-screen -translate-x-1/2 left-1/2 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div className="logos-laufschrift-spur flex w-max" style={{ animationDuration: `${dauer}s` }}>
          {reihe(false)}
          {reihe(true)}
        </div>
      </div>
    </section>
  );
}

/** Ruhige Logoleiste ohne Laufband: Logos in Graustufen, farbig beim Überfahren. */
function LogosRaster({ daten: d }: { daten: BlockDaten<'logos'> }) {
  return (
    <section className="abschnitt-kompakt border-y border-linie">
      <div className="container-seite">
        {d.titel ? <h2 className="mb-10 text-center text-sm font-semibold tracking-[0.14em] text-text-leise uppercase">{sauberText(d.titel)}</h2> : null}
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 lg:gap-x-20">
          {d.logos.map((l, i) => {
            const bild = (
              <Image
                src={l.logo}
                alt={l.name}
                width={180}
                height={72}
                unoptimized={l.logo.endsWith('.svg')}
                className="h-10 w-auto max-w-[160px] object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 lg:h-12"
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
