import type { Metadata, Viewport } from 'next';
import { DOMAIN, SPRACHE } from '@/site.config';
import { schriftText, schriftUeberschrift } from './schriften';

export const metadata: Metadata = {
  metadataBase: new URL(DOMAIN),
};

export const viewport: Viewport = {
  themeColor: '#08112e',
};

/**
 * Wurzel-Layout: nur html und body.
 * globals.css wird bewusst erst in (website)/layout.tsx und not-found.tsx geladen,
 * damit Tailwind die Keystatic-Oberfläche unter /keystatic nicht verändert.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={SPRACHE} className={`${schriftText.variable} ${schriftUeberschrift.variable}`}>
      <body>{children}</body>
    </html>
  );
}
