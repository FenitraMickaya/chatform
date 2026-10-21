import type { Metadata } from 'next';
import './globals.css';

// Self-hosted variable fonts (display / sans / mono).
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/jetbrains-mono';

import { LanguageProvider } from '@/src/i18n/index.tsx';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Chatform | Conversational Forms & Chatbot Widgets',
  description:
    'Build conversational forms, embed them on any website with a one-line script and collect responses with real-time analytics.',
  applicationName: 'Chatform',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Chatform | Conversational Forms & Chatbot Widgets',
    description:
      'Build conversational forms, embed them on any website with a one-line script and collect responses with real-time analytics.',
    url: '/',
    siteName: 'Chatform',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Chatform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chatform | Conversational Forms & Chatbot Widgets',
    description:
      'Build conversational forms, embed them on any website with a one-line script and collect responses with real-time analytics.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
