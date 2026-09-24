import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AbschnittKopf } from '@/components/ui/AbschnittKopf';
import { holeLeistungen } from '@/lib/cms';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

/**
 * Zeigt automatisch alle Leistungen in der Reihenfolge aus dem CMS,
 * als nummerierte Zeilen wie im Entwurf (Nummer, Titel, Beschreibung, Pfeil).
 */
export async function LeistungenBlock({ daten: d }: { daten: BlockDaten<'leistungen'> }) {
  const alle = await holeLeistungen();
  if (alle.length === 0) return null;
  const leistungen = alle.slice(0, Number(d.anzahl));

  return (
    <section className="abschnitt">
      <div className="container-seite">
        <AbschnittKopf
          ueberzeile={d.ueberzeile}
          titel={d.titel}
          text={d.text}
          link={d.linkText ? { text: d.linkText, href: '/leistungen' } : undefined}
        />
        <ol className="border-t border-linie">
          {leistungen.map((l, i) => (
            <li
              key={l.slug}
              data-einblenden
              style={{ '--einblenden-index': i % 4 } as React.CSSProperties}
              className="group relative grid grid-cols-[2.5rem_1fr_2rem] items-start gap-x-4 gap-y-2 border-b border-linie py-6 transition-colors hover:bg-blau/10 lg:grid-cols-[4.5rem_1.1fr_1.6fr_2.5rem] lg:gap-x-10 lg:py-9"
            >
              {/* Bernstein-Linie wächst beim Überfahren von links nach rechts */}
              <span className="absolute bottom-[-1px] left-0 h-px w-0 bg-gradient-to-r from-marke to-marke-hell transition-[width] duration-500 group-hover:w-full" aria-hidden />
              <span className="pt-1 font-titel text-sm font-bold tracking-[0.08em] text-linie transition-colors group-hover:text-marke lg:text-base" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="titel-3">
                <Link href={`/leistungen/${l.slug}`} className="after:absolute after:inset-0">
                  {sauberText(l.titel)}
                </Link>
              </h3>
              <p className="text-kompakt col-start-2 lg:col-start-3 lg:row-start-1 lg:pt-0.5">{sauberText(l.kurzbeschreibung)}</p>
              <ArrowRight
                className="col-start-3 row-start-1 mt-1 size-5 self-start text-linie transition-[color,transform] group-hover:translate-x-1 group-hover:text-marke lg:col-start-4"
                aria-hidden
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
