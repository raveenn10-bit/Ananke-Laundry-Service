'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const filteredPricing = pricingData.filter((item) => item.category === activeTab);

  return (
    <section id="pricing" className="py-20 md:py-28 bg-cream">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-dark mb-4">Simple & Transparent Pricing</h2>
          <p className="text-gray-600">Affordable rates for premium care. Prices are indicative – please contact us for exact rates based on your specific requirements.</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === cat 
                  ? 'bg-olive text-white' 
                  : 'bg-white border border-gray-200 text-dark hover:border-olive/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filteredPricing.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-heading font-semibold text-lg text-dark mb-1">{item.name}</h3>
                  <div className="text-gray-400 text-xs mb-4">Prices are indicative</div>
                </div>
                <div className="flex items-baseline gap-1">
                  {item.price !== 'Contact Us' && <span className="text-sm text-gray-500">From LKR</span>}
                  <span className="text-2xl font-bold text-olive">{item.price}</span>
                  <span className="text-sm text-gray-500">/ {item.unit}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
