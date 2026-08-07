'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function InfoBar() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const infoItems = [
    {
      icon: MapPin,
      label: 'Location',
      value: '195/2, Matara Road, Unawatuna',
      link: 'https://maps.app.goo.gl/7FCjn432AeM9KkXDA?g_st=ic',
    },
    {
      icon: Phone,
      label: 'Call Us',
      value: '+94 74 269 7909',
      link: 'tel:+94742697909',
    },
    {
      icon: Mail,
      label: 'Email Us',
      value: 'chinthaka.ananke@gmail.com',
      link: 'mailto:chinthaka.ananke@gmail.com',
    },
    {
      icon: Clock,
      label: 'Opening Hours',
      value: 'Mon – Sun: 7:00 AM – 8:00 PM',
      link: null,
    },
  ];

  return (
    <div className="w-full px-0 md:px-4 md:-mt-12 relative z-20">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        id="info-bar"
        className="bg-primary text-white md:rounded-2xl mx-auto max-w-7xl shadow-xl overflow-hidden"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {infoItems.map((item, idx) => (
            <div key={idx} className="p-6 flex items-start gap-4 hover:bg-white/5 transition-colors">
              <div className="bg-olive/20 p-3 rounded-full shrink-0 text-accent">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-medium mb-1">{item.label}</p>
                {item.link ? (
                  <a href={item.link} target={item.icon === MapPin ? '_blank' : '_self'} rel="noreferrer" className="font-semibold hover:text-accent transition-colors block text-sm xl:text-base">
                    {item.value}
                  </a>
                ) : (
                  <p className="font-semibold text-sm xl:text-base">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
