import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, ArrowRight, CheckCircle2, Sparkles, Shirt, Building, Clock } from 'lucide-react';
import PageHero from '@/components/PageHero';
import Services from '@/components/sections/Services';
import HowItWorks from '@/components/sections/HowItWorks';
import FAQ from '@/components/sections/FAQ';

export const metadata: Metadata = {
  title: 'Professional Laundry Services | Ananke Laundry Unawatuna, Galle',
  description:
    'Comprehensive laundry services in Unawatuna, Galle: professional washing, pressing, dry cleaning, stain removal, and hospitality linen care by Ananke Laundry.',
  alternates: {
    canonical: 'https://anankelaundry.com/services',
  },
};

const serviceDetails = [
  {
    icon: Shirt,
    title: 'Individual & Guest Laundry',
    desc: 'For local residents, expatriates, and travelers staying in the Unawatuna and Galle beach areas. Fast turnaround, careful fabric separation, and clean packaging.',
    features: ['Daily wear & delicate fabrics', 'Stain spot-treatment on request', 'Steam pressed or neatly folded', 'Convenient collection at Unawatuna'],
  },
  {
    icon: Building,
    title: 'Hospitality & Commercial Linen',
    desc: 'Designed for boutique villas, hotels, and guest houses that need reliable batch processing of sheets, duvets, pillowcases, and pool towels.',
    features: ['Standardized thermal washing', 'Continuous rotary ironing', 'Hygienic bundle wrapping', 'Custom volume pricing'],
  },
  {
    icon: Sparkles,
    title: 'Delicate & Dry Cleaning',
    desc: 'Specialized care for formal suits, dresses, linen garments, and structure-sensitive textiles that require low-moisture or solvent-based treatment.',
    features: ['Suit & blazer care', 'Formal gowns & silk garments', 'Protective garment bags', 'Integrity inspection'],
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        badge="PRECISION TEXTILE CARE"
        title="Comprehensive"
        highlightedTitle="Laundry Services"
        subtitle="From individual garment care and delicate dry cleaning to high-capacity hospitality linen processing, discover our full spectrum of textile solutions in Unawatuna."
        breadcrumbs={[{ label: 'Services' }]}
      />

      {/* Main Services Component */}
      <Services />

      {/* Deep-dive Service Categories */}
      <section className="py-16 md:py-24 bg-white border-t border-b border-cream-dark">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-olive font-semibold tracking-wider text-xs sm:text-sm uppercase mb-2 block">
              SERVICE SPECIALIZATIONS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-dark">
              Tailored Care for <span className="italic text-olive font-normal">Every Requirement</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {serviceDetails.map((service, idx) => (
              <div
                key={service.title}
                className="bg-cream rounded-3xl p-8 border border-cream-dark shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-olive text-white flex items-center justify-center mb-6 shadow-md shadow-olive/20">
                    <service.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-dark mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm font-body leading-relaxed mb-6">
                    {service.desc}
                  </p>
                  <ul className="space-y-2.5 mb-6 pt-4 border-t border-gray-200/80">
                    {service.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <CheckCircle2 size={15} className="text-accent shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/contact"
                  className="mt-4 inline-flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-olive text-dark hover:text-white border border-gray-200 font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm"
                >
                  <span>Request Quote for This Service</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <HowItWorks />

      {/* FAQ Section */}
      <FAQ />

      {/* Bottom CTA */}
      <section className="py-16 bg-primary text-white text-center relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading mb-4">
            Need an Accurate Quotation?
          </h2>
          <p className="text-cream/80 text-sm sm:text-base font-body mb-8">
            Tell us about your laundry type, volume, and turnaround requirements for a transparent, fast quotation.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link
              href="/contact"
              className="bg-accent hover:bg-olive text-dark hover:text-white font-semibold px-7 py-3.5 rounded-full transition-all text-sm shadow-md inline-flex items-center gap-2"
            >
              <span>Request a Quote Now</span>
              <ArrowRight size={15} />
            </Link>
            <a
              href="tel:+94912250777"
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3.5 rounded-full transition-colors text-sm inline-flex items-center gap-2 border border-white/20"
            >
              <Phone size={15} className="text-accent" />
              <span>091 225 0777</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
