'use client';

import { Phone, MessageCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FloatingActions() {
  return (
    <>
      {/* Desktop Floating Actions */}
      <div className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 flex-col gap-4 z-40">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative group">
          <a
            href="tel:+94742697909"
            className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            aria-label="Call Us"
          >
            <Phone className="text-white" size={24} />
          </a>
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-dark/90 text-white px-3 py-1.5 rounded text-sm font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
            Call Now
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative group">
          <a
            href="https://wa.me/94742697909"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            aria-label="WhatsApp"
          >
            <MessageCircle className="text-primary" size={24} />
          </a>
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-dark/90 text-white px-3 py-1.5 rounded text-sm font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
            WhatsApp
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative group">
          <a
            href="https://maps.app.goo.gl/7FCjn432AeM9KkXDA?g_st=ic"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-olive rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            aria-label="Find Us"
          >
            <MapPin className="text-white" size={24} />
          </a>
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-dark/90 text-white px-3 py-1.5 rounded text-sm font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
            Find Us
          </div>
        </motion.div>
      </div>

      {/* Mobile Floating Action */}
      <motion.div
        className="lg:hidden fixed bottom-6 right-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <a
          href="https://wa.me/94742697909"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-xl hover:bg-olive transition-colors relative group"
          aria-label="WhatsApp"
        >
          <motion.div
            animate={{
              boxShadow: ['0 0 0 0 rgba(155, 197, 61, 0.7)', '0 0 0 15px rgba(155, 197, 61, 0)'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="absolute inset-0 rounded-full pointer-events-none"
          />
          <MessageCircle className="text-primary" size={28} />
        </a>
      </motion.div>
    </>
  );
}
