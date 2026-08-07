'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { WashingMachine, Sparkles, Shirt, Package, Truck, BedDouble, Building, Droplets } from 'lucide-react';

const services = [
  { title: 'Professional Washing', image: '/images/service-washing.jpg', icon: WashingMachine, desc: 'Everyday laundry washed with care using premium detergents.' },
  { title: 'Dry Cleaning', image: '/images/service-drycleaning.jpg', icon: Sparkles, desc: 'Specialized care for delicate fabrics and suits.' },
  { title: 'Ironing', image: '/images/service-ironing.jpg', icon: Shirt, desc: 'Crisp, professional pressing for a perfect finish.' },
  { title: 'Folding & Packing', image: '/images/service-folding.jpg', icon: Package, desc: 'Neatly folded and packed, ready for your wardrobe.' },
  { title: 'Pickup & Delivery', image: '/images/service-pickup.jpg', icon: Truck, desc: 'Convenient door-to-door service across Unawatuna.' },
  { title: 'Bedding & Linen', image: '/images/service-bedding.jpg', icon: BedDouble, desc: 'Fresh, sanitized cleaning for bedsheets and duvets.' },
  { title: 'Hotel / Villa Laundry', image: '/images/service-hotel.jpg', icon: Building, desc: 'Bulk commercial laundry solutions for hospitality.' },
  { title: 'Stain Treatment', image: '/images/service-stain.jpg', icon: Droplets, desc: 'Advanced stain removal techniques for tough spots.' },
];

export default function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="services" className="py-20 md:py-28 bg-cream">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-olive font-semibold tracking-wider text-sm uppercase mb-3 block"
          >
            OUR SERVICES
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-dark mb-6"
          >
            We Provide The Best Laundry <span className="font-heading italic text-accent font-normal">Experience</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg mb-8"
          >
            From everyday wear to delicate fabrics, we offer a comprehensive range of services tailored to meet all your garment care needs.
          </motion.p>
          <motion.a
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            href="#pricing"
            className="inline-block border-b-2 border-olive text-olive hover:text-accent hover:border-accent pb-1 font-medium transition-colors"
          >
            View All Services
          </motion.a>
        </div>

        <div ref={ref} className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-8 no-scrollbar scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * idx, duration: 0.5 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col min-w-[270px] sm:min-w-0 snap-start flex-shrink-0 sm:flex-shrink"
            >
              <div className="relative h-[180px] sm:h-[200px] overflow-hidden bg-gray-200">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute -bottom-4 left-6 w-12 h-12 bg-olive rounded-full flex items-center justify-center text-white border-4 border-white z-10 shadow-sm group-hover:bg-accent transition-colors">
                  <service.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="p-6 pt-8 flex-grow flex flex-col">
                <h3 className="font-heading font-semibold text-xl text-dark mb-2">{service.title}</h3>
                <p className="text-gray-500 text-sm mb-4 flex-grow">{service.desc}</p>
                <a href="#booking" className="text-olive hover:text-accent font-medium text-sm inline-flex items-center transition-colors mt-auto">
                  Learn More <span className="ml-1">→</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
