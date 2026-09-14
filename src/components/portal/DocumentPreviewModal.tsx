'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Printer, CheckCircle2, AlertCircle, Clock, ShieldCheck, Receipt } from 'lucide-react';
import { ZohoInvoice, ZohoPayment } from '@/types/zoho';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'invoice' | 'receipt';
  invoice?: ZohoInvoice | null;
  payment?: ZohoPayment | null;
}

export default function DocumentPreviewModal({
  isOpen,
  onClose,
  type,
  invoice,
  payment,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 my-auto flex flex-col max-h-[90vh]"
        >
          {/* Header Action Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-primary text-white border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-accent" />
              <span className="font-heading font-semibold text-sm sm:text-base">
                {isInvoice && invoice
                  ? `Invoice Preview #${invoice.invoice_number}`
                  : `Payment Receipt #${payment?.payment_number || ''}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
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
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 font-body text-dark">
            {/* Top Brand Banner */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <h2 className="font-heading font-bold text-xl sm:text-2xl text-dark tracking-tight">
                  ANANKE LAUNDRY <span className="text-olive text-sm font-normal">(PVT) LTD</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">Part of Cleanline Linen Management Network</p>
                <p className="text-xs text-gray-600 mt-0.5">No. 195/2, Matara Road, Unawatuna, Galle</p>
                <p className="text-xs text-gray-600">Telephone: 091 225 0777 &bull; anankelaundry.com</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block bg-cream-dark/60 text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
                  {isInvoice ? 'Commercial Tax Invoice' : 'Official Payment Receipt'}
                </span>
                <p className="font-mono text-sm sm:text-base font-bold text-dark">
                  #{isInvoice && invoice ? invoice.invoice_number : payment?.payment_number || ''}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Date: {isInvoice && invoice ? invoice.date : payment?.date || ''}
                </p>
              </div>
            </div>

            {/* Invoice Specific Details */}
            {isInvoice && (
              <>
                {/* Meta details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-cream/60 p-4 rounded-2xl border border-cream-dark">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Billed To</span>
                    <p className="font-heading font-semibold text-dark text-base mt-0.5">{invoice.customer_name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">Location: Unawatuna / Galle District</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Payment Status</span>
                    <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold">
                      {invoice.payment_status === 'Paid' && (
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={13} /> Paid in Full
                        </span>
                      )}
                      {invoice.payment_status === 'Partially Paid' && (
                        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center gap-1">
                          <Clock size={13} /> Partially Paid
                        </span>
                      )}
                      {invoice.payment_status === 'Unpaid' && (
                        <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full flex items-center gap-1">
                          <AlertCircle size={13} /> Payment Due
                        </span>
                      )}
                    </div>
                    {invoice.due_date && (
                      <p className="text-[11px] text-gray-500 mt-1">Due Date: {invoice.due_date}</p>
                    )}
                  </div>
                </div>

                {/* Line Items Table */}
                <div>
                  <h3 className="font-heading font-semibold text-sm text-dark mb-3">Service &amp; Linen Details</h3>
                  <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-4 font-semibold">Description</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Rate</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Total (LKR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(invoice.line_items || [
                          { name: invoice.description || 'Professional Commercial Laundry Service', quantity: 1, rate: invoice.total, item_total: invoice.total }
                        ]).map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="py-3 px-4">
                              <p className="font-medium text-dark">{item.name}</p>
                              {item.description && <p className="text-[11px] text-gray-500">{item.description}</p>}
                            </td>
                            <td className="py-3 px-3 text-center text-gray-600">{item.quantity || 1}</td>
                            <td className="py-3 px-3 text-right text-gray-600">{(item.rate || item.item_total || 0).toLocaleString()}</td>
                            <td className="py-3 px-4 text-right font-semibold text-dark">{(item.item_total || item.rate || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="flex justify-end pt-2">
                  <div className="w-full sm:w-64 space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Total Amount:</span>
                      <span className="font-semibold text-dark">LKR {invoice.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Amount Paid:</span>
                      <span>LKR {invoice.amount_paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-bold text-dark">
                      <span>Balance Due:</span>
                      <span className={invoice.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        LKR {invoice.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </>
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
