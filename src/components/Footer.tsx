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
  { name: 'View My Bill & Receipts', href: '/my-bill' },
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
    <footer className="bg-primary text-cream pt-16 pb-28 lg:pb-14 border-t border-white/10 relative overflow-hidden">
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
                <span>091 225 0777 (Landline)</span>
              </a>
              <a
                href="https://wa.me/94742697909?text=Hello%20Ananke%20Laundry%2C%20I%20would%20like%20to%20inquire%20about%20your%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-cream hover:text-[#25D366] transition-colors"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                  <svg className="w-2 h-2 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.952 3.71 1.453 5.711 1.454h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </span>
                <span>074 269 7909 (WhatsApp)</span>
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
