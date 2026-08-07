'use client';

import { motion } from 'framer-motion';
import { Building2, Utensils, Scissors, Coffee, Home, Briefcase, CheckCircle2 } from 'lucide-react';

const businessTypes = [
  { name: 'Hotels & Resorts', icon: Building2 },
  { name: 'Villas & Guest Houses', icon: Home },
  { name: 'Restaurants & Cafes', icon: Utensils },
  { name: 'Spas & Salons', icon: Scissors },
  { name: 'Airbnb Hosts', icon: Coffee },
  { name: 'Corporate Clients', icon: Briefcase },
];

export default function Commercial() {
  return (
    <section id="commercial" className="py-20 md:py-28 bg-primary text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <span className="text-accent font-semibold tracking-wider text-sm uppercase mb-3 block">
              B2B PARTNERSHIPS
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Commercial & Hotel Laundry Services
            </h2>
            <p className="text-white/80 text-lg mb-8">
              We provide reliable, high-volume laundry solutions tailored for businesses in the hospitality and service sectors. Focus on your guests while we take care of your linens and uniforms.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {businessTypes.map((type, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-lg text-accent">
                    <type.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sm md:text-base">{type.name}</span>
                </div>
              ))}
            </div>

            <ul className="space-y-3 pt-6 border-t border-white/10">
              {['Dedicated account manager', 'Flexible pickup and delivery schedules', 'Volume-based competitive pricing', 'Strict quality control'].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-olive" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <div className="bg-white text-dark rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full -z-0"></div>
              
              <h3 className="text-2xl font-bold mb-2 relative z-10">Request a Commercial Quote</h3>
              <p className="text-gray-600 mb-6 relative z-10">Tell us about your business needs and we'll prepare a custom proposal.</p>
              
              <form className="space-y-4 relative z-10" onSubmit={(e) => { e.preventDefault(); alert('Request submitted!'); }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required type="text" placeholder="Business Name" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none" />
                  <input required type="text" placeholder="Contact Person" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required type="tel" placeholder="Phone Number" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none" />
                  <input required type="email" placeholder="Email Address" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none" />
                </div>
                <div>
                  <select required className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none bg-white">
                    <option value="">Estimated Weekly Volume</option>
                    <option value="under-50">Under 50 kg</option>
                    <option value="50-100">50 - 100 kg</option>
                    <option value="100-300">100 - 300 kg</option>
                    <option value="300-500">300 - 500 kg</option>
                    <option value="over-500">Over 500 kg</option>
                  </select>
                </div>
                <div>
                  <textarea rows={3} placeholder="Additional details or specific requirements..." className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none resize-none"></textarea>
                </div>
                <button type="submit" className="w-full bg-accent hover:bg-olive hover:text-white text-dark font-bold py-4 rounded-full transition-colors">
                  Request Quote
                </button>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
