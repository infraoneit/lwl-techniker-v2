'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type Unterpunkt = { text: string; link: string; beschreibung?: string };
type Punkt = { text: string; link: string; unterpunkte: readonly Unterpunkt[] };

type Props = {
  firmenname: string;
  logo: string | null;
  telefon: string;
  menue: readonly Punkt[];
  knopf: { text?: string; link?: string };
};

/**
 * Schwebende Pill-Navigation aus dem Entwurf (mit der hellen Logovariante, weil die Pille dunkel ist): fest oben in der Mitte, dunkel und leicht durchscheinend,
 * Menüpunkte in Versalien, Knopf im Bernstein-Verlauf. Untermenüs klappen als dunkle Tafel auf.
 * Auf dem Handy wird die Pille so breit wie der Bildschirm, das Menü öffnet als Vollbild.
 * Tastatur: Escape schliesst, Fokus springt ins Menü und zurück, geschlossen ist das Menü inert.
 */
export function Kopfzeile({ firmenname, logo, telefon, menue, knopf }: Props) {
  const pfad = usePathname();
  const [offen, setOffen] = useState(false);
  const umschalter = useRef<HTMLButtonElement>(null);
  const mobilesMenue = useRef<HTMLDivElement>(null);
  const hauptnavigation = useRef<HTMLElement>(null);
  /** Per Knopf oder Tastatur geöffnetes Untermenü (Touch-Geräte, Tastatur) */
  const [untermenue, setUntermenue] = useState<number | null>(null);
  /** Mit Escape geschlossenes Untermenü, bleibt verborgen bis die Maus den Menüpunkt verlässt */
  const [verborgen, setVerborgen] = useState<number | null>(null);

  const schliessen = useCallback(() => {
    setOffen(false);
    umschalter.current?.focus();
  }, []);

  // Menüs bei Seitenwechsel schliessen
  const [letzterPfad, setLetzterPfad] = useState(pfad);
  if (pfad !== letzterPfad) {
    setLetzterPfad(pfad);
    setOffen(false);
    setUntermenue(null);
  }

  // Untermenü am Desktop: Escape und Klick ausserhalb schliessen
  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const offenerPunkt = hauptnavigation.current?.querySelector<HTMLElement>('li:hover, li:focus-within');
      const index = offenerPunkt ? [...(offenerPunkt.parentElement?.children ?? [])].indexOf(offenerPunkt) : -1;
      setUntermenue(null);
      if (index >= 0) {
        setVerborgen(index);
        if (offenerPunkt?.matches(':focus-within')) offenerPunkt.querySelector<HTMLElement>('a')?.focus();
      }
    };
    const klick = (e: MouseEvent) => {
      if (!hauptnavigation.current?.contains(e.target as Node)) setUntermenue(null);
    };
    window.addEventListener('keydown', taste);
    document.addEventListener('click', klick);
    return () => {
      window.removeEventListener('keydown', taste);
      document.removeEventListener('click', klick);
    };
  }, []);

  // Mobiles Menü schliessen, wenn das Fenster breiter wird
  useEffect(() => {
    const breit = window.matchMedia('(min-width: 1024px)');
    const pruefen = () => {
      if (breit.matches) setOffen(false);
    };
    breit.addEventListener('change', pruefen);
    return () => breit.removeEventListener('change', pruefen);
  }, []);

  // Offenes Menü: Scrollen sperren, Inhalt dahinter unerreichbar machen, Escape schliesst, Fokus ins Menü
  useEffect(() => {
    if (!offen) return;
    const hintergrund = [document.getElementById('inhalt'), document.querySelector('footer')].filter(Boolean) as HTMLElement[];
    document.body.style.overflow = 'hidden';
    hintergrund.forEach((el) => el.setAttribute('inert', ''));
    const fokusZeit = window.setTimeout(() => mobilesMenue.current?.querySelector<HTMLElement>('a, button')?.focus(), 60);
    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') schliessen();
    };
    window.addEventListener('keydown', taste);
    return () => {
      window.clearTimeout(fokusZeit);
      document.body.style.overflow = '';
      hintergrund.forEach((el) => el.removeAttribute('inert'));
      window.removeEventListener('keydown', taste);
    };
  }, [offen, schliessen]);

  const istAktiv = (link: string) => (link === '/' ? pfad === '/' : pfad === link || pfad.startsWith(`${link}/`));
  const telefonLink = `tel:${telefon.replaceAll(' ', '')}`;
  const hatKnopf = Boolean(knopf.text && knopf.link);

  return (
    <>
      <header className="fixed inset-x-3 top-3 z-50 sm:inset-x-4 sm:top-4 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2">
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[60] focus:bg-marke focus:px-4 focus:py-2 focus:font-semibold focus:text-text-dunkel"
        >
          Zum Inhalt springen
        </a>
        <div
          className={cn(
            'flex items-center justify-between gap-6 rounded-full border border-marke/20 bg-flaeche-dunkel/90 px-4 py-2 whitespace-nowrap backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-marke/35 hover:shadow-[0_0_28px_rgba(240,168,0,0.06)] lg:justify-start lg:px-5 lg:py-2.5 3xl:px-7 3xl:py-3.5'
          )}
        >
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label={`${firmenname}, zur Startseite`}
            // Auf der Startseite scrollt Next.js bei einem Klick auf denselben Link nicht nach oben
            onClick={(e) => {
              if (pfad !== '/') return;
              e.preventDefault();
              window.scrollTo({ top: 0 });
            }}
          >
            {logo ? (
              <Image src={logo} alt={firmenname} width={240} height={100} loading="eager" unoptimized={logo.endsWith('.svg')} className="h-8 w-auto lg:h-9 3xl:h-11" />
            ) : (
              <span className="font-titel text-base font-bold tracking-[0.06em] uppercase">{firmenname}</span>
            )}
          </Link>

          <span className="hidden h-4 w-px bg-blau lg:block" aria-hidden />

          <nav aria-label="Hauptnavigation" className="hidden lg:block" ref={hauptnavigation}>
            <ul className="flex items-center gap-1 xl:gap-2 3xl:gap-4">
              {menue.map((punkt, index) => {
                const mega = punkt.unterpunkte.length > 2;
                const hatUntermenue = punkt.unterpunkte.length > 0;
                const aufgeklappt = untermenue === index;
                const unterdrueckt = verborgen === index;
                return (
                  <li
                    key={punkt.link}
                    className="group relative flex items-center"
                    onMouseLeave={() => setVerborgen(null)}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) setVerborgen(null);
                    }}
                  >
                    <Link
                      href={punkt.link}
                      className={cn(
                        'inline-flex items-center rounded-full py-2 pl-3 text-[0.7rem] font-medium tracking-[0.22em] text-text-leise uppercase transition-colors hover:text-text 3xl:text-xs',
                        hatUntermenue ? 'pr-1' : 'pr-3',
                        istAktiv(punkt.link) && 'text-marke'
                      )}
                      aria-current={istAktiv(punkt.link) ? 'page' : undefined}
                    >
                      {punkt.text}
                    </Link>
                    {hatUntermenue ? (
                      <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded-full text-text-leise hover:text-text"
                        aria-expanded={aufgeklappt}
                        aria-controls={`untermenue-${index}`}
                        aria-label={`Untermenü ${punkt.text} ${aufgeklappt ? 'schliessen' : 'öffnen'}`}
                        onClick={() => {
                          setVerborgen(null);
                          setUntermenue(aufgeklappt ? null : index);
                        }}
                      >
                        <ChevronDown className={cn('size-4 transition-transform group-hover:rotate-180', aufgeklappt && 'rotate-180')} aria-hidden />
                      </button>
                    ) : null}
                    {hatUntermenue ? (
                      <div
                        id={`untermenue-${index}`}
                        className={cn(
                          'absolute top-full pt-4 transition-all duration-200',
                          mega ? 'left-1/2 -translate-x-1/2' : 'left-0',
                          aufgeklappt
                            ? 'visible opacity-100'
                            : 'invisible opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100',
                          unterdrueckt && '!invisible !opacity-0'
                        )}
                      >
                        <ul
                          className={cn(
                            'border border-marke/20 bg-flaeche-dunkel/95 p-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl',
                            mega ? 'grid w-[44rem] grid-cols-2 gap-1 border-t-2 border-t-marke p-3' : 'min-w-64'
                          )}
                        >
                          {punkt.unterpunkte.map((u) => (
                            <li key={u.link}>
                              <Link
                                href={u.link}
                                onClick={() => setUntermenue(null)}
                                className="block px-4 py-3 whitespace-normal transition-colors hover:bg-blau/30 focus-visible:bg-blau/30"
                                aria-current={pfad === u.link ? 'page' : undefined}
                              >
                                <span className="block font-titel text-sm font-semibold tracking-[0.04em] uppercase">{u.text}</span>
                                {mega && u.beschreibung ? <span className="mt-1 block text-sm leading-snug text-text-leise">{u.beschreibung}</span> : null}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          {hatKnopf ? (
            <Link
              href={knopf.link!}
              className="hidden items-center rounded-full bg-gradient-to-r from-marke to-marke-hell px-5 py-2 font-titel text-[0.7rem] font-semibold tracking-[0.18em] text-text-dunkel uppercase shadow-[0_0_16px_rgba(240,168,0,0.25)] transition-opacity hover:opacity-85 lg:inline-flex 3xl:px-6 3xl:text-xs"
            >
              {knopf.text}
            </Link>
          ) : null}

          <button
            ref={umschalter}
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-marke/20 text-marke lg:hidden"
            onClick={() => (offen ? schliessen() : setOffen(true))}
            aria-expanded={offen}
            aria-controls="mobiles-menue"
            aria-label={offen ? 'Menü schliessen' : 'Menü öffnen'}
          >
            {offen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </header>

      <div
        id="mobiles-menue"
        ref={mobilesMenue}
        inert={!offen}
        aria-hidden={!offen}
        className={cn(
          'fixed inset-0 z-40 overflow-y-auto bg-flaeche-dunkel/95 backdrop-blur-xl transition-[opacity,visibility] duration-300 ease-out lg:hidden',
          offen ? 'visible opacity-100' : 'invisible opacity-0'
        )}
      >
        <nav aria-label="Mobile Navigation" className="container-seite flex min-h-full flex-col justify-center py-24">
          <ul className="space-y-2">
            {menue.map((punkt, i) => (
              <li
                key={punkt.link}
                className={cn('transition-[opacity,transform] duration-300', offen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0')}
                style={{ transitionDelay: offen ? `${60 + i * 60}ms` : '0ms' }}
              >
                <Link
                  href={punkt.link}
                  onClick={() => setOffen(false)}
                  className={cn('block py-3 font-titel text-2xl tracking-[0.2em] text-text-leise uppercase hover:text-marke', istAktiv(punkt.link) && 'text-marke')}
                >
                  {punkt.text}
                </Link>
                {punkt.unterpunkte.length > 0 ? (
                  <ul className="mb-4 space-y-1 border-l border-linie pl-4">
                    {punkt.unterpunkte.map((u) => (
                      <li key={u.link}>
                        <Link href={u.link} onClick={() => setOffen(false)} className="block py-2 text-base text-text-leise hover:text-text">
                          {u.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          <div className={cn('mt-10 flex flex-col gap-4 transition-[opacity,transform] duration-300', offen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0')} style={{ transitionDelay: offen ? '320ms' : '0ms' }}>
            {hatKnopf ? (
              <Link href={knopf.link!} onClick={() => setOffen(false)} className="knopf-primaer">
                {knopf.text}
              </Link>
            ) : null}
            <a href={telefonLink} className="knopf-sekundaer">
              {telefon}
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
