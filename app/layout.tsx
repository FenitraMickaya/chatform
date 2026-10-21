import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/src/i18n/index.tsx';

export const metadata: Metadata = {
  title: 'FormPulse | Conversational Forms & Chatbot Widgets',
  description:
    'Build conversational forms, embed them on any website with a one-line script and collect responses with real-time analytics.',
  openGraph: {
    title: 'FormPulse | Conversational Forms & Chatbot Widgets',
    description:
      'Build conversational forms, embed them on any website with a one-line script and collect responses with real-time analytics.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
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
