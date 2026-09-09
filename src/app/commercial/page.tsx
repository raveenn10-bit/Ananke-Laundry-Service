import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, ArrowRight, CheckCircle2, ShieldCheck, Building2, Utensils, Hotel, CalendarCheck } from 'lucide-react';
import PageHero from '@/components/PageHero';
import Commercial from '@/components/sections/Commercial';
import WhyChoose from '@/components/sections/WhyChoose';
import Sustainability from '@/components/sections/Sustainability';

export const metadata: Metadata = {
  title: 'Commercial Laundry & Linen Care | Ananke Laundry Unawatuna, Galle',
  description:
    'Dedicated commercial laundry and linen management for hotels, villas, guest houses, and restaurants in Galle & Unawatuna. Cleanline network standards.',
  alternates: {
    canonical: 'https://anankelaundry.com/commercial',
  },
};

const commercialTiers = [
  {
    icon: Hotel,
    title: 'Hotels & Beach Resorts',
    desc: 'High-volume recurring processing engineered to keep bed occupancy cycles fully supplied with pristine sheets, duvet covers, and bath towels.',
    benefits: ['Scheduled turnaround cycles', 'Batch tracking and separation', 'Volume commercial rates', 'Quality assurance checks'],
  },
  {
    icon: Building2,
    title: 'Private Villas & Boutique Estates',
    desc: 'Bespoke care for luxury boutique properties, high-thread-count linens, decorative cushions, and guest textiles across Galle and coastal towns.',
    benefits: ['Flexible turnover scheduling', 'Delicate fabric care', 'Neat linen packaging', 'Direct manager communication'],
  },
  {
    icon: Utensils,
    title: 'Restaurants, Cafés & Catering',
    desc: 'Thermal wash protocols and stain removal for table linens, chef jackets, aprons, and staff uniforms that face daily food service demands.',
    benefits: ['Stain pre-treatment', 'High-heat sanitization', 'Crisp table linen finishing', 'Predictable delivery timelines'],
  },
];

export default function CommercialPage() {
  return (
    <>
      <PageHero
        badge="B2B HOSPITALITY PARTNER"
        title="Commercial"
        highlightedTitle="Laundry & Linen Care"
        subtitle="Reliable high-capacity laundry solutions, structured turnaround cycles, and meticulous quality management engineered for hotels, resorts, villas, and restaurants across Southern Sri Lanka."
        breadcrumbs={[{ label: 'Commercial' }]}
      />

      {/* Main Commercial Component */}
      <Commercial />

      {/* Client Categories Breakdown */}
      <section className="py-16 md:py-24 bg-white border-t border-b border-cream-dark">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-olive font-semibold tracking-wider text-xs sm:text-sm uppercase mb-2 block">
              SECTOR SOLUTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-dark mb-4">
              Designed for Southern Sri Lanka’s <span className="italic text-olive font-normal">Hospitality Sector</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base font-body leading-relaxed">
              We understand that clean, fresh, crisp linen directly impacts your guests&apos; reviews, ratings, and return visits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {commercialTiers.map((tier) => (
              <div
                key={tier.title}
                className="bg-cream rounded-3xl p-8 border border-cream-dark shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-olive text-white flex items-center justify-center mb-6 shadow-md shadow-olive/20">
                    <tier.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-dark mb-3">
                    {tier.title}
                  </h3>
                  <p className="text-gray-600 text-sm font-body leading-relaxed mb-6">
                    {tier.desc}
                  </p>
                  <ul className="space-y-2.5 mb-6 pt-4 border-t border-gray-200/80">
                    {tier.benefits.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <CheckCircle2 size={15} className="text-accent shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/contact"
                  className="mt-4 inline-flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-olive text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm"
                >
                  <span>Request Commercial Consultation</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <WhyChoose />

      {/* Sustainability Section */}
      <Sustainability />

      {/* Commercial Onboarding Callout */}
      <section className="py-16 bg-primary text-white text-center relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-3xl">
          <span className="text-accent font-semibold tracking-wider text-xs uppercase mb-3 block">
            BECOME A COMMERCIAL CLIENT
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading mb-4">
            Partner with Ananke Laundry for Your Property
          </h2>
          <p className="text-cream/80 text-sm sm:text-base font-body mb-8 max-w-xl mx-auto">
            Discuss your seasonal volumes, turnaround timelines, and linen specifications with our commercial team. We provide custom itemized rate agreements.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link
              href="/contact"
              className="bg-accent hover:bg-olive text-dark hover:text-white font-semibold px-7 py-3.5 rounded-full transition-all text-sm shadow-md inline-flex items-center gap-2"
            >
              <span>Request Commercial Quotation</span>
              <ArrowRight size={15} />
            </Link>
            <a
              href="tel:+94912250777"
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3.5 rounded-full transition-colors text-sm inline-flex items-center gap-2 border border-white/20"
            >
              <Phone size={15} className="text-accent" />
              <span>Call 091 225 0777</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
