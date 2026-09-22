import { FileDown } from 'lucide-react';
import { Kontaktaufruf } from '@/components/bloecke/Kontaktaufruf';
import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { cn } from '@/lib/cn';
import { holeEinstellungen, holeProdukte, holeUebersichten, type Produkt } from '@/lib/cms';
import { metadaten } from '@/lib/seo';
import { sauberText } from '@/lib/text';

export async function generateMetadata() {
  const { produkte: u } = await holeUebersichten();
  return metadaten({ pfad: '/produkte', seitentitel: u.titel, seo: u.seo, beschreibungFallback: u.einleitung });
}

/** Gruppiert nach Kategorie, in der Reihenfolge des ersten Vorkommens (Produkte sind bereits nach Reihenfolge sortiert). */
function nachKategorie(produkte: readonly Produkt[]) {
  const gruppen: { titel: string; eintraege: Produkt[] }[] = [];
  for (const p of produkte) {
    let gruppe = gruppen.find((g) => g.titel === p.kategorie);
    if (!gruppe) {
      gruppe = { titel: p.kategorie, eintraege: [] };
      gruppen.push(gruppe);
    }
    gruppe.eintraege.push(p);
  }
  return gruppen;
}

export default async function ProdukteSeite() {
  const [{ produkte: u }, produkte, e] = await Promise.all([holeUebersichten(), holeProdukte(), holeEinstellungen()]);
  const kategorien = nachKategorie(produkte);

  return (
    <>
      <Seitenkopf ueberzeile={u.ueberzeile} titel={u.titel} einleitung={u.einleitung} pfad={[{ text: u.titel, href: '/produkte' }]} />
      <section className="abschnitt">
        {kategorien.length === 0 ? <p className="container-seite einleitung">Die Produkte werden zurzeit zusammengestellt.</p> : null}
        <div className="container-seite space-y-14">
          {kategorien.map((k) => (
            <div key={k.titel}>
              <h2 className="titel-3">{sauberText(k.titel)}</h2>
              <ul className="mt-5 divide-y divide-linie border-y border-linie">
                {k.eintraege.map((p) => {
                  const inhalt = (
                    <>
                      <div>
                        <p className="font-semibold">{sauberText(p.titel)}</p>
                        {p.beschreibung ? <p className="mt-1 text-sm text-text-leise">{sauberText(p.beschreibung)}</p> : null}
                      </div>
                      {p.dokument ? (
                        <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-marke">
                          <FileDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden />
                          Datenblatt (PDF)
                        </span>
                      ) : null}
                    </>
                  );
                  const zeilenKlasse = 'flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5 -mx-4 px-4';
                  return (
                    <li key={p.slug}>
                      {p.dokument ? (
                        <a
                          href={p.dokument}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(zeilenKlasse, 'group rounded-[var(--radius-karte)] transition-colors duration-200 hover:bg-flaeche')}
                        >
                          {inhalt}
                        </a>
                      ) : (
                        <div className={zeilenKlasse}>{inhalt}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <Kontaktaufruf
        daten={{
          titel: 'Sie brauchen ein Produkt mit speziellen Abmessungen?',
          text: 'Wir entwickeln passive Komponenten nach Ihren Angaben, zum Beispiel Wandverteiler in Sondergrössen oder Komponenten mit Ihrem Logo.',
          knopf: { text: 'Offerte anfragen', link: '/kontakt' },
          telefonZeigen: true,
        }}
        einstellungen={e}
      />
    </>
  );
}
