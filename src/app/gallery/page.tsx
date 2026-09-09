import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Factory } from 'lucide-react';
import PageHero from '@/components/PageHero';
import Gallery from '@/components/sections/Gallery';

export const metadata: Metadata = {
  title: 'Facility Tour & Gallery | Ananke Laundry Unawatuna, Galle',
  description:
    'Explore our Unawatuna laundry facility and equipment gallery. Authentic photos of commercial washers, steam presses, folding operations, and dedicated team.',
  alternates: {
    canonical: 'https://anankelaundry.com/gallery',
  },
};

const standards = [
  {
    icon: Factory,
    title: 'Commercial Processing Equipment',
    desc: 'Heavy-duty industrial washing machines and high-capacity dryers calibrated for maximum fabric hygiene and consistent cycle efficiency.',
  },
  {
    icon: Sparkles,
    title: 'Precision Rotary & Steam Pressing',
    desc: 'Commercial flatwork ironers and specialized steam presses producing smooth, crisp finishes on hotel sheets and guest garments.',
  },
  {
    icon: ShieldCheck,
    title: 'Rigorous Quality Checks',
    desc: 'Every item is inspected before and after laundering to verify stain removal, stitching preservation, and proper packaging.',
  },
];

export default function GalleryPage() {
  return (
    <>
      <PageHero
        badge="BEHIND THE SCENES"
        title="Facility Tour &"
        highlightedTitle="Process Gallery"
        subtitle="Take an authentic look inside our Unawatuna laundry facility, commercial processing floor, industrial finishing equipment, and dedicated textile care team at work."
        breadcrumbs={[{ label: 'Facility' }]}
      />

      {/* Main Interactive Gallery & Lightbox */}
      <Gallery />

      {/* Standards Behind the Facility */}
      <section className="py-16 md:py-24 bg-white border-t border-b border-cream-dark">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-olive font-semibold tracking-wider text-xs sm:text-sm uppercase mb-2 block">
              OPERATIONAL EXCELLENCE
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-dark mb-4">
              Modern Equipment &amp; <span className="italic text-olive font-normal">Trained Personnel</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base font-body leading-relaxed">
              We invest in reliable commercial technology and train our team according to Cleanline Linen Management’s corporate guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {standards.map((std) => (
              <div
                key={std.title}
                className="bg-cream rounded-3xl p-8 border border-cream-dark shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-olive text-white flex items-center justify-center mb-6 shadow-md shadow-olive/20">
                    <std.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-dark mb-3">
                    {std.title}
                  </h3>
                  <p className="text-gray-600 text-sm font-body leading-relaxed">
                    {std.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facility Location Callout */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-olive/15 text-olive flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-xl text-dark mb-1">
                  Visit Our Unawatuna Facility
                </h3>
                <p className="text-gray-600 text-sm font-body">
                  No. 195/2, Matara Road, Unawatuna, Galle &bull; Open Mon–Sun
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
              <a
                href="https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-olive hover:bg-accent text-white hover:text-dark px-5 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Get Directions</span>
                <ArrowRight size={14} />
              </a>
              <Link
                href="/contact"
                className="bg-primary hover:bg-dark text-white px-5 py-3 rounded-full text-xs sm:text-sm font-semibold transition-colors"
              >
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
