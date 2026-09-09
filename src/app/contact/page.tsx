import type { Metadata } from 'next';
import { Phone, MapPin, Clock, ArrowUpRight, Mail } from 'lucide-react';
import PageHero from '@/components/PageHero';
import Contact from '@/components/sections/Contact';
import FAQ from '@/components/sections/FAQ';

export const metadata: Metadata = {
  title: 'Contact Us & Request a Quote | Ananke Laundry Unawatuna, Galle',
  description:
    'Contact Ananke Laundry in Unawatuna, Galle. Call 091 225 0777 or submit a quotation request for hotel linen management and garment care.',
  alternates: {
    canonical: 'https://anankelaundry.com/contact',
  },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        badge="GET IN TOUCH"
        title="Contact Us &"
        highlightedTitle="Request a Quote"
        subtitle="Reach our Unawatuna team directly by phone, visit our Matara Road facility, or submit an online quotation request for commercial linen care or individual laundry."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      {/* Main Interactive Contact Component with Quote Form & Location */}
      <Contact />

      {/* Frequently Asked Questions */}
      <FAQ />
    </>
  );
}
