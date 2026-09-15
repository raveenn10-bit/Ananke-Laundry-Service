import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import OrderForm from '@/components/order/OrderForm';
import { Truck, Sparkles, ShieldCheck, Clock, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Place an Order | Ananke Laundry Unawatuna, Galle',
  description:
    'Place a laundry order with Ananke Laundry in Unawatuna, Galle. Select washing, pressing, dry cleaning, or linen management services with direct WhatsApp order confirmation.',
  alternates: {
    canonical: 'https://anankelaundry.com/order',
  },
};

export default function OrderPage() {
  return (
    <>
      <PageHero
        badge="WHATSAPP LAUNDRY ORDER"
        title="Place Your"
        highlightedTitle="Laundry Order"
        subtitle="Select your services, add your items, and choose pickup or drop-off in Unawatuna and Galle. Send your order directly to our team via WhatsApp."
        breadcrumbs={[{ label: 'Place an Order' }]}
      />

      <section className="py-12 md:py-20 bg-cream min-h-[60vh] relative overflow-hidden">
        {/* Subtle Ambient Background */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-olive/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <OrderForm />

          {/* Guarantees & Service Highlights */}
          <div className="max-w-3xl mx-auto mt-14 pt-8 border-t border-gray-200/60 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-olive/15 text-olive flex items-center justify-center shrink-0">
                <Truck size={18} />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-xs text-dark uppercase tracking-wider">
                  Pickup &amp; Delivery
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Available across Unawatuna, Thalpe, and Galle Southern coast.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-olive/15 text-olive flex items-center justify-center shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-xs text-dark uppercase tracking-wider">
                  Hotel Quality Finish
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Industrial steam ironers and gentle fabric detergents used.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-olive/15 text-olive flex items-center justify-center shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-xs text-dark uppercase tracking-wider">
                  Fast WhatsApp Response
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Our team confirms pickup time and pricing directly on WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
