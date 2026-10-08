import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import PwaInstallPrompt from '@/components/pwa/PwaInstallPrompt';
import { OrderModalProvider } from '@/context/OrderModalContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { PwaProvider } from '@/context/PwaContext';

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

export const viewport: Viewport = {
  themeColor: '#163824',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.anankelaundry.lk'),
  title: {
    default: 'Ananke Laundry | Professional Laundry & Linen Care in Unawatuna, Galle',
    template: '%s | Ananke Laundry Unawatuna, Galle',
  },
  description:
    'Ananke Laundry (Pvt) Ltd — professional laundry, dry cleaning, pressing, stain removal, and commercial hotel linen care in Unawatuna, Galle, Sri Lanka. Call 091 225 0777 to book or request a free commercial quotation.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ananke Washing Plant',
  },
  icons: {
    icon: '/icons/favicon-32x32.png',
    apple: '/icons/apple-touch-icon.png',
  },
  keywords: [
    'Ananke Laundry',
    'Ananke Laundry Unawatuna',
    'laundry service Unawatuna',
    'laundry service Galle',
    'laundry Unawatuna Sri Lanka',
    'laundry near me Galle',
    'dry cleaning Unawatuna',
    'dry cleaning Galle',
    'commercial laundry Galle',
    'hotel laundry Unawatuna',
    'hotel laundry Galle',
    'linen service Southern Province',
    'hospitality laundry Sri Lanka',
    'linen management Sri Lanka',
    'villa laundry Unawatuna',
    'guest house laundry Galle',
    'Cleanline linen management',
    'washing service Unawatuna',
    'ironing service Galle',
    'laundry pickup Galle',
    'towel linen care Sri Lanka',
    'laundry Galle Fort',
    'bed linen service Southern Province',
  ],
  authors: [{ name: 'Ananke Laundry (Pvt) Ltd', url: 'https://www.anankelaundry.lk' }],
  creator: 'Ananke Laundry (Pvt) Ltd',
  publisher: 'Ananke Laundry (Pvt) Ltd',
  category: 'Laundry & Linen Care Services',
  alternates: {
    canonical: 'https://www.anankelaundry.lk',
  },
  openGraph: {
    title: 'Ananke Laundry | Professional Laundry & Linen Care in Unawatuna, Galle',
    description:
      'Professional laundry, dry cleaning, and commercial hotel linen care in Unawatuna, Galle. Individual, hospitality, and villa laundry by Ananke Laundry (Pvt) Ltd.',
    url: 'https://www.anankelaundry.lk',
    siteName: 'Ananke Laundry',
    images: [
      {
        url: '/images/cover.png',
        width: 1200,
        height: 630,
        alt: 'Ananke Laundry — Professional Laundry & Linen Care, Unawatuna, Galle, Sri Lanka',
      },
    ],
    locale: 'en_LK',
    type: 'website',
  },
  verification: {
    google: 'fwf55F3-5MX4DnsyloGTqmbJiFT9fEkrzZsnbjvqhvQ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ananke Laundry | Laundry & Hotel Linen Care, Unawatuna Sri Lanka',
    description:
      'Professional laundry, dry cleaning, and commercial hotel linen care in Unawatuna, Galle. Call 091 225 0777.',
    images: ['/images/cover.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verified structured data (JSON-LD) for Google rich results
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'DryCleaningOrLaundry',
    name: 'Ananke Laundry',
    legalName: 'ANANKE LAUNDRY (PVT) LTD',
    image: 'https://www.anankelaundry.lk/logo.png',
    '@id': 'https://www.anankelaundry.lk/#organization',
    url: 'https://www.anankelaundry.lk',
    telephone: '+94912250777',
    email: 'chinthaka.ananke@gmail.com',
    priceRange: '$$',
    description:
      'Professional laundry, dry cleaning, ironing, stain removal, and commercial hotel linen care in Unawatuna, Galle, Sri Lanka.',
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
    sameAs: [
      'https://maps.app.goo.gl/HLJGzPCVZwySjSTK6',
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday', 'Monday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Laundry & Linen Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Professional Washing' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Dry Cleaning' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Precision Pressing & Ironing' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Stain Removal Treatment' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Commercial Hotel Linen Care' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Villa & Guest House Laundry' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Linen Management for Hospitality' } },
      ],
    },
  };

  // FAQPage schema — boosts rich result FAQ snippets in Google SERP
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where is Ananke Laundry located in Unawatuna?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ananke Laundry is located at No. 195/2, Matara Road, Unawatuna, Galle, Sri Lanka. It is easily accessible on the main Matara Road connecting Galle and Unawatuna.',
        },
      },
      {
        '@type': 'Question',
        name: 'What laundry services does Ananke Laundry offer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ananke Laundry offers professional washing, dry cleaning, precision pressing, stain removal, commercial hotel linen care, villa laundry, and linen management for the hospitality sector in Galle and Unawatuna.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you provide commercial laundry services for hotels and villas in Galle?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Commercial laundry for the Southern hospitality sector is a primary focus. We service hotels, boutique stays, luxury villas, guest houses, and restaurants across Unawatuna and Galle. Call 091 225 0777 or request a quotation online.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the opening hours of Ananke Laundry?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We are open Tuesday through Friday: 8:00 AM – 5:00 PM, and Saturday, Sunday & Monday: 8:00 AM – 6:00 PM. Hours may vary on public holidays.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I get a price quote for laundry or linen services?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can submit the Request a Quote form on our website at anankelaundry.lk, or call our Unawatuna team directly on 091 225 0777.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Ananke Laundry offer dry cleaning in Galle?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Ananke Laundry provides professional dry cleaning services for delicate fabrics, suits, formal wear, and specialty garments in Galle and Unawatuna, Sri Lanka.',
        },
      },
    ],
  };

  // WebSite schema with SearchAction for Google Sitelinks search box
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Ananke Laundry',
    url: 'https://www.anankelaundry.lk',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.anankelaundry.lk/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} scroll-smooth`}>
      <head>
        <meta name="google-site-verification" content="fwf55F3-5MX4DnsyloGTqmbJiFT9fEkrzZsnbjvqhvQ" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ananke Laundry" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        {/* LocalBusiness schema — enables Google Business rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        {/* FAQPage schema — enables FAQ rich snippets in SERP */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        {/* WebSite schema — enables Sitelinks Search Box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased bg-cream min-h-screen flex flex-col font-body text-dark selection:bg-accent/30 selection:text-dark">
        <LanguageProvider>
          <PwaProvider>
            <OrderModalProvider>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <FloatingActions />
              <PwaInstallPrompt />
              <Footer />
            </OrderModalProvider>
          </PwaProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
