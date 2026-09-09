'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

/*
 * CLIENT CONFIRMATION REQUIRED:
 * Exact itemized price cards per item/kg (e.g. LKR per shirt, suit, or kg)
 * are excluded from display until verified official rate card is provided.
 * Presenting transparent quotation tiers based on volume, frequency, and care requirements.
 */

const categories = ['Commercial & Hospitality', 'Garment Care & Pressing', 'Dry Cleaning Solutions'];

const tierData = [
  {
    name: 'Hotel & Resort Bulk Linen',
    category: 'Commercial & Hospitality',
    desc: 'High-volume recurring linen washing, pressing, and packaging for hotels and beach resorts.',
    points: ['Bed sheets, duvet covers & pillowcases', 'Bath, hand & beach towels', 'Scheduled batch processing', 'Volume commercial rates'],
  },
  {
    name: 'Villa & Boutique Property Care',
    category: 'Commercial & Hospitality',
    desc: 'Flexible turnarounds customized for private coastal villas and boutique hospitality properties in Galle.',
    points: ['Plush bed and bath linen care', 'Table runners and luxury textiles', 'Check-in & check-out coordination', 'Direct account coordination'],
  },
  {
    name: 'Restaurant & Café Textiles',
    category: 'Commercial & Hospitality',
    desc: 'Specialized thermal washing and precision pressing for food & beverage operations.',
    points: ['Tablecloths and dinner napkins', 'Chef jackets and staff uniforms', 'Stain-release pre-treatment', 'Regular turnaround cycles'],
  },
  {
    name: 'Everyday Garment Washing',
    category: 'Garment Care & Pressing',
    desc: 'Gentle, fabric-friendly machine washing with premium detergents for local residents and travellers.',
    points: ['Cottons, linens & daily wear', 'Fabric-safe temperature cycles', 'Neat folding and packaging', 'Transparent quote based on load'],
  },
  {
    name: 'Steam Pressing & Ironing',
    category: 'Garment Care & Pressing',
    desc: 'Crisp professional steam pressing for garments that demand an immaculate appearance.',
    points: ['Formal shirts and blouses', 'Trousers, slacks and chinos', 'Dresses and evening apparel', 'Wrinkle-free hanger or fold pack'],
  },
  {
    name: 'Suits & Formal Attire',
    category: 'Dry Cleaning Solutions',
    desc: 'Specialized solvent care preserving structural linings, wool blends, and delicate fibers.',
    points: ['2-piece and 3-piece suits', 'Blazers, coats & evening jackets', 'Delicate fabric protection', 'Expert garment inspection'],
  },
  {
    name: 'Delicate & Evening Wear',
    category: 'Dry Cleaning Solutions',
    desc: 'Individualized cleaning techniques for fine garments, silks, and structure-sensitive textiles.',
    points: ['Silk, linen and delicate blends', 'Gentle pre-spotting treatment', 'Low-temperature finishing', 'Garment preservation standards'],
  },
];

export default function Pricing() {
  const [activeTab, setActiveTab] = useState('Commercial & Hospitality');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const filteredTiers = tierData.filter((item) => item.category === activeTab);

  return (
    <section id="pricing" className="py-20 md:py-28 bg-cream relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-olive font-semibold tracking-wider text-xs sm:text-sm uppercase mb-3 block">
            SERVICE TIERS &amp; QUOTATIONS
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-dark mb-4 font-heading">
            Transparent, Custom <span className="italic text-olive font-normal">Quotations</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed font-body">
            Because laundry requirements vary by textile type, volume, and commercial schedule, we provide tailored quotes to ensure accurate, fair pricing for every client.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar scrollbar-none pb-3 sm:pb-0 justify-start sm:justify-center gap-2 mb-10 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === cat
                  ? 'bg-olive text-white shadow-md shadow-olive/20'
                  : 'bg-white border border-gray-200 text-dark hover:border-olive/50'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex sm:hidden items-center justify-center gap-2 text-xs font-semibold text-olive mb-4 animate-pulse">
          <span>&larr; Swipe packages left to right &rarr;</span>
        </div>

        {/* Tier Cards */}
        <div
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto sm:gap-6 no-scrollbar scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <AnimatePresence mode="popLayout">
            {filteredTiers.map((tier, idx) => (
              <motion.div
                key={tier.name}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100/90 hover:border-olive/40 hover:shadow-lg transition-all flex flex-col justify-between min-w-[285px] sm:min-w-0 snap-start flex-shrink-0 sm:flex-shrink"
              >
                <div>
                  <div className="inline-block bg-olive/10 text-olive text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                    {tier.category}
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-dark mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-5 font-body">
                    {tier.desc}
                  </p>

                  <ul className="space-y-2 mb-6 pt-4 border-t border-gray-100">
                    {tier.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                        <CheckCircle2 size={15} className="text-accent shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">Pricing</span>
                    <span className="text-sm font-bold text-olive">Custom Quotation</span>
                  </div>
                  <a
                    href="#contact"
                    className="bg-primary hover:bg-olive text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-colors inline-flex items-center gap-1 shadow-sm"
                  >
                    <span>Get Quote</span>
                    <ArrowRight size={12} />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

