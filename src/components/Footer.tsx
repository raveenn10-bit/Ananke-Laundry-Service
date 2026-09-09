'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Phone, MapPin, Clock, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const QUICK_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Commercial Laundry', href: '/commercial' },
  { name: 'Pricing & Tiers', href: '/pricing' },
  { name: 'Our Facility', href: '/gallery' },
  { name: 'Contact & Quote', href: '/contact' },
];

const SERVICES = [
  { name: 'Professional Washing', href: '/services' },
  { name: 'Steam Pressing & Ironing', href: '/services' },
  { name: 'Dry Cleaning Solutions', href: '/services' },
  { name: 'Stain Removal Care', href: '/services' },
  { name: 'Linen Care & Sanitizing', href: '/services' },
  { name: 'Commercial Hospitality', href: '/commercial' },
  { name: 'Hotel Linen Management', href: '/commercial' },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-cream pt-16 pb-24 md:pb-12 border-t border-white/10 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-olive/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-12">
          {/* Col 1: Brand & Positioning - spans 2 columns on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-2 md:col-span-1 flex flex-col gap-4"
          >
            <div className="relative h-[55px] w-full max-w-[180px]">
              <Image
                src="/logo.png"
                alt="Ananke Laundry Logo"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="font-body text-cream/80 text-xs sm:text-sm leading-relaxed">
              Professional laundry and linen-care solutions from Unawatuna, serving individual customers and hospitality businesses across Sri Lanka&apos;s Southern region.
            </p>
            <div className="pt-2 text-xs text-cream/60">
              <span className="text-accent font-semibold block mb-0.5">ANANKE LAUNDRY (PVT) LTD</span>
              Part of Cleanline Linen Management&apos;s professional network.
            </div>
            <div className="flex flex-col gap-1.5 pt-1 text-xs sm:text-sm">
              <a
                href="tel:+94912250777"
                className="inline-flex items-center gap-2 text-cream hover:text-accent transition-colors"
              >
                <Phone size={14} className="text-accent shrink-0" />
                <span>091 225 0777</span>
              </a>
              <a
                href="https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-2 text-cream/80 hover:text-accent transition-colors"
              >
                <MapPin size={14} className="text-accent shrink-0 mt-1" />
                <span>No. 195/2, Matara Road, Unawatuna, Galle</span>
              </a>
            </div>
          </motion.div>

          {/* Col 2: Quick Links - 1 column on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="col-span-1"
          >
            <h4 className="font-heading text-base sm:text-lg font-semibold mb-4 text-accent">Quick Links</h4>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="font-body text-cream/70 hover:text-accent text-xs sm:text-sm transition-colors hover:translate-x-1 inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Col 3: Services - 1 column on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="col-span-1"
          >
            <h4 className="font-heading text-base sm:text-lg font-semibold mb-4 text-accent">Services</h4>
            <ul className="flex flex-col gap-2.5">
              {SERVICES.map((service) => (
                <li key={service.name}>
                  <Link href={service.href} className="font-body text-cream/70 hover:text-accent text-xs sm:text-sm transition-colors hover:translate-x-1 inline-block">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Col 4: Business Hours & Location - spans 2 columns on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="col-span-2 md:col-span-1 flex flex-col gap-3"
          >
            <h4 className="font-heading text-base sm:text-lg font-semibold text-accent flex items-center gap-2">
              <Clock size={16} /> Opening Hours
            </h4>
            <div className="space-y-1.5 text-xs sm:text-sm text-cream/80">
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span>Monday:</span>
                <span className="font-medium text-cream">9:00 AM – 5:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span>Tuesday – Friday:</span>
                <span className="font-medium text-cream">9:00 AM – 6:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span>Saturday – Sunday:</span>
                <span className="font-medium text-cream">9:00 AM – 5:00 PM</span>
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-cream/60 leading-normal mt-1">
              * Opening hours may vary on public holidays. Please contact us before visiting.
            </p>
            <div className="pt-2">
              <a
                href="https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-cream px-3.5 py-2 rounded-lg transition-colors border border-white/15"
              >
                <span>Get Directions (Google Maps)</span>
                <ArrowUpRight size={13} className="text-accent" />
              </a>
            </div>
          </motion.div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="font-body text-cream/60 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} Ananke Laundry (Pvt) Ltd. All Rights Reserved.
          </p>
          <p className="font-body text-cream/40 text-[11px] sm:text-xs">
            Unawatuna, Galle, Sri Lanka &bull; Cleanline Linen Management Network
          </p>
        </div>
      </div>
    </footer>
  );
}
