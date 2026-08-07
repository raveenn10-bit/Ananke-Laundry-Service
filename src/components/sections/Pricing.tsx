'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

const categories = ['Everyday Laundry', 'Dry Cleaning', 'Ironing', 'Bedding', 'Express Service', 'Commercial'];

const pricingData = [
  { name: 'Wash & Fold (Per kg)', price: '300', unit: 'per kg', category: 'Everyday Laundry' },
  { name: 'Shirts / T-Shirts', price: '150', unit: 'per item', category: 'Everyday Laundry' },
  { name: 'Trousers / Jeans', price: '200', unit: 'per item', category: 'Everyday Laundry' },
  { name: 'Suits (2 Piece)', price: '1200', unit: 'per set', category: 'Dry Cleaning' },
  { name: 'Dresses', price: '800', unit: 'from', category: 'Dry Cleaning' },
  { name: 'Jackets / Coats', price: '900', unit: 'from', category: 'Dry Cleaning' },
  { name: 'Shirts (Iron Only)', price: '100', unit: 'per item', category: 'Ironing' },
  { name: 'Trousers (Iron Only)', price: '120', unit: 'per item', category: 'Ironing' },
  { name: 'Bedsheet (Single)', price: '250', unit: 'per item', category: 'Bedding' },
  { name: 'Bedsheet (Double)', price: '350', unit: 'per item', category: 'Bedding' },
  { name: 'Duvet Cover', price: '450', unit: 'per item', category: 'Bedding' },
  { name: 'Pillow Cases', price: '80', unit: 'per item', category: 'Bedding' },
  { name: 'Wash & Fold (Same Day)', price: '600', unit: 'per kg', category: 'Express Service' },
  { name: 'Ironing (Same Day)', price: '200', unit: 'per item', category: 'Express Service' },
  { name: 'Hotel Linen', price: 'Contact Us', unit: 'bulk rates', category: 'Commercial' },
  { name: 'Staff Uniforms', price: 'Contact Us', unit: 'bulk rates', category: 'Commercial' },
];

export default function Pricing() {
  const [activeTab, setActiveTab] = useState('Everyday Laundry');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const filteredPricing = pricingData.filter((item) => item.category === activeTab);

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
          <h2 className="text-3xl md:text-5xl font-bold text-dark mb-4">
            Simple & Transparent <span className="italic font-heading text-olive">Pricing</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Affordable rates for premium care. Prices are indicative – please contact us for exact rates based on your specific requirements.
          </p>
        </motion.div>

        {/* Tabs - horizontally scrollable filter buttons on mobile */}
        <div className="flex overflow-x-auto no-scrollbar scrollbar-none pb-2 sm:pb-0 justify-start sm:justify-center gap-2 mb-10 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === cat 
                  ? 'bg-olive text-white shadow-md shadow-olive/20' 
                  : 'bg-white border border-gray-200 text-dark hover:border-olive/50'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Pricing Cards - Horizontally scrollable on mobile, grid on desktop */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 max-w-5xl md:gap-6 no-scrollbar scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <AnimatePresence mode="popLayout">
            {filteredPricing.map((item, idx) => (
              <motion.div
                key={item.name}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 hover:border-olive/30 hover:shadow-md transition-all flex flex-col justify-between min-w-[260px] sm:min-w-[290px] md:min-w-0 snap-start flex-shrink-0 md:flex-shrink"
              >
                <div>
                  <h3 className="font-heading font-semibold text-lg text-dark mb-1">{item.name}</h3>
                  <div className="text-gray-400 text-xs mb-4">Prices are indicative</div>
                </div>
                <div className="flex items-baseline gap-1 pt-4 border-t border-gray-100">
                  {item.price !== 'Contact Us' && <span className="text-xs text-gray-500 font-medium">From LKR</span>}
                  <span className="text-2xl font-bold text-olive">{item.price}</span>
                  <span className="text-xs text-gray-500">/ {item.unit}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

