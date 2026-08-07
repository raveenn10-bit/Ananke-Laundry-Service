'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div ref={ref} className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2"
          >
            <span className="text-olive font-semibold tracking-wider text-sm uppercase mb-3 block">
              ABOUT US
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-dark mb-6 leading-tight">
              Care Beyond <span className="font-heading italic text-accent font-normal">Cleaning</span>
            </h2>
            <div className="space-y-4 text-gray-600 text-lg mb-8">
              <p>
                At Ananke Laundry, we believe that your garments deserve the utmost care and attention. Located in the heart of Unawatuna, we serve both local residents and the thriving hospitality sector.
              </p>
              <p>
                Our facility is equipped with modern machinery and staffed by a dedicated team of professionals who understand the nuances of fabric care. From everyday wear to delicate linens, we ensure everything comes back to you fresh, crisp, and perfectly clean.
              </p>
            </div>
            
            <ul className="space-y-3 mb-8">
              {[
                'Quality Garment Care',
                'Hygienic Process',
                'Fast & Reliable Turnaround',
                'Eco-Friendly Products'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-dark font-medium">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  {item}
                </li>
              ))}
            </ul>

            <a href="#services" className="inline-block bg-olive hover:bg-accent text-white px-8 py-4 rounded-full font-medium transition-colors">
              Learn More About Us
            </a>
          </motion.div>

          {/* Image */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl z-10 bg-gray-200">
              <Image
                src="/images/about-facility.jpg"
                alt="Ananke Laundry Facility"
                fill
                className="object-cover"
              />
            </div>
            {/* Decorative Offset Border */}
            <div className="absolute -inset-4 border-2 border-accent rounded-2xl z-0 translate-x-4 translate-y-4 opacity-50 hidden md:block"></div>
            {/* Decorative Blob */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-olive rounded-full blur-3xl opacity-20 z-0"></div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
