'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, Phone, MapPin } from 'lucide-react';

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div ref={ref} className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.15, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2"
          >
            <span className="text-olive font-semibold tracking-wider text-xs sm:text-sm uppercase mb-3 block">
              ABOUT ANANKE LAUNDRY
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-dark mb-6 leading-tight font-heading">
              Professional Laundry Care from the Heart of <span className="italic text-olive font-normal">Unawatuna</span>
            </h2>
            <div className="space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed mb-8 font-body">
              <p>
                Ananke Laundry operates from Unawatuna in Sri Lanka&apos;s Southern Province, serving an area celebrated for its boutique hotels, coastal villas, guest houses, and dynamic tourism economy.
              </p>
              <p>
                Ananke Laundry became connected with Cleanline Linen Management as part of Cleanline&apos;s expansion into Sri Lanka&apos;s Southern hospitality market. This synergy brings industrial-grade linen management standards and structured processing workflows directly to Southern properties and residents.
              </p>
              <p>
                Our ongoing focus is to provide dependable, professional laundry and linen-care solutions while making it effortless for local clients and businesses to contact us, request a transparent quotation, and access our convenient Unawatuna facility on Matara Road.
              </p>
            </div>
            
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {[
                'Commercial Linen Management',
                'Unawatuna Facility & Collection',
                'Cleanline Operational Standards',
                'Dedicated Hospitality Support',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-dark font-medium text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="inline-block bg-olive hover:bg-accent text-white hover:text-dark px-7 py-3.5 rounded-full font-semibold text-sm transition-all shadow-md"
              >
                Request a Quote
              </a>
              <a
                href="tel:+94912250777"
                className="inline-flex items-center gap-2 border border-gray-300 hover:border-olive text-dark hover:text-olive px-6 py-3.5 rounded-full font-medium text-sm transition-colors"
              >
                <Phone size={15} className="text-olive" />
                Call 091 225 0777
              </a>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.15, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl z-10 bg-gray-200 border border-gray-100">
              <Image
                src="/images/about-facility.jpg"
                alt="Ananke Laundry Facility in Unawatuna"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-dark/85 backdrop-blur-md text-white p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-accent text-xs font-semibold uppercase">Facility Location</p>
                  <p className="text-white text-xs sm:text-sm font-medium">No. 195/2, Matara Road, Unawatuna</p>
                </div>
                <a
                  href="https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-accent hover:text-dark transition-colors"
                  aria-label="Google Maps directions"
                >
                  <MapPin size={18} />
                </a>
              </div>
            </div>
            {/* Decorative Offset Border */}
            <div className="absolute -inset-4 border-2 border-accent/40 rounded-3xl z-0 translate-x-4 translate-y-4 opacity-40 hidden md:block"></div>
            {/* Decorative Blob */}
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-olive rounded-full blur-3xl opacity-20 z-0"></div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
