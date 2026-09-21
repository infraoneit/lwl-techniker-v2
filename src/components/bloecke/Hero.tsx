import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { absaetze, sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

type Props = { daten: BlockDaten<'hero'>; istErster: boolean };

/**
 * Startbereich in zwei Varianten:
 * - vollbild: Bild über die ganze Breite, Text darauf (mit Verlauf für Lesbarkeit)
 * - geteilt:  Text links auf ruhiger Fläche, Bild rechts gerahmt (wie schaltkraft.ch)
 */
export function Hero({ daten: d, istErster }: Props) {
  return d.variante === 'geteilt' ? <HeroGeteilt daten={d} istErster={istErster} /> : <HeroVollbild daten={d} istErster={istErster} />;
}

function Knoepfe({ d, hell }: { d: BlockDaten<'hero'>; hell: boolean }) {
  const primaer = d.knopfPrimaer.text && d.knopfPrimaer.link;
  const sekundaer = d.knopfSekundaer.text && d.knopfSekundaer.link;
  if (!primaer && !sekundaer) return null;
  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
      {primaer ? (
        <Link href={d.knopfPrimaer.link} className="knopf-primaer">
          {d.knopfPrimaer.text}
        </Link>
      ) : null}
      {sekundaer ? (
        <Link href={d.knopfSekundaer.link} className={hell ? 'knopf-hell' : 'knopf-sekundaer'}>
          {d.knopfSekundaer.text}
        </Link>
      ) : null}
    </div>
  );
}

function HeroVollbild({ daten: d, istErster }: Props) {
  const gross = d.hoehe === 'gross';
  const TitelTag = istErster ? 'h1' : 'h2';

  return (
    <section className={cn('relative isolate flex overflow-hidden bg-flaeche-dunkel text-text-hell', gross ? 'min-h-[78svh]' : 'min-h-[48svh]')}>
      {d.bild ? (
        <>
          <Image
            src={d.bild}
            alt={d.bildAlt}
            fill
            loading={istErster ? 'eager' : 'lazy'}
            fetchPriority={istErster ? 'high' : 'auto'}
            sizes="100vw"
            className="-z-20 object-cover"
          />
          {/* Mobil liegt der Text über dem ganzen Bild, deshalb dort Verlauf von unten */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/55 to-black/25 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/50 lg:to-black/10" aria-hidden />
        </>
      ) : null}
      <div className={cn('container-seite flex flex-col justify-end', gross ? 'pt-28 pb-16 lg:pt-40 lg:pb-24' : 'pt-20 pb-12 lg:pt-28 lg:pb-16')}>
        <div className="max-w-5xl animate-einblenden">
          {d.ueberzeile ? <p className="ueberzeile !text-marke-hell">{sauberText(d.ueberzeile)}</p> : null}
          <TitelTag className={cn(gross ? 'titel-1' : 'titel-2', 'whitespace-pre-line')}>{sauberText(d.titel)}</TitelTag>
          {absaetze(d.text).map((a, i) => (
            <p key={i} className="mt-6 max-w-3xl text-lg text-text-hell-leise lg:text-xl 3xl:text-2xl">
              {a}
            </p>
          ))}
          <Knoepfe d={d} hell />
        </div>
      </div>
    </section>
  );
}

function HeroGeteilt({ daten: d, istErster }: Props) {
  const gross = d.hoehe === 'gross';
  const TitelTag = istErster ? 'h1' : 'h2';

  return (
    <section className="relative overflow-hidden bg-flaeche">
      {/* Feines Raster als ruhige Struktur im Hintergrund */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(var(--color-linie)_1px,transparent_1px),linear-gradient(90deg,var(--color-linie)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        aria-hidden
      />
      <div className={cn('container-seite relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20 2xl:gap-28', gross ? 'py-16 lg:py-24' : 'py-12 lg:py-16')}>
        <div className="max-w-3xl animate-einblenden">
          {d.ueberzeile ? <p className="ueberzeile">{sauberText(d.ueberzeile)}</p> : null}
          <TitelTag className={cn(gross ? 'titel-1' : 'titel-2', 'whitespace-pre-line')}>{sauberText(d.titel)}</TitelTag>
          {absaetze(d.text).map((a, i) => (
            <p key={i} className="einleitung mt-6">
              {a}
            </p>
          ))}
          <Knoepfe d={d} hell={false} />
        </div>
        {d.bild ? (
          <div
            className={cn(
              'relative overflow-hidden rounded-[var(--radius-karte)] bg-flaeche-dunkel shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]',
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
