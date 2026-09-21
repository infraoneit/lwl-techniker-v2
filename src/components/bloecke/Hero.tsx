import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { absaetze, sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

type Props = { daten: BlockDaten<'hero'>; istErster: boolean };

/**
 * Startbereich in zwei Varianten:
 * - vollbild: füllt den Bildschirm, Text unten, dahinter die Faserwellen (oder ein Bild, falls gesetzt).
 *   Titelzeilen aus dem CMS: erste Zeile gefüllt, zweite im Bernstein-Verlauf, dritte als Kontur (wie im Entwurf).
 * - geteilt:  Text links, Bild rechts, für Unterseiten.
 */
export function Hero({ daten: d, istErster }: Props) {
  return d.variante === 'geteilt' ? <HeroGeteilt daten={d} istErster={istErster} /> : <HeroVollbild daten={d} istErster={istErster} />;
}

function Knoepfe({ d, className }: { d: BlockDaten<'hero'>; className?: string }) {
  const primaer = d.knopfPrimaer.text && d.knopfPrimaer.link;
  const sekundaer = d.knopfSekundaer.text && d.knopfSekundaer.link;
  if (!primaer && !sekundaer) return null;
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4', className)}>
      {primaer ? (
        <Link href={d.knopfPrimaer.link} className="knopf-primaer">
          {d.knopfPrimaer.text}
        </Link>
      ) : null}
      {sekundaer ? (
        <Link href={d.knopfSekundaer.link} className="knopf-sekundaer">
          {d.knopfSekundaer.text}
        </Link>
      ) : null}
    </div>
  );
}

/** Titelzeilen mit gestaffeltem Aufsteigen. Zeile 2 im Verlauf, Zeile 3 als Kontur. */
function Titelzeilen({ titel }: { titel: string }) {
  const zeilen = sauberText(titel)
    .split('\n')
    .map((z) => z.trim())
    .filter(Boolean);
  return (
    <>
      {zeilen.map((zeile, i) => (
        <span key={i} className="block overflow-hidden">
          <span
            className={cn('block translate-y-[110%] opacity-0 motion-safe:animate-[zeile-auf_0.9s_cubic-bezier(0.16,1,0.3,1)_forwards] motion-reduce:translate-y-0 motion-reduce:opacity-100', i === 1 && 'verlauf', i === 2 && 'kontur')}
            style={{ animationDelay: `${0.45 + i * 0.15}s` }}
          >
            {zeile}
          </span>
        </span>
      ))}
    </>
  );
}

function HeroVollbild({ daten: d, istErster }: Props) {
  const gross = d.hoehe === 'gross';
  const TitelTag = istErster ? 'h1' : 'h2';

  return (
    <section
      className={cn(
        'relative isolate flex overflow-hidden',
        // Der Startbereich beginnt unter der schwebenden Navigation ganz oben (negativer Rand gleicht den Abstand von main aus)
        istErster && '-mt-24 lg:-mt-28',
        gross ? 'min-h-[100svh]' : 'min-h-[60svh]'
      )}
    >
      {d.bild ? (
        <>
          <Image src={d.bild} alt={d.bildAlt} fill loading={istErster ? 'eager' : 'lazy'} fetchPriority={istErster ? 'high' : 'auto'} sizes="100vw" className="-z-20 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-grund via-grund/70 to-grund/30" aria-hidden />
        </>
      ) : null}
      <div className={cn('container-seite flex flex-col justify-end', gross ? 'pt-32 pb-16 lg:pt-40 lg:pb-20' : 'pt-32 pb-12 lg:pt-36 lg:pb-16')}>
        <div className="max-w-[90rem]">
          {d.ueberzeile ? (
            <p className="ueberzeile-punkt opacity-0 motion-safe:animate-[auf_0.7s_0.4s_forwards] motion-reduce:opacity-100">{sauberText(d.ueberzeile)}</p>
          ) : null}
          <TitelTag className={gross ? 'titel-hero' : 'titel-1'}>
            <Titelzeilen titel={d.titel} />
          </TitelTag>
          <div
            className="my-10 h-0.5 w-0 bg-gradient-to-r from-marke via-marke-hell to-transparent motion-safe:animate-[balken_1.1s_0.9s_cubic-bezier(0.16,1,0.3,1)_forwards] motion-reduce:w-[55%]"
            aria-hidden
          />
        </div>
        <div className="grid items-end gap-8 opacity-0 motion-safe:animate-[auf_0.7s_1.2s_forwards] motion-reduce:opacity-100 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            {absaetze(d.text).map((a, i) => (
              <p key={i} className="max-w-xl text-base leading-8 text-text-leise lg:text-lg 3xl:text-xl">
                {a}
              </p>
            ))}
          </div>
          <Knoepfe d={d} className="lg:flex-col lg:items-start" />
        </div>
      </div>
    </section>
  );
}

function HeroGeteilt({ daten: d, istErster }: Props) {
  const gross = d.hoehe === 'gross';
  const TitelTag = istErster ? 'h1' : 'h2';

  return (
    <section className="relative overflow-hidden border-b border-linie">
      <div className={cn('container-seite relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20 2xl:gap-28', gross ? 'py-16 lg:py-24' : 'py-12 lg:py-16')}>
        <div className="max-w-3xl animate-einblenden">
          {d.ueberzeile ? <p className="ueberzeile">{sauberText(d.ueberzeile)}</p> : null}
          <TitelTag className={cn(gross ? 'titel-1' : 'titel-2', 'whitespace-pre-line')}>{sauberText(d.titel)}</TitelTag>
          {absaetze(d.text).map((a, i) => (
            <p key={i} className="einleitung mt-6">
              {a}
            </p>
          ))}
          <Knoepfe d={d} className="mt-10" />
        </div>
        {d.bild ? (
          <div
            className={cn(
              'relative overflow-hidden border border-linie bg-flaeche shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]',
              gross ? 'aspect-[4/3] lg:aspect-auto lg:h-[min(72svh,760px)]' : 'aspect-[16/10] lg:aspect-auto lg:h-[min(48svh,520px)]'
            )}
          >
            <Image
              src={d.bild}
              alt={d.bildAlt}
              fill
              loading={istErster ? 'eager' : 'lazy'}
              fetchPriority={istErster ? 'high' : 'auto'}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
