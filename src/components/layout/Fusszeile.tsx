import Link from 'next/link';
import Image from 'next/image';
import type { Einstellungen, Navigation } from '@/lib/cms';
import { sauberText, whatsappLink } from '@/lib/text';

const SOCIAL_NAMEN: Record<string, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
};

/** Fusszeile: Logo und Kurzbeschreibung, Kontakt, Übersicht. Unten eine schmale Zeile in Versalien wie im Entwurf. */
export function Fusszeile({ einstellungen: e, navigation: n }: { einstellungen: Einstellungen; navigation: Navigation }) {
  const jahr = new Date().getFullYear();

  return (
    <footer className="border-t border-linie bg-flaeche-dunkel/80">
      <div className="container-seite abschnitt">
        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr] xl:gap-16">
          <div className="max-w-md">
            {e.logohell ? (
              <Image src={e.logohell} alt={e.firmenname} width={220} height={92} unoptimized={e.logohell.endsWith('.svg')} className="h-12 w-auto" />
            ) : (
              <p className="font-titel text-xl font-bold tracking-[0.06em] uppercase">{e.firmenname}</p>
            )}
            <p className="mt-6 text-text-leise">{sauberText(e.kurzbeschreibung)}</p>
          </div>

          <div>
            <h2 className="text-xs font-medium tracking-[0.28em] text-marke uppercase">Kontakt</h2>
            <address className="mt-5 space-y-1 not-italic">
              <p>{e.firmenname}</p>
              <p>{e.strasse}</p>
              <p>
                {e.plz} {e.ort}
              </p>
              <p className="pt-2">
                <a href={`tel:${e.telefon.replaceAll(' ', '')}`} className="inline-block py-1 hover:text-marke">
                  {e.telefon}
                </a>
              </p>
              <p>
                <a href={`mailto:${e.email}`} className="inline-block py-1 hover:text-marke">
                  {e.email}
                </a>
              </p>
              {e.whatsapp ? (
                <p>
                  <a href={whatsappLink(e.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-block py-1 hover:text-marke">
                    WhatsApp
                  </a>
                </p>
              ) : null}
            </address>
          </div>

          {e.oeffnungszeiten.length > 0 ? (
            <div>
              <h2 className="text-xs font-medium tracking-[0.28em] text-marke uppercase">Öffnungszeiten</h2>
              <dl className="mt-5 space-y-3">
                {e.oeffnungszeiten.map((z) => (
                  <div key={z.tage}>
                    <dt className="text-text-leise">{z.tage}</dt>
                    <dd>{z.zeiten}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {n.fusszeile.length > 0 ? (
            <nav aria-label="Fusszeile">
              <h2 className="text-xs font-medium tracking-[0.28em] text-marke uppercase">Übersicht</h2>
              <ul className="mt-4 space-y-1">
                {n.fusszeile.map((l) => (
                  <li key={l.link}>
                    <Link href={l.link} className="inline-block py-1 hover:text-marke">
                      {l.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-linie pt-6 text-[0.65rem] tracking-[0.22em] text-text-leise uppercase md:flex-row md:items-center md:justify-between">
          <p>
            © {jahr} {e.firmenname}, {e.ort}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {n.rechtliches.map((l) => (
              <li key={l.link}>
                <Link href={l.link} className="inline-block py-1 hover:text-text">
                  {l.text}
                </Link>
              </li>
            ))}
            {e.socialMedia.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-block py-1 hover:text-text">
                  {SOCIAL_NAMEN[s.plattform] ?? s.plattform}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
