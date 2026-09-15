'use client';

import { useEffect, useRef } from 'react';

interface UseMobileAutoScrollOptions {
  interval?: number; // ms between scroll steps (default 3400ms)
  stepOffset?: number; // fallback step size in pixels if child width not found
}

export function useMobileAutoScroll<T extends HTMLElement>(
  options: UseMobileAutoScrollOptions = {}
) {
  const { interval = 3400, stepOffset = 280 } = options;
  const containerRef = useRef<T | null>(null);
  const isPausedRef = useRef(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run on client and mobile viewport (< 768px)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    let isMobile = mediaQuery.matches;

    const handleMediaChange = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    const container = containerRef.current;
    if (!container) return;

    // Pause on user touch, resume after inactivity
    const handleTouchStart = () => {
      isPausedRef.current = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };

    const handleTouchEnd = () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        isPausedRef.current = false;
      }, 4000);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Only scroll when section is actually visible in viewport
    let isIntersecting = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isIntersecting = entry?.isIntersecting ?? false;
      },
      { threshold: 0.15 }
    );
    observer.observe(container);

    const timer = setInterval(() => {
      if (!isMobile || !isIntersecting || isPausedRef.current || !container) return;

      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 10) return; // Not scrollable

      // Calculate step based on first child width + gap
      const firstChild = container.firstElementChild as HTMLElement | null;
      const step = firstChild ? firstChild.offsetWidth + 16 : stepOffset;

      if (container.scrollLeft + step >= maxScroll - 8) {
        // Loop back to start smoothly
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, interval);

    return () => {
      clearInterval(timer);
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [interval, stepOffset]);

  return containerRef;
}
