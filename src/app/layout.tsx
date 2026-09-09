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
  title: 'Ananke Laundry | Professional Laundry Services in Unawatuna, Galle',
  description: 'Professional laundry and linen-care solutions in Unawatuna, Galle. Contact Ananke Laundry for individual and commercial laundry enquiries.',
  keywords: [
    'Ananke Laundry',
    'Ananke Laundry Unawatuna',
    'Laundry Unawatuna',
    'Laundry Service Unawatuna',
    'Laundry Galle',
    'Laundry Service Galle',
    'Commercial Laundry Galle',
    'Commercial Laundry Unawatuna',
    'Hotel Laundry Galle',
    'Hotel Laundry Unawatuna',
    'Linen Service Galle',
    'Hospitality Laundry Sri Lanka',
    'Commercial Laundry Sri Lanka',
  ],
  authors: [{ name: 'Ananke Laundry (Pvt) Ltd' }],
  alternates: {
    canonical: 'https://anankelaundry.com',
  },
  openGraph: {
    title: 'Ananke Laundry | Professional Laundry Services in Unawatuna, Galle',
    description: 'Professional laundry and linen-care solutions in Unawatuna, Galle. Serving individual customers and hospitality businesses across Sri Lanka’s Southern region.',
    url: 'https://anankelaundry.com',
    siteName: 'Ananke Laundry',
    images: [
      {
        url: '/images/cover.png',
        width: 1200,
        height: 630,
        alt: 'Ananke Laundry - Unawatuna, Galle',
      },
    ],
    locale: 'en_LK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ananke Laundry | Professional Laundry Services in Unawatuna, Galle',
    description: 'Professional laundry and linen-care solutions in Unawatuna, Galle. Serving individuals and Southern Sri Lanka hospitality businesses.',
    images: ['/images/cover.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verified LocalBusiness structured data without fabricated ratings
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DryCleaningOrLaundry',
    name: 'Ananke Laundry',
    legalName: 'ANANKE LAUNDRY (PVT) LTD',
    image: 'https://anankelaundry.com/logo.png',
    '@id': 'https://anankelaundry.com/#organization',
    url: 'https://anankelaundry.com',
    telephone: '+94912250777',
    priceRange: '$$',
    parentOrganization: {
      '@type': 'Organization',
      name: 'Cleanline Linen Management (Pvt) Ltd',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No. 195/2, Matara Road',
      addressLocality: 'Unawatuna',
      addressRegion: 'Galle, Southern Province',
      postalCode: '80600',
      addressCountry: 'LK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 6.0123,
      longitude: 80.2456,
    },
    hasMap: 'https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday'],
        opens: '09:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '09:00',
        closes: '17:00',
      },
    ],
  };

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-cream min-h-screen flex flex-col font-body text-dark selection:bg-accent/30 selection:text-dark">
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
