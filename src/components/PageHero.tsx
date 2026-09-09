'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';

interface PageHeroProps {
  badge?: string;
  title: string;
  highlightedTitle?: string;
  subtitle: string;
  breadcrumbs: { label: string; href?: string }[];
}

export default function PageHero({
  badge,
  title,
  highlightedTitle,
  subtitle,
  breadcrumbs,
}: PageHeroProps) {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-primary text-white overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-olive/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-cream/70 mb-6 font-body">
          <Link href="/" className="hover:text-accent flex items-center gap-1 transition-colors">
            <Home size={13} />
            <span>Home</span>
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-cream/40" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-accent transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-accent font-medium">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Content */}
        <div className="max-w-3xl">
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-block bg-white/10 backdrop-blur-md text-accent text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4 border border-white/10"
            >
              {badge}
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading leading-tight mb-4 text-white"
          >
            {title}{' '}
            {highlightedTitle && (
              <span className="italic font-normal text-accent">{highlightedTitle}</span>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-cream/80 text-sm sm:text-base md:text-lg font-body leading-relaxed max-w-2xl"
          >
            {subtitle}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
