'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Where is Ananke Laundry located in Unawatuna?',
    a: 'Ananke Laundry is located at No. 195/2, Matara Road, Unawatuna, Galle, Sri Lanka (Google Plus Code: 268X+XPP). It is easily accessible on the main Matara Road connecting Galle and Unawatuna.',
  },
  {
    q: 'What core laundry and linen services do you provide?',
    a: 'We provide 7 verified service categories: Professional Washing, Precision Pressing, Dry Cleaning, Stain Removal, Linen Care, Commercial Laundry Solutions, and Linen Management for hospitality properties.',
  },
  {
    q: 'Can hotels, luxury villas, and restaurants request commercial agreements?',
    a: 'Yes. Commercial laundry for the Southern hospitality sector is a primary focus of our operation. We service hotels, boutique stays, luxury villas, guest houses, and restaurants across Unawatuna and Galle. You can request a quotation online or call 091 225 0777.',
  },
  {
    q: 'What are your operating hours?',
    a: 'We are open Monday: 9:00 AM – 5:00 PM, Tuesday through Friday: 9:00 AM – 6:00 PM, and Saturday & Sunday: 9:00 AM – 5:00 PM. Please note that opening hours may vary on public holidays, so feel free to call ahead before visiting.',
  },
  {
    q: 'How is Ananke Laundry connected with Cleanline Linen Management?',
    a: 'Ananke Laundry was acquired by Cleanline Linen Management (Pvt) Ltd around late 2023 to strengthen Cleanline’s presence and commercial linen infrastructure in Sri Lanka’s Southern tourism region.',
  },
  {
    q: 'How do I request a quotation for my business or garment care?',
    a: 'You can submit the Request a Quote form on this website with your estimated volume and textile requirements, or reach our Unawatuna team directly by calling 091 225 0777.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-28 bg-cream">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <span className="text-olive font-semibold tracking-wider text-xs sm:text-sm uppercase mb-3 block">
            QUESTIONS &amp; ANSWERS
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-dark mb-4 font-heading">
            Frequently Asked <span className="italic text-olive font-normal">Questions</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-body">
            Common questions regarding our services, commercial hospitality solutions, and Unawatuna facility.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200/70">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none group cursor-pointer"
                aria-expanded={openIndex === idx}
              >
                <span className="font-semibold text-dark text-sm sm:text-base pr-4 group-hover:text-olive transition-colors">
                  {faq.q}
                </span>
                <ChevronDown className={`w-5 h-5 text-olive transition-transform duration-300 shrink-0 ${openIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-6 pb-5 text-gray-600 text-xs sm:text-sm leading-relaxed font-body border-t border-gray-100 pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
