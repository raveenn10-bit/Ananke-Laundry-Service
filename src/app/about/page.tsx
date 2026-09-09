import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, ArrowRight, ShieldCheck, Award, Users2 } from 'lucide-react';
import PageHero from '@/components/PageHero';
import About from '@/components/sections/About';
import WhyChoose from '@/components/sections/WhyChoose';
import Sustainability from '@/components/sections/Sustainability';

export const metadata: Metadata = {
  title: 'About Us | Ananke Laundry Unawatuna, Galle',
  description:
    'Discover Ananke Laundry in Unawatuna, Galle. Professional laundry and commercial linen care connected with Cleanline Linen Management in Southern Sri Lanka.',
  alternates: {
    canonical: 'https://anankelaundry.com/about',
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        badge="OUR STORY & FACILITY"
        title="Professional Laundry Care in"
        highlightedTitle="Unawatuna"
        subtitle="Serving Unawatuna and the Southern Province with commercial-grade laundry excellence, modern equipment, and dedicated hospitality textile care."
        breadcrumbs={[{ label: 'About Us' }]}
      />

      <About />

      {/* Facility Highlights Section */}
      <section className="py-16 md:py-20 bg-cream border-t border-cream-dark">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-olive font-semibold tracking-wider text-xs sm:text-sm uppercase mb-2 block">
                STRATEGIC ADVANTAGE
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-dark">
                The Synergy of Local Agility &amp; <span className="italic text-olive font-normal">Industry Standards</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-olive/15 text-olive flex items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-dark mb-2">Cleanline Synergy</h3>
                <p className="text-gray-600 text-xs sm:text-sm font-body leading-relaxed">
                  Connected with Cleanline Linen Management’s corporate standards, bringing commercial processing workflows to Southern Sri Lanka.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-olive/15 text-olive flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-dark mb-2">Quality &amp; Hygiene</h3>
                <p className="text-gray-600 text-xs sm:text-sm font-body leading-relaxed">
                  Careful batch separation, precise wash temperatures, and pH-balanced rinsing designed to preserve fabric integrity and softness.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-olive/15 text-olive flex items-center justify-center mb-4">
                  <Users2 className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-dark mb-2">Dedicated Local Team</h3>
                <p className="text-gray-600 text-xs sm:text-sm font-body leading-relaxed">
                  Trained operators and pressing specialists working right at our Matara Road facility in Unawatuna to ensure fast, attentive service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WhyChoose />
      <Sustainability />

      {/* Call to Action Bar */}
      <section className="py-16 bg-primary text-white text-center relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading mb-4">
            Visit Our Facility or Request a Quote
          </h2>
          <p className="text-cream/80 text-sm sm:text-base font-body mb-8">
            Experience professional textile care in Unawatuna. Contact our team today for commercial or personal laundry service.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link
              href="/contact"
              className="bg-accent hover:bg-olive text-dark hover:text-white font-semibold px-7 py-3.5 rounded-full transition-all text-sm shadow-md inline-flex items-center gap-2"
            >
              <span>Get a Custom Quote</span>
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
