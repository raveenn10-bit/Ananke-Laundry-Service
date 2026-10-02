import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Ananke Laundry',
  description:
    'Review the official terms and conditions for Ananke Laundry professional garment-care and commercial linen services in Unawatuna, Galle.',
  alternates: {
    canonical: 'https://anankelaundry.com/terms',
  },
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        badge="LEGAL & POLICIES"
        title="Terms &"
        highlightedTitle="Conditions"
        subtitle="Please review the service terms, owner responsibilities, and operational conditions governing all Ananke Laundry orders."
        breadcrumbs={[{ label: 'Terms & Conditions' }]}
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
                  OFFICIAL SERVICE AGREEMENT
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark mb-3">
                  TERMS &amp; CONDITIONS &mdash; ANANKE LAUNDRY
                </h2>
                <p className="text-gray-600 text-sm sm:text-base font-body leading-relaxed">
                  By using Ananke Laundry services, customers agree to the following terms and conditions.
                </p>
              </div>

              {/* Terms Items */}
              <div className="space-y-6 text-sm sm:text-base text-gray-700 leading-relaxed font-body">
                {/* 1 */}
                <div className="flex items-start gap-3.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-olive/10 text-olive font-bold text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-dark mb-1">
                      OWNER&apos;S RISK
                    </h3>
                    <p className="text-gray-600">
                      All laundry items are accepted at the owner&apos;s risk. Ananke Laundry will exercise the utmost care when handling and processing all items.
                    </p>
                  </div>
                </div>

                {/* 2 */}
                <div className="flex items-start gap-3.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-olive/10 text-olive font-bold text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-dark mb-1">
                      COLLECTION &amp; VERIFICATION
                    </h3>
                    <p className="text-gray-600">
                      The person handing over and collecting the items is responsible for verifying the items against the relevant receipt or invoice at the time of collection.
                    </p>
                  </div>
                </div>

                {/* 3 */}
                <div className="flex items-start gap-3.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-olive/10 text-olive font-bold text-xs shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-dark mb-1">
                      CLAIMS &amp; COMPLAINTS
                    </h3>
                    <p className="text-gray-600">
                      Any claim relating to loss, damage, missing items, or any other complaint must be reported at the time the items are collected and accepted.
                    </p>
                  </div>
                </div>

                {/* 4 */}
                <div className="flex items-start gap-3.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-olive/10 text-olive font-bold text-xs shrink-0 mt-0.5">
                    4
                  </span>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-base sm:text-lg text-dark mb-1">
                      SAME-DAY SERVICE
                    </h3>
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-sm leading-relaxed">
                      A <strong className="font-extrabold text-amber-900 underline decoration-amber-400 decoration-2">25% additional charge</strong> will be applied to orders requested for same-day completion or delivery.
                    </div>
                  </div>
                </div>

                {/* 5 */}
                <div className="flex items-start gap-3.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-olive/10 text-olive font-bold text-xs shrink-0 mt-0.5">
                    5
                  </span>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-base sm:text-lg text-dark mb-1">
                      LATE PAYMENTS
                    </h3>
                    <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/90 text-rose-950 text-sm leading-relaxed">
                      Delayed payments will be subject to a <strong className="font-extrabold text-rose-900 underline decoration-rose-400 decoration-2">10% late payment fee</strong>.
                    </div>
                  </div>
                </div>

                {/* 6 */}
                <div className="flex items-start gap-3.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-olive/10 text-olive font-bold text-xs shrink-0 mt-0.5">
                    6
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-dark mb-1">
                      GARMENT CONDITION
                    </h3>
                    <p className="text-gray-600">
                      Ananke Laundry takes reasonable care when handling garments but cannot guarantee the complete removal of all stains or accept responsibility for issues resulting from pre-existing damage, weak or defective fabrics, colour bleeding, incorrect care labels, or normal wear and tear.
                    </p>
                  </div>
                </div>

                {/* 7 */}
                <div className="flex items-start gap-3.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-olive/10 text-olive font-bold text-xs shrink-0 mt-0.5">
                    7
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-dark mb-1">
                      ITEMS LEFT IN GARMENTS
                    </h3>
                    <p className="text-gray-600">
                      Customers are responsible for checking and removing personal belongings from pockets before submitting garments for cleaning.
                    </p>
                  </div>
                </div>

                {/* 8 */}
                <div className="flex items-start gap-3.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-olive/10 text-olive font-bold text-xs shrink-0 mt-0.5">
                    8
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-dark mb-1">
                      SERVICE &amp; DELIVERY TIMES
                    </h3>
                    <p className="text-gray-600">
                      Estimated completion, pickup, and delivery times may vary depending on workload, garment condition, service requirements, or circumstances beyond our reasonable control.
                    </p>
                  </div>
                </div>

                {/* 9 */}
                <div className="flex items-start gap-3.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-olive/10 text-olive font-bold text-xs shrink-0 mt-0.5">
                    9
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-dark mb-1">
                      PRICING
                    </h3>
                    <p className="text-gray-600">
                      Final charges may vary depending on garment type, quantity, special treatment requirements, express or same-day service, pickup/delivery requirements, and other additional services requested.
                    </p>
                  </div>
                </div>

                {/* 10 */}
                <div className="flex items-start gap-3.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-olive/10 text-olive font-bold text-xs shrink-0 mt-0.5">
                    10
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-dark mb-1">
                      ACCEPTANCE OF TERMS
                    </h3>
                    <p className="text-gray-600">
                      By submitting items to Ananke Laundry for cleaning or garment-care services, the customer acknowledges and accepts these Terms &amp; Conditions.
                    </p>
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
