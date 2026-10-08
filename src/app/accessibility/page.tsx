import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, MonitorSmartphone, HelpCircle, Phone, Mail } from 'lucide-react';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Accessibility Policy | Ananke Laundry',
  description:
    'Read the accessibility policy and inclusive digital standards of Ananke Laundry in Unawatuna, Galle.',
  alternates: {
    canonical: 'https://www.anankelaundry.lk/accessibility',
  },
};

export default function AccessibilityPage() {
  return (
    <>
      <PageHero
        badge="LEGAL & POLICIES"
        title="Accessibility"
        highlightedTitle="Policy"
        subtitle="Our dedication to providing an inclusive, clear, and barrier-free digital experience across all platforms."
        breadcrumbs={[{ label: 'Accessibility Policy' }]}
      />

      <section className="py-12 md:py-16 bg-cream border-t border-cream-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Back to Home Link */}
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-olive hover:text-primary transition-colors group"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                <span>Back to Home</span>
              </Link>
            </div>

            {/* Policy Article Container */}
            <article className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-xs border border-cream-dark/80 space-y-8">
              {/* Document Header */}
              <div className="border-b border-gray-100 pb-6">
                <span className="text-olive font-semibold tracking-wider text-xs uppercase block mb-1">
                  INCLUSIVE DIGITAL EXPERIENCE
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark mb-3">
                  ACCESSIBILITY POLICY &mdash; ANANKE LAUNDRY
                </h2>
                <p className="text-gray-600 text-sm sm:text-base font-body leading-relaxed">
                  Ananke Laundry aims to make our website and online services accessible and easy to use for as many customers as reasonably possible.
                </p>
              </div>

              {/* Policy Sections */}
              <div className="space-y-8 text-sm sm:text-base text-gray-700 leading-relaxed font-body">
                {/* 1. Our Approach */}
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-dark mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive" />
                    OUR APPROACH
                  </h3>
                  <p className="text-gray-600 mb-3">
                    We aim to provide:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 pl-2">
                    {[
                      'Readable website content',
                      'Clear navigation',
                      'Accessible forms',
                      'Suitable colour contrast',
                      'Keyboard-friendly interactions',
                      'Responsive layouts',
                      'Clear buttons and links',
                      'Mobile-friendly interfaces',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-olive/70 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Responsive Access */}
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-dark mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive" />
                    RESPONSIVE ACCESS
                  </h3>
                  <p className="text-gray-600">
                    The website should remain usable across common mobile phones, tablets, laptops, and desktop devices.
                  </p>
                </div>

                {/* 3. Continuous Improvement */}
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-dark mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive" />
                    CONTINUOUS IMPROVEMENT
                  </h3>
                  <p className="text-gray-600">
                    We will continue to improve the accessibility and usability of our website as our online services develop.
                  </p>
                </div>

                {/* 4. Accessibility Assistance */}
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-dark mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive" />
                    ACCESSIBILITY ASSISTANCE
                  </h3>
                  <p className="text-gray-600 mb-4">
                    If a customer experiences difficulty accessing any part of the Ananke Laundry website or using an online service, they may contact Ananke Laundry for reasonable assistance.
                  </p>

                  <div className="p-4 rounded-2xl bg-cream/40 border border-cream-dark text-xs sm:text-sm text-gray-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone size={15} className="text-olive shrink-0" />
                      <span>Phone: +94 91 225 0777 / WhatsApp: +94 74 269 7909</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={15} className="text-olive shrink-0" />
                      <span>Email: chinthaka.ananke@gmail.com</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Policies Navigation Bar */}
              <div className="pt-8 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                  Other Legal Policies
                </span>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Link
                    href="/terms"
                    className="px-3.5 py-1.5 rounded-full bg-cream/70 hover:bg-cream text-dark border border-cream-dark transition-colors font-medium"
                  >
                    Terms &amp; Conditions &rarr;
                  </Link>
                  <Link
                    href="/privacy"
                    className="px-3.5 py-1.5 rounded-full bg-cream/70 hover:bg-cream text-dark border border-cream-dark transition-colors font-medium"
                  >
                    Privacy Policy &rarr;
                  </Link>
                  <Link
                    href="/refund-policy"
                    className="px-3.5 py-1.5 rounded-full bg-cream/70 hover:bg-cream text-dark border border-cream-dark transition-colors font-medium"
                  >
                    Refund Policy &rarr;
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
