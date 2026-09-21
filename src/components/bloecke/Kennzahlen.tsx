import { Zaehler } from '@/components/ui/Zaehler';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

/** Kennzahlen auf blauem Band, Zahlen im Bernstein-Verlauf, zählen beim Erscheinen hoch (wie im Entwurf). */
export function Kennzahlen({ daten: d }: { daten: BlockDaten<'kennzahlen'> }) {
  return (
    <section className="relative overflow-hidden border-y border-marke/15 bg-blau">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(240,168,0,0.08)_0%,transparent_65%)]" aria-hidden />
      <div className="container-seite relative">
        <dl className="grid grid-cols-2 md:grid-cols-4">
          {d.eintraege.map((e, i) => (
            <div
              key={i}
              data-einblenden
              style={{ '--einblenden-index': i } as React.CSSProperties}
              className="flex flex-col-reverse border-linie/60 px-2 py-10 odd:border-r md:border-r md:px-6 md:last:border-r-0 md:first:pl-0 lg:px-10 lg:py-14"
            >
              <dt className="mt-3 text-xs tracking-[0.3em] text-text-leise uppercase hyphens-auto break-words">{sauberText(e.bezeichnung)}</dt>
              <dd className="verlauf font-titel text-5xl font-bold tracking-tight lg:text-7xl 3xl:text-8xl">
                <Zaehler wert={e.wert} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
