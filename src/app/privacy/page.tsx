import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Mail, Phone, MapPin } from 'lucide-react';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Privacy Policy | Ananke Laundry',
  description:
    'Read the official privacy policy of Ananke Laundry in Unawatuna, Galle. Learn how we collect, use, and safeguard customer personal information.',
  alternates: {
    canonical: 'https://anankelaundry.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        badge="LEGAL & POLICIES"
        title="Privacy"
        highlightedTitle="Policy"
        subtitle="Our commitment to safeguarding customer confidentiality, personal information, and data privacy."
        breadcrumbs={[{ label: 'Privacy Policy' }]}
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
                  DATA PROTECTION &amp; PRIVACY
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark mb-3">
                  PRIVACY POLICY &mdash; ANANKE LAUNDRY
                </h2>
                <p className="text-gray-600 text-sm sm:text-base font-body leading-relaxed">
                  Ananke Laundry respects your privacy and takes reasonable measures to protect your personal information.
                </p>
              </div>

              {/* Sections */}
              <div className="space-y-8 text-sm sm:text-base text-gray-700 leading-relaxed font-body">
                {/* 1. Information We May Collect */}
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-dark mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive" />
                    INFORMATION WE MAY COLLECT
                  </h3>
                  <p className="text-gray-600 mb-3">
                    When customers use our website or services, we may collect information such as:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 pl-2">
                    {[
                      'Name',
                      'Telephone / WhatsApp number',
                      'Email address',
                      'Pickup and delivery information',
                      'Order details',
                      'Invoice information',
                      'Customer communications',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-olive/70 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. How We Use Information */}
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-dark mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive" />
                    HOW WE USE INFORMATION
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Customer information may be used where reasonably necessary to:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 pl-2">
                    {[
                      'Provide laundry and garment-care services',
                      'Process and manage customer orders',
                      'Manage invoices and payments',
                      'Provide pickup and delivery services',
                      'Communicate with customers',
                      'Provide order status information',
                      'Provide customer support',
                      'Maintain and improve our services',
                      'Protect the security of our systems',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-olive/70 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Service Providers */}
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-dark mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive" />
                    SERVICE PROVIDERS
                  </h3>
                  <p className="text-gray-600">
                    Customer information may be processed through trusted services used to operate our business, including website hosting, invoicing, order-management, and customer-communication systems.
                  </p>
                </div>

                {/* 4. Personal Information */}
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-dark mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive" />
                    PERSONAL INFORMATION
                  </h3>
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 font-medium">
                    Ananke Laundry does not sell customer personal information.
                  </div>
                </div>

                {/* 5. Data Security */}
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-dark mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive" />
                    DATA SECURITY
                  </h3>
                  <p className="text-gray-600">
                    We take reasonable technical and organisational measures to protect customer information from unauthorised access, loss, misuse, or disclosure.
                  </p>
                </div>

                {/* 6. Contact */}
                <div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-dark mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive" />
                    CONTACT
                  </h3>
                  <p className="text-gray-600 mb-4">
                    If a customer has questions regarding their personal information or this Privacy Policy, they may contact Ananke Laundry.
                  </p>

                  <div className="p-4 rounded-2xl bg-cream/40 border border-cream-dark text-xs sm:text-sm text-gray-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-olive shrink-0" />
                      <span>No. 195/2, Matara Road, Unawatuna, Galle, Sri Lanka</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={15} className="text-olive shrink-0" />
                      <span>Hotline: +94 91 225 0777 &bull; WhatsApp: +94 74 269 7909</span>
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
