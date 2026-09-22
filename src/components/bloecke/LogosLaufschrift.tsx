import Image from 'next/image';
import { cn } from '@/lib/cn';
import { sauberText } from '@/lib/text';

type Logo = { name: string; logo: string; logoFarbig: string | null };
type Darstellung = 'weiss' | 'farbig';

/**
 * Scrollendes Logo-Band. Die Darstellung wählt die Redaktion im CMS (Feld "Darstellung des scrollenden Bandes"):
 * - Weiss: alle Logos als weisse Silhouette (Feld "Logo")
 * - Farbe: Logos in Originalfarben auf weissen Kacheln (Feld "Logo in Farbe"), nur Einträge mit Farbversion.
 *   Hat kein Eintrag eine Farbversion, erscheint automatisch die weisse Darstellung.
 *
 * Endlosschlaufe wie auf www.infraone.ch: Die Liste steht zweimal hintereinander und schiebt sich um die halbe
 * Breite nach links (@keyframes laufschrift in globals.css). Die zweite Liste ist für Screenreader unsichtbar.
 */
export function LogosLaufschrift({ titel, darstellung, logos }: { titel: string; darstellung: Darstellung; logos: readonly Logo[] }) {
  const farbige = logos.filter((l) => l.logoFarbig);
  const farbig = darstellung === 'farbig' && farbige.length > 0;
  const liste = farbig ? farbige : logos;
  // Gleichmässiges Lauftempo unabhängig von der Anzahl: mehr Logos, längere Schlaufe.
  const dauer = Math.round(liste.length * 2.2);

  const reihe = (versteckt: boolean) => (
    <ul className={cn('logos-laufschrift-track flex shrink-0 items-center', farbig ? 'gap-6 pr-6 lg:gap-8 lg:pr-8' : 'gap-16 pr-16')} aria-hidden={versteckt || undefined}>
      {liste.map((l, i) => {
        const quelle = farbig ? (l.logoFarbig as string) : l.logo;
        return (
          <li key={`${l.name}-${i}`} className="flex h-14 w-36 shrink-0 items-center justify-center lg:h-16 lg:w-44">
            <Image
              src={quelle}
              alt={versteckt ? '' : l.name}
              width={farbig ? 320 : 180}
              height={farbig ? 128 : 72}
              unoptimized={quelle.endsWith('.svg')}
              className={cn('h-full w-full object-contain', !farbig && 'opacity-80 transition-opacity duration-300 hover:opacity-100')}
            />
          </li>
        );
      })}
    </ul>
  );

  return (
    <section className="abschnitt-kompakt overflow-hidden border-y border-linie">
      {titel ? (
        <div className="container-seite">
          <h2 className="mb-10 text-center text-sm font-semibold tracking-[0.14em] text-text-leise uppercase">{sauberText(titel)}</h2>
        </div>
      ) : null}
      <div className="logos-laufschrift relative left-1/2 w-screen -translate-x-1/2 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div className="logos-laufschrift-spur flex w-max" style={{ animationDuration: `${dauer}s` }}>
          {reihe(false)}
          {reihe(true)}
        </div>
      </div>
    </section>
  );
}
