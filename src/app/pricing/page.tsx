import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, ArrowRight, CheckCircle2, Calculator, Scale, Clock3, Sparkles } from 'lucide-react';
import PageHero from '@/components/PageHero';
import Pricing from '@/components/sections/Pricing';
import FAQ from '@/components/sections/FAQ';

export const metadata: Metadata = {
  title: 'Pricing & Custom Quotations | Ananke Laundry Unawatuna, Galle',
  description:
    'Transparent laundry pricing and tailored quotations for hotels, villas, and personal garment care in Unawatuna, Galle by Ananke Laundry.',
  alternates: {
    canonical: 'https://anankelaundry.com/pricing',
  },
};

const pricingFactors = [
  {
    icon: Scale,
    title: 'Volume & Weight',
    desc: 'Commercial batches and large volume loads benefit from tiered economies of scale and preferential corporate pricing.',
  },
  {
    icon: Sparkles,
    title: 'Fabric & Care Type',
    desc: 'Different textiles require specialized wash cycles, temperature management, or solvent-based dry cleaning care.',
  },
  {
    icon: Clock3,
    title: 'Turnaround Requirements',
    desc: 'Regular scheduled recurring turnaround agreements ensure priority processing for hotels and coastal villas.',
  },
  {
    icon: Calculator,
    title: 'Finishing Services',
    desc: 'Choose between clean folding, high-pressure steam pressing, hanger packaging, or protective garment encasing.',
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        badge="TRANSPARENT QUOTATIONS"
        title="Service Tiers &"
        highlightedTitle="Quotations"
        subtitle="Because laundry requirements differ across delicate garments, high-thread-count linens, and commercial hotel volumes, we provide tailored quotes to ensure fair, transparent pricing."
        breadcrumbs={[{ label: 'Pricing' }]}
      />

      {/* Main Pricing Component with Categories and Tiers */}
      <Pricing />

      {/* How Quotations Are Calculated */}
      <section className="py-16 md:py-24 bg-white border-t border-b border-cream-dark">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-olive font-semibold tracking-wider text-xs sm:text-sm uppercase mb-2 block">
              QUOTATION TRANSPARENCY
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-dark mb-4">
              How We Determine Your <span className="italic text-olive font-normal">Quotation</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base font-body leading-relaxed">
              We avoid hidden fees and misleading one-size-fits-all prices. Every quotation is calculated based on clear, transparent criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pricingFactors.map((factor) => (
              <div
                key={factor.title}
                className="bg-cream rounded-2xl p-6 border border-cream-dark shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-olive/15 text-olive flex items-center justify-center mb-4">
                    <factor.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-dark mb-2">
                    {factor.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm font-body leading-relaxed">
                    {factor.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-olive hover:bg-accent text-white hover:text-dark px-8 py-4 rounded-full font-semibold text-sm transition-all shadow-md"
            >
              <span>Request a Custom Quote</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* Bottom CTA */}
      <section className="py-16 bg-primary text-white text-center relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading mb-4">
            Have Questions About Rates?
          </h2>
          <p className="text-cream/80 text-sm sm:text-base font-body mb-8">
            Speak directly with our team at Unawatuna. We are happy to review your laundry list or schedule a commercial sample batch.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link
              href="/contact"
              className="bg-accent hover:bg-olive text-dark hover:text-white font-semibold px-7 py-3.5 rounded-full transition-all text-sm shadow-md inline-flex items-center gap-2"
            >
              <span>Online Quote Request</span>
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
