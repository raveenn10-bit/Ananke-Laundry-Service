'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);
const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
);
import { motion } from 'framer-motion';

const QUICK_LINKS = [
  { name: 'Home', href: '/#home' },
  { name: 'About', href: '/#about' },
  { name: 'Services', href: '/#services' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'Gallery', href: '/#gallery' },
  { name: 'Contact', href: '/#contact' },
];

const SERVICES = [
  { name: 'Washing', href: '/#services' },
  { name: 'Dry Cleaning', href: '/#services' },
  { name: 'Ironing', href: '/#services' },
  { name: 'Folding & Packing', href: '/#services' },
  { name: 'Pickup & Delivery', href: '/#services' },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-cream pt-16 pb-8 border-t border-white/10 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-olive/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Col 1: Logo & Tagline - spans 2 columns on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-2 md:col-span-1 flex flex-col gap-5"
          >
            <div className="relative h-[55px] w-full max-w-[180px]">
              <Image
                src="/logo.png"
                alt="Ananke Laundry Logo"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="font-body text-cream/80 text-sm leading-relaxed">
              Premium laundry and garment care services in Unawatuna, Sri Lanka. Freshness in Every Wash.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-primary transition-all hover:scale-110">
                <FacebookIcon />
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-primary transition-all hover:scale-110">
                <InstagramIcon />
              </a>
              <a href="https://wa.me/94742697909" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-primary transition-all hover:scale-110">
                <MessageCircle size={18} />
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
            <h4 className="font-heading text-lg font-semibold mb-4 text-accent">Quick Links</h4>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="font-body text-cream/70 hover:text-accent text-sm transition-colors hover:translate-x-1 inline-block">
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
            <h4 className="font-heading text-lg font-semibold mb-4 text-accent">Services</h4>
            <ul className="flex flex-col gap-2.5">
              {SERVICES.map((service) => (
                <li key={service.name}>
                  <Link href={service.href} className="font-body text-cream/70 hover:text-accent text-sm transition-colors hover:translate-x-1 inline-block">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Col 4: Newsletter - spans 2 columns on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="col-span-2 md:col-span-1"
          >
            <h4 className="font-heading text-lg font-semibold mb-4 text-accent">Stay Updated</h4>
            <p className="font-body text-cream/80 mb-4 text-xs sm:text-sm">
              Subscribe to our newsletter for tips on garment care and special offers.
            </p>
            <form className="flex flex-col gap-2.5" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 font-body text-sm text-cream placeholder:text-cream/50 focus:outline-none focus:border-accent transition-colors"
                required
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="bg-accent hover:bg-olive text-primary font-bold py-2.5 px-4 rounded-xl transition-all shadow-md font-body text-sm"
              >
                Subscribe
              </motion.button>
            </form>
          </motion.div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center">
          <p className="font-body text-cream/50 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} Ananke Laundry. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
