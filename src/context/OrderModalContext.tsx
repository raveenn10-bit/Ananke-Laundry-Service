'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import OrderModal from '@/components/order/OrderModal';

interface OrderModalContextType {
  isOpen: boolean;
  openOrderModal: () => void;
  closeOrderModal: () => void;
}

const OrderModalContext = createContext<OrderModalContextType | undefined>(undefined);

export function OrderModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openOrderModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeOrderModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    // Check initial hash or query parameter
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('order') === 'true' || window.location.hash === '#place-order' || window.location.hash === '#order') {
        setIsOpen(true);
      }

      const handleCustomOpen = () => setIsOpen(true);
      window.addEventListener('ananke:open-order', handleCustomOpen);

      const handleHashChange = () => {
        if (window.location.hash === '#place-order' || window.location.hash === '#order') {
          setIsOpen(true);
        }
      };
      window.addEventListener('hashchange', handleHashChange);

      return () => {
        window.removeEventListener('ananke:open-order', handleCustomOpen);
        window.removeEventListener('hashchange', handleHashChange);
      };
    }
  }, []);

  return (
    <OrderModalContext.Provider value={{ isOpen, openOrderModal, closeOrderModal }}>
      {children}
      <OrderModal isOpen={isOpen} onClose={closeOrderModal} />
    </OrderModalContext.Provider>
  );
}

export function useOrderModal() {
  const context = useContext(OrderModalContext);
  if (!context) {
    // Fallback if rendered outside provider: dispatch custom event
    return {
      isOpen: false,
      openOrderModal: () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ananke:open-order'));
        }
      },
      closeOrderModal: () => {},
    };
  }
  return context;
}
