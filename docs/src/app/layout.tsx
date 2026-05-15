import type { Metadata } from 'next';
import './globals.css';
import Cursor from '@/components/Cursor';

export const metadata: Metadata = {
  metadataBase: new URL('https://streamfield.kevinmurphywebdev.com'),
  title: 'streamfield — a React primitive for partial-object stream UIs',
  description:
    'The streaming-UI piece your AI app is missing. A React primitive for rendering Vercel AI SDK partial-object streams with field-by-field reveal physics. Made by Kevin Murphy.',
  openGraph: {
    title: 'streamfield',
    description: 'A React primitive for partial-object stream UIs.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=Space+Grotesk:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <Cursor />
        {children}
      </body>
    </html>
  );
}
