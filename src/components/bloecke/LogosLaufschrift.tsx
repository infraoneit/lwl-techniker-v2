'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { sauberText } from '@/lib/text';

type Logo = { name: string; logo: string; logoFarbig: string | null };
type Variante = 'weiss' | 'farbig';

const OPTIONEN: { wert: Variante; text: string }[] = [
  { wert: 'weiss', text: 'Weiss' },
  { wert: 'farbig', text: 'Farbe' },
];

/**
 * Scrollendes Logo-Band mit Umschalter zwischen zwei Darstellungen:
 * - Weiss: alle Logos als weisse Silhouette (Feld "Logo")
 * - Farbe: Logos in Originalfarben auf weissen Kacheln (Feld "Logo in Farbe"), nur Einträge mit Farbversion
 * Der Umschalter erscheint erst, wenn mindestens drei Logos eine Farbversion haben.
 *
 * Endlosschlaufe wie auf www.infraone.ch: Die Liste steht zweimal hintereinander und schiebt sich um die halbe
 * Breite nach links (@keyframes laufschrift in globals.css). Die zweite Liste ist für Screenreader unsichtbar.
 * Beim Wechsel der Darstellung startet das Band neu (key), damit der Übergang nicht ruckelt.
 */
export function LogosLaufschrift({ titel, standard, logos }: { titel: string; standard: Variante; logos: readonly Logo[] }) {
  const farbige = logos.filter((l) => l.logoFarbig);
  const umschaltbar = farbige.length >= 3;
  const [variante, setVariante] = useState<Variante>(umschaltbar && standard === 'farbig' ? 'farbig' : 'weiss');

  const farbig = umschaltbar && variante === 'farbig';
  const liste = farbig ? farbige : logos;
  // Gleichmässiges Lauftempo unabhängig von der Anzahl: mehr Logos, längere Schlaufe.
  const dauer = Math.round(liste.length * 2.2);

  const reihe = (versteckt: boolean) => (
    <ul className={cn('logos-laufschrift-track flex shrink-0 items-center', farbig ? 'gap-6 pr-6 lg:gap-8 lg:pr-8' : 'gap-16 pr-16')} aria-hidden={versteckt || undefined}>
      {liste.map((l, i) => (
        <li
          key={`${l.name}-${i}`}
          className={cn(
            'flex h-14 w-36 shrink-0 items-center justify-center lg:h-16 lg:w-44',
            farbig && 'overflow-hidden rounded-[var(--radius-karte)] bg-white'
          )}
        >
          <Image
            src={farbig ? (l.logoFarbig as string) : l.logo}
            alt={versteckt ? '' : l.name}
            width={farbig ? 320 : 180}
            height={farbig ? 128 : 72}
            unoptimized={(farbig ? l.logoFarbig : l.logo)?.endsWith('.svg')}
            className={cn('h-full w-full object-contain', farbig ? 'p-2' : 'opacity-80 transition-opacity duration-300 hover:opacity-100')}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <section className="abschnitt-kompakt overflow-hidden border-y border-linie">
      <div className="container-seite">
        {titel ? <h2 className="text-center text-sm font-semibold tracking-[0.14em] text-text-leise uppercase">{sauberText(titel)}</h2> : null}
        {umschaltbar ? (
          <div className="mt-6 mb-10 flex justify-center">
            <div role="group" aria-label="Darstellung der Logos" className="inline-flex border border-linie">
              {OPTIONEN.map((o) => {
                const aktiv = variante === o.wert;
                return (
                  <button
                    key={o.wert}
                    type="button"
                    aria-pressed={aktiv}
                    onClick={() => setVariante(o.wert)}
                    className={cn(
                      'min-h-12 min-w-24 px-5 font-titel text-xs font-semibold tracking-[0.18em] uppercase transition-colors',
                      aktiv ? 'bg-marke text-text-dunkel' : 'text-text-leise hover:text-text'
                    )}
                  >
                    {o.text}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-10" />
        )}
      </div>
      <div className="logos-laufschrift relative left-1/2 w-screen -translate-x-1/2 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div key={farbig ? 'farbig' : 'weiss'} className="logos-laufschrift-spur flex w-max" style={{ animationDuration: `${dauer}s` }}>
          {reihe(false)}
          {reihe(true)}
        </div>
      </div>
    </section>
  );
}
