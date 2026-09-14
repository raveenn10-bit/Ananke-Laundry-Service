import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import BillPortal from '@/components/portal/BillPortal';
import { ShieldCheck, Phone, Clock, FileCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'View My Bill & Receipts | Ananke Laundry Unawatuna, Galle',
  description:
    'Securely view and download your commercial laundry invoices and payment receipts from Ananke Laundry in Unawatuna, Galle using phone number OTP verification.',
  alternates: {
    canonical: 'https://anankelaundry.com/my-bill',
  },
};

export default function MyBillPage() {
  return (
    <>
      <PageHero
        badge="SECURE CUSTOMER PORTAL"
        title="View My Bill &"
        highlightedTitle="Payment Receipts"
        subtitle="Access your laundry invoices, view real-time payment status, and download official PDF tax invoices and receipts securely with one-time verification."
        breadcrumbs={[{ label: 'View My Bill' }]}
      />

      <section className="py-12 md:py-20 bg-cream min-h-[60vh] relative overflow-hidden">
        {/* Subtle Ambient Background */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-olive/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <BillPortal />

          {/* Security & Support Guarantee Footer */}
          <div className="max-w-4xl mx-auto mt-16 pt-8 border-t border-gray-200/60 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-olive/15 text-olive flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-xs text-dark uppercase tracking-wider">
                  Bank-Grade Encryption
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Your bills and receipts are protected with one-time verification and signed customer sessions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-olive/15 text-olive flex items-center justify-center shrink-0">
                <FileCheck size={18} />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-xs text-dark uppercase tracking-wider">
                  Zoho Books Synchronized
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Direct connection with Ananke Laundry accounting records for real-time payment status.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-olive/15 text-olive flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-xs text-dark uppercase tracking-wider">
                  Billing Assistance
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Need help with an invoice? Call our Unawatuna billing team directly on{' '}
                  <a href="tel:+94912250777" className="text-olive hover:underline font-medium">
                    091 225 0777
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
