'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Printer, CheckCircle2, AlertCircle, Clock, ShieldCheck, Receipt } from 'lucide-react';
import { ZohoInvoice, ZohoPayment } from '@/types/zoho';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'invoice' | 'receipt';
  invoice?: ZohoInvoice | null;
  payment?: ZohoPayment | null;
  timeLeft?: number;
}

export default function DocumentPreviewModal({
  isOpen,
  onClose,
  type,
  invoice,
  payment,
  timeLeft,
}: DocumentPreviewModalProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isInvoice = type === 'invoice' && invoice;
  const isReceipt = type === 'receipt' && payment;

  const handleDownload = () => {
    if (isInvoice && invoice) {
      window.open(`/api/portal/invoice-pdf?id=${invoice.invoice_id}`, '_blank');
    } else if (isReceipt && payment) {
      window.open(`/api/portal/receipt-pdf?id=${payment.payment_id}`, '_blank');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-dark/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-[calc(100vw-16px)] sm:max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 my-auto flex flex-col max-h-[90vh]"
        >
          {/* Header Action Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-primary text-white border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Receipt size={18} className="text-accent shrink-0" />
              <span className="font-heading font-semibold text-xs sm:text-base truncate">
                {isInvoice && invoice
                  ? `Invoice #${invoice.invoice_number}`
                  : `Receipt #${payment?.payment_number || ''}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {typeof timeLeft === 'number' && (
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors ${
                    timeLeft <= 15
                      ? 'bg-rose-500/25 text-rose-200 border border-rose-400/40 animate-pulse'
                      : 'bg-white/10 text-white/90 border border-white/10'
                  }`}
                  title="Session will auto-close for privacy"
                >
                  <Clock size={13} className={timeLeft <= 15 ? 'text-rose-300' : 'text-accent'} />
                  <span>{timeLeft}s</span>
                </div>
              )}
              <button
                onClick={handlePrint}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Print Document"
              >
                <Printer size={16} />
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent hover:bg-olive text-dark hover:text-white font-semibold text-xs transition-all shadow-sm"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Download PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors ml-1"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Document Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 print:p-0 font-body text-dark flex justify-center bg-gray-50/60">
            {/* Invoice Specific Details: Exact Thermal Receipt Format */}
            {isInvoice && invoice && (
              <div className="w-full max-w-sm bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-gray-200 text-dark space-y-3 font-sans print:border-none print:shadow-none print:p-0 print:max-w-none">
                {/* Center Brand Header */}
                <div className="text-center space-y-1">
                  <div className="relative w-16 h-16 mx-auto mb-2.5 rounded-xl overflow-hidden bg-[#436e2f] p-1.5 flex items-center justify-center shadow-xs">
                    <Image
                      src="/logo.png"
                      alt="Ananke Laundry Logo"
                      width={64}
                      height={64}
                      className="object-contain"
                      priority
                    />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-dark leading-tight">
                    Ananke Laundry (Pvt) Ltd
                  </h3>
                  <p className="text-xs text-gray-700 font-medium">Southern Province</p>
                  <p className="text-xs text-gray-700 font-medium">SriLanka</p>
                </div>

                {/* Dashed Separator */}
                <div className="border-t border-dashed border-gray-400 my-2" />

                {/* INVOICE Title */}
                <div className="text-center">
                  <h4 className="font-bold text-sm tracking-widest uppercase text-dark">
                    INVOICE
                  </h4>
                </div>

                {/* Dashed Separator */}
                <div className="border-t border-dashed border-gray-400 my-2" />

                {/* Invoice Meta */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Invoice#</span>
                    <span className="font-mono font-semibold text-dark">{invoice.invoice_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Date</span>
                    <span className="font-mono text-dark">{invoice.date}</span>
                  </div>
                </div>

                {/* Dashed Separator */}
                <div className="border-t border-dashed border-gray-400 my-2" />

                {/* Bill To */}
                <div className="space-y-0.5 text-xs">
                  <span className="text-gray-700 block">Bill To:</span>
                  <p className="font-bold text-dark text-sm sm:text-base">
                    {invoice.customer_name}
                  </p>
                </div>

                {/* Dashed Separator */}
                <div className="border-t border-dashed border-gray-400 my-2" />

                {/* Total Section (Items Omitted as requested) */}
                <div className="py-2.5 border-b-2 border-dark space-y-1.5">
                  <div className="flex justify-between items-center text-sm sm:text-base font-bold">
                    <span className="tracking-wide">TOTAL</span>
                    <span className="font-mono text-dark">
                      LKR {invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {invoice.amount_paid > 0 && invoice.balance > 0 && (
                    <div className="flex justify-between items-center text-xs text-emerald-700 font-semibold pt-1">
                      <span>Amount Paid</span>
                      <span className="font-mono">
                        LKR {invoice.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {invoice.balance > 0 && invoice.amount_paid > 0 && (
                    <div className="flex justify-between items-center text-xs text-rose-700 font-bold pt-0.5">
                      <span>Balance Due</span>
                      <span className="font-mono">
                        LKR {invoice.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="pt-2 space-y-1.5 text-[10.5px] leading-relaxed text-gray-800">
                  <p className="font-semibold text-dark">Terms &amp; Conditions: All Laundry is accepted</p>
                  <p>owner&apos;s risk while the utmost care will be exercised.</p>
                  <p>Person handling over and collecting the items takes ownership to validate against receipt.</p>
                  <p>Any claims of loss ,damage or any other complaint of an other to be reported at the time of accepting the items.</p>
                  <p>A 100% Additional charge will be added for the all orders delivered on the same day.</p>
                  <p>The delay in settling the payment will be charged 10% late Payment fees.</p>
                </div>

                {/* Signature Line */}
                <div className="pt-3 text-[10px] text-gray-700 flex justify-between items-center flex-wrap gap-2">
                  <span>Date: ................................</span>
                  <span>Sign: ......................................</span>
                </div>

                {/* Footer Greeting */}
                <div className="pt-3 text-center text-xs font-medium text-gray-800">
                  Thanks for your business.
                </div>
              </div>
            )}

            {/* Receipt Specific Details */}
            {isReceipt && (
              <div className="space-y-6">
                <div className="bg-emerald-50/70 border border-emerald-100 p-5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-emerald-950">Payment Received in Full</h3>
                      <p className="text-xs text-emerald-700 mt-0.5">Thank you for your business with Ananke Laundry.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Customer Name</span>
                    <p className="font-heading font-semibold text-dark text-base mt-0.5">{payment.customer_name}</p>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mt-3">Payment Method</span>
                    <p className="font-medium text-dark mt-0.5">{payment.payment_mode}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Applied Invoice</span>
                    <p className="font-mono font-semibold text-dark mt-0.5">#{payment.invoice_numbers || 'Linen Care Services'}</p>
                    {payment.reference_number && (
                      <>
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mt-3">Reference Number</span>
                        <p className="font-mono text-gray-600 mt-0.5">{payment.reference_number}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-cream border border-cream-dark flex items-center justify-between">
                  <span className="font-heading font-semibold text-sm text-dark">Total Amount Received:</span>
                  <span className="font-mono font-bold text-xl text-emerald-700">
                    LKR {payment.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Cleanline Assurance Note */}
            <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-500">
              <ShieldCheck size={14} className="text-olive shrink-0" />
              <span>Verified customer record from Ananke Laundry (Pvt) Ltd commercial management network.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
