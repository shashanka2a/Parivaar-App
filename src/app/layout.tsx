import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { AppStateProvider } from '@/lib/state-context';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Parivaar - Your Family, Your Legacy',
  description: 'Build and manage your family tree with Parivaar. Preserve your family history and legacy.',
  keywords: ['family tree', 'genealogy', 'family history', 'legacy'],
  authors: [{ name: 'Parivaar Team' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'Parivaar - Your Family, Your Legacy',
    description: 'Build and manage your family tree with Parivaar',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parivaar - Your Family, Your Legacy',
    description: 'Build and manage your family tree with Parivaar',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppStateProvider>
          {children}
        </AppStateProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 800,
            style: {
              background: 'white',
              color: '#2C3E2A',
              border: '1px solid #D9D5CE',
            },
          }}
        />
      </body>
    </html>
  );
}

