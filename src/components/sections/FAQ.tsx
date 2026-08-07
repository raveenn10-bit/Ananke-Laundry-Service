'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'How long does laundry take?', a: 'Standard service takes 24-48 hours. Express service is available for faster turnaround. Contact us for exact timelines.' },
  { q: 'Do you offer pickup and delivery?', a: 'Yes, we offer convenient pickup and delivery across Unawatuna and surrounding areas.' },
  { q: 'Do you provide dry cleaning?', a: 'Yes, we offer professional dry cleaning for delicate fabrics and premium garments.' },
  { q: 'How do I book a pickup?', a: 'You can book via our website, call +94 74 269 7909, or message us on WhatsApp.' },
  { q: 'What areas do you cover?', a: 'We serve Unawatuna, Galle, and surrounding areas. Contact us to confirm coverage.' },
  { q: 'Can hotels and villas use your service?', a: 'Absolutely! We offer dedicated commercial laundry services for hotels, villas, guest houses, and hospitality businesses.' },
  { q: 'How are delicate garments handled?', a: 'Delicate items receive special care with appropriate cleaning methods, temperature controls, and gentle handling.' },
  { q: 'What payment methods are accepted?', a: 'Please contact us directly for current payment options.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-28 bg-cream">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-dark mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">Got questions? We've got answers.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
              >
                <span className="font-semibold text-dark pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-olive transition-transform duration-300 shrink-0 ${openIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 text-gray-600">
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
