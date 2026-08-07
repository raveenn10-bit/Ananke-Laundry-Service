import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://anankelaundry.com'),
  title: 'Ananke Laundry | Premium Laundry & Garment Care | Unawatuna, Sri Lanka',
  description: 'Professional laundry and garment care services in Unawatuna, Sri Lanka. Washing, dry cleaning, ironing, pickup & delivery. Freshness in Every Wash.',
  keywords: ['Laundry Unawatuna', 'Dry Cleaning Sri Lanka', 'Garment Care', 'Ironing Service', 'Ananke Laundry', 'Laundry Delivery', 'Galle Laundry'],
  openGraph: {
    title: 'Ananke Laundry | Premium Laundry & Garment Care',
    description: 'Professional laundry and garment care services in Unawatuna, Sri Lanka. Freshness in Every Wash.',
    url: 'https://anankelaundry.com',
    siteName: 'Ananke Laundry',
    images: [
      {
        url: '/images/cover.png',
        width: 1200,
        height: 630,
        alt: 'Ananke Laundry Unawatuna',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ananke Laundry | Premium Laundry',
    description: 'Professional laundry and garment care services in Unawatuna, Sri Lanka.',
    images: ['/images/cover.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Ananke Laundry',
    image: 'https://anankelaundry.com/logo.png',
    '@id': 'https://anankelaundry.com',
    url: 'https://anankelaundry.com',
    telephone: '+94742697909',
    email: 'chinthaka.ananke@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '195/2, Matara Road',
      addressLocality: 'Unawatuna',
      addressRegion: 'Southern Province',
      addressCountry: 'LK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 6.0123, 
      longitude: 80.2456,
    },
    slogan: 'Freshness in Every Wash',
  };

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-cream min-h-screen flex flex-col font-body text-dark">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <FloatingActions />
        <Footer />
      </body>
    </html>
  );
}
