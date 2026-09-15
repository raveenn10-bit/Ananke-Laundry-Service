'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InvoiceSegmentInputProps {
  value: string;
  onChange: (val: string) => void;
  onEnter?: () => void;
  disabled?: boolean;
  minSlots?: number;
}

export default function InvoiceSegmentInput({
  value,
  onChange,
  onEnter,
  disabled = false,
  minSlots = 8,
}: InvoiceSegmentInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [cursorIndex, setCursorIndex] = useState(value.length);

  // Focus the underlying accessible input
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Normalization: uppercase letters, digits, and hyphens only
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9\-]/g, '');
    onChange(raw);
    setCursorIndex(e.target.selectionStart ?? raw.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  };

  const handleSelect = () => {
    if (inputRef.current) {
      setCursorIndex(inputRef.current.selectionStart ?? value.length);
    }
  };

  // Keep active slot visible smoothly on mobile view
  useEffect(() => {
    if (containerRef.current && isFocused) {
      const activeElement = containerRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    }
  }, [cursorIndex, value, isFocused]);

  // Dynamic slot calculation: At least minSlots, expandable as characters are typed
  const totalSlots = Math.max(minSlots, isFocused ? value.length + 1 : value.length);
  const characters = value.split('');
  const activeSlotIndex = isFocused ? Math.min(cursorIndex, characters.length) : -1;

  return (
    <div className="w-full">
      {/* Logical Single Accessible Input */}
      <label htmlFor="invoice-segment-input" className="sr-only">
        Invoice Number
      </label>
      <input
        ref={inputRef}
        id="invoice-segment-input"
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        onFocus={() => {
          setIsFocused(true);
          setCursorIndex(inputRef.current?.selectionStart ?? value.length);
        }}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        aria-label="Invoice Number"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck="false"
        className="sr-only"
      />

      {/* Visual Segmented Character Slots */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="w-full flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto py-2.5 px-1 cursor-text select-none no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {Array.from({ length: totalSlots }).map((_, index) => {
          const char = characters[index];
          const hasChar = char !== undefined;
          const isActive = isFocused && index === activeSlotIndex;

          return (
            <div
              key={index}
              data-active={isActive}
              className={`relative flex items-center justify-center shrink-0 w-8.5 h-12 sm:w-11 sm:h-14 rounded-xl font-mono font-bold text-base sm:text-lg transition-all duration-200 border ${
                isActive
                  ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.3)] scale-105 z-10'
                  : hasChar
                  ? 'border-emerald-800/25 bg-white text-[#163824] shadow-2xs'
                  : 'border-gray-200/80 bg-gray-50/70 text-gray-300'
              }`}
            >
              {/* Fake animated blinking caret inside active slot */}
              {isActive && !hasChar && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.85 }}
                  className="w-0.5 h-6 sm:h-7 bg-emerald-600 rounded-full"
                />
              )}

              {/* Character Pop Animation */}
              <AnimatePresence mode="wait">
                {hasChar && (
                  <motion.span
                    key={`${index}-${char}`}
                    initial={{ scale: 0.45, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.45, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 480, damping: 24 }}
                    className={`${
                      char === '-' ? 'text-gray-400 font-normal' : 'text-[#163824]'
                    }`}
                  >
                    {char}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Placeholder dot for empty inactive slots */}
              {!hasChar && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300/60" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
