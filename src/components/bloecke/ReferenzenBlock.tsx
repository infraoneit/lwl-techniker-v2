import Link from 'next/link';
import { AbschnittKopf } from '@/components/ui/AbschnittKopf';
import { holeReferenzenFuerStartseite } from '@/lib/cms';
import { cn } from '@/lib/cn';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

/**
 * Neuste Referenzen, automatisch, als Zellenraster mit grosser Nummer wie im Entwurf.
 * Auswahlregel: src/lib/startseite-auswahl.ts (markierte zuerst, Rest mit den neusten auffüllen).
 */
export async function ReferenzenBlock({ daten: d }: { daten: BlockDaten<'referenzen'> }) {
  const anzahl = Number(d.anzahl);
  const referenzen = await holeReferenzenFuerStartseite(anzahl);
  if (referenzen.length === 0) return null;

  return (
    <section className="abschnitt border-y border-linie bg-flaeche/70">
      <div className="container-seite">
        <AbschnittKopf
          ueberzeile={d.ueberzeile}
          titel={d.titel}
          text={d.text}
          link={d.linkText ? { text: d.linkText, href: '/referenzen' } : undefined}
        />
        <ul className={cn('grid gap-px border border-linie bg-linie sm:grid-cols-2', anzahl === 3 ? 'lg:grid-cols-3' : anzahl === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}>
          {referenzen.map((r, i) => (
            <li key={r.slug} data-einblenden className="group relative overflow-hidden bg-flaeche p-7 transition-colors hover:bg-blau/20 lg:p-8">
              <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-marke to-marke-hell transition-transform duration-500 group-hover:scale-x-100" aria-hidden />
              <span className="block font-titel text-4xl font-bold leading-none text-linie transition-colors group-hover:text-marke" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 text-sm font-semibold tracking-[0.12em] uppercase">
                <Link href={`/referenzen/${r.slug}`} className="after:absolute after:inset-0">
                  {sauberText(r.titel)}
                </Link>
              </h3>
              {r.kategorie || r.ort ? <p className="mt-1 text-xs text-text-leise">{[r.kategorie, r.ort].filter(Boolean).join(', ')}</p> : null}
              <p className="mt-4 line-clamp-3 text-[0.95rem] leading-7 text-text-leise">{sauberText(r.kurzbeschreibung)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
