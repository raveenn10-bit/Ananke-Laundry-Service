'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';

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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const filteredImages = activeFilter === 'All' 
    ? images 
    : images.filter(img => img.category === activeFilter);

  const openLightbox = (index: number) => {
    const mainIndex = images.findIndex(img => img.src === filteredImages[index].src);
    setCurrentImageIndex(mainIndex);
    setLightboxOpen(true);
  };

  return (
    <section id="gallery" className="py-20 md:py-28 bg-cream relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-dark mb-4">
            Our Facility & <span className="italic font-heading text-olive">Process</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Take a look behind the scenes at our state-of-the-art facility and our dedicated team at work.
          </p>
        </motion.div>

        {/* Filter buttons - horizontally scrollable on mobile */}
        <div className="flex overflow-x-auto no-scrollbar scrollbar-none pb-2 sm:pb-0 justify-start sm:justify-center gap-2 mb-10 -mx-4 px-4 sm:mx-0 sm:px-0">
          {filterCategories.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                activeFilter === cat 
                  ? 'bg-olive text-white shadow-md shadow-olive/20' 
                  : 'bg-white border border-gray-200 text-dark hover:border-olive/50'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Gallery Container - Horizontally scrollable on mobile, masonry grid on desktop */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:columns-3 md:gap-4 md:space-y-4 md:block no-scrollbar scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img, idx) => (
              <motion.div
                key={img.src}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                className="relative rounded-xl overflow-hidden cursor-pointer group break-inside-avoid bg-gray-200 min-w-[260px] sm:min-w-[300px] h-[340px] md:h-auto md:min-w-0 md:w-full snap-start flex-shrink-0 md:flex-shrink mb-0 md:mb-4 shadow-sm hover:shadow-lg transition-all"
                onClick={() => openLightbox(idx)}
              >
                <div className="relative w-full h-full md:h-auto" style={{ paddingBottom: undefined }}>
                  <div className="relative w-full h-full min-h-[340px] md:min-h-[260px]">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 80vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white font-medium bg-olive/90 px-4 py-2 rounded-full text-xs sm:text-sm backdrop-blur-sm shadow-md">
                        View Photo
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-8 backdrop-blur-md"
          >
            <button 
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 text-white/70 hover:text-white z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
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
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0)); }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

