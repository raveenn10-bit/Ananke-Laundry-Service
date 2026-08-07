'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const filterCategories = ['All', 'Team', 'Machines', 'Process', 'Facility'];

const images = [
  { src: '/images/gallery/team-washing.jpg', category: 'Team', alt: 'Staff loading washing machine' },
  { src: '/images/gallery/team-loading.jpg', category: 'Team', alt: 'Two staff members with laundry' },
  { src: '/images/gallery/team-ironing-machine.jpg', category: 'Process', alt: 'Team at ironing machine' },
  { src: '/images/gallery/staff-ironing.jpg', category: 'Process', alt: 'Staff member ironing' },
  { src: '/images/gallery/staff-pressing.jpg', category: 'Process', alt: 'Staff at pressing machine' },
  { src: '/images/gallery/industrial-dryers.jpg', category: 'Machines', alt: 'Industrial dryer machines' },
  { src: '/images/gallery/team-folding.jpg', category: 'Process', alt: 'Team folding clothes' },
  { src: '/images/gallery/team-pressing.jpg', category: 'Process', alt: 'Team at press' },
  { src: '/images/gallery/quality-check.jpg', category: 'Process', alt: 'Quality checking towels' },
  { src: '/images/gallery/team-smiling.jpg', category: 'Team', alt: 'Staff smiling' },
  { src: '/images/gallery/machine-operator.jpg', category: 'Machines', alt: 'Operating machine' },
  { src: '/images/gallery/facility-wide.jpg', category: 'Facility', alt: 'Wide facility shot' },
];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const filteredImages = activeFilter === 'All' 
    ? images 
    : images.filter(img => img.category === activeFilter);

  const openLightbox = (index: number) => {
    // Find index in main images array to keep navigation consistent
    const mainIndex = images.findIndex(img => img.src === filteredImages[index].src);
    setCurrentImageIndex(mainIndex);
    setLightboxOpen(true);
  };

  return (
    <section id="gallery" className="py-20 md:py-28 bg-cream">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-dark mb-4">Our Facility & Process</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Take a look behind the scenes at our state-of-the-art facility and our dedicated team at work.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === cat 
                  ? 'bg-olive text-white' 
                  : 'bg-white border border-gray-200 text-dark hover:border-olive/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          <AnimatePresence>
            {filteredImages.map((img, idx) => (
              <motion.div
                key={img.src}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-xl overflow-hidden cursor-pointer group break-inside-avoid bg-gray-200"
                onClick={() => openLightbox(idx)}
              >
                <div className="relative w-full" style={{ paddingBottom: Math.random() > 0.5 ? '100%' : '133%' }}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-medium bg-olive/80 px-4 py-2 rounded-full text-sm backdrop-blur-sm">View Image</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-8"
          >
            <button 
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 text-white/70 hover:text-white z-50 p-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
              <div className="relative w-full h-[80vh]">
                <Image
                  src={images[currentImageIndex].src}
                  alt={images[currentImageIndex].alt}
                  fill
                  className="object-contain"
                />
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1)); }}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0)); }}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
