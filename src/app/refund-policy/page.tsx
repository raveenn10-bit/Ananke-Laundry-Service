import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle, HelpCircle, Phone, Mail } from 'lucide-react';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Refund Policy | Ananke Laundry',
  description:
    'Review the official refund, re-cleaning, and payment review policy of Ananke Laundry in Unawatuna, Galle.',
  alternates: {
    canonical: 'https://anankelaundry.com/refund-policy',
  },
};

export default function RefundPolicyPage() {
  return (
    <>
      <PageHero
        badge="LEGAL & POLICIES"
        title="Refund"
        highlightedTitle="Policy"
        subtitle="Guidelines on order review requests, complimentary re-cleaning inspections, and payment resolutions."
        breadcrumbs={[{ label: 'Refund Policy' }]}
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
                  CUSTOMER CARE &amp; RESOLUTIONS
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark mb-3">
                  REFUND POLICY &mdash; ANANKE LAUNDRY
                </h2>
                <p className="text-gray-600 text-sm sm:text-base font-body leading-relaxed">
                  If you experience an issue with a laundry service or believe you have been incorrectly charged, please contact Ananke Laundry as soon as reasonably possible and provide the relevant invoice or order details.
                </p>
              </div>

              {/* Policy Sections */}
              <div className="space-y-7 text-sm sm:text-base text-gray-700 leading-relaxed font-body">
                {/* 1. Service Issues */}
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-dark mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive" />
                    SERVICE ISSUES
                  </h3>
                  <p className="text-gray-600">
                    Any issue relating to the condition, loss, damage, or processing of an item should be reported as soon as possible and in accordance with our Terms &amp; Conditions.
                  </p>
                </div>

                {/* 2. Refund Review */}
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-dark mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive" />
                    REFUND REVIEW
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Refunds, credits, re-cleaning, or other resolutions will be considered based on the individual circumstances of the order.
                  </p>
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-sm">
                    A refund is not automatically guaranteed once a laundry or garment-care service has been completed.
                  </div>
                </div>

                {/* 3. Re-Cleaning */}
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-dark mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive" />
                    RE-CLEANING
                  </h3>
                  <p className="text-gray-600">
                    Where appropriate, Ananke Laundry may first offer to inspect or re-clean an affected item before determining whether a refund, credit, or other resolution is applicable.
                  </p>
                </div>

                {/* 4. Approved Refunds */}
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-dark mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive" />
                    APPROVED REFUNDS
                  </h3>
                  <p className="text-gray-600">
                    If a refund is approved, it will be processed using an appropriate available payment method.
                  </p>
                </div>

                {/* 5. Customer Support */}
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-dark mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive" />
                    CUSTOMER SUPPORT
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Customers should provide their invoice or order details when contacting Ananke Laundry regarding a refund or service issue.
                  </p>

                  <div className="p-4 rounded-2xl bg-cream/40 border border-cream-dark text-xs sm:text-sm text-gray-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone size={15} className="text-olive shrink-0" />
                      <span>Direct Contact: +94 91 225 0777 / WhatsApp: +94 74 269 7909</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={15} className="text-olive shrink-0" />
                      <span>Email Support: chinthaka.ananke@gmail.com</span>
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
                    href="/accessibility"
                    className="px-3.5 py-1.5 rounded-full bg-cream/70 hover:bg-cream text-dark border border-cream-dark transition-colors font-medium"
                  >
                    Accessibility Policy &rarr;
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
