import Link from 'next/link';
import { Phone } from 'lucide-react';
import type { Einstellungen } from '@/lib/cms';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

export function Kontaktaufruf({ daten: d, einstellungen: e }: { daten: BlockDaten<'kontaktaufruf'>; einstellungen: Einstellungen }) {
  return (
    <section className="bg-marke text-white">
      <div className="container-seite abschnitt flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <h2 className="titel-2">{sauberText(d.titel)}</h2>
          {d.text ? <p className="mt-5 max-w-3xl text-lg text-white lg:text-xl">{sauberText(d.text)}</p> : null}
        </div>
        <div className="flex flex-wrap gap-4">
          {d.knopf.text && d.knopf.link ? (
            <Link href={d.knopf.link} className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-knopf)] bg-white px-7 py-3 font-semibold text-text transition-colors hover:bg-text hover:text-white lg:min-h-14 lg:px-9">
              {d.knopf.text}
            </Link>
          ) : null}
          {d.telefonZeigen ? (
            <a href={`tel:${e.telefon.replaceAll(' ', '')}`} className="knopf-hell">
              <Phone className="size-5" aria-hidden />
              {e.telefon}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
