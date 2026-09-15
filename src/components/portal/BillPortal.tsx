'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  ShieldCheck,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Receipt,
  ArrowRight,
  Sparkles,
  LogOut,
  Search,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { ZohoInvoice, ZohoPayment } from '@/types/zoho';
import DocumentPreviewModal from './DocumentPreviewModal';

type PortalView = 'lookup' | 'dashboard';
type FilterStatus = 'ALL' | 'PAID' | 'UNPAID' | 'PARTIALLY_PAID';

interface CustomerInfo {
  name: string;
  phone: string;
  localPhone: string;
  formatted?: string;
  customerId?: string;
}

interface FinancialSummary {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalBalance: number;
}

const OFFICIAL_WHATSAPP_NUMBER = '94742697909';
const OFFICIAL_PHONE_DISPLAY = '091 225 0777';

export default function BillPortal() {
  // View State
  const [view, setView] = useState<PortalView>('lookup');
  const [invoiceInput, setInvoiceInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Verified Customer & Invoices
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [invoices, setInvoices] = useState<ZohoInvoice[]>([]);
  const [payments, setPayments] = useState<ZohoPayment[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');

  // Document Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewType, setPreviewType] = useState<'invoice' | 'receipt'>('invoice');
  const [selectedInvoice, setSelectedInvoice] = useState<ZohoInvoice | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<ZohoPayment | null>(null);

  // Check existing session on mount
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const res = await fetch('/api/portal/invoices');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.invoices && data.invoices.length > 0) {
            setCustomer(data.customer);
            setInvoices(data.invoices);
            setSummary(data.summary);
            setView('dashboard');
            loadPayments();
          }
        }
      } catch {
        // No active session, stay on lookup
      }
    }
    checkExistingSession();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await fetch('/api/portal/payments');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.payments) {
          setPayments(data.payments);
        }
      }
    } catch (e) {
      console.warn('Could not load payments:', e);
    }
  };

  // Handle Lookup Form Submission
  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const cleanInvoice = invoiceInput.trim();
    const cleanPhone = phoneInput.trim();

    if (!cleanInvoice) {
      setErrorMsg('Please enter your Invoice Number (e.g., INV-000123 or ANK-1042).');
      return;
    }

    if (!cleanPhone) {
      setErrorMsg('Please enter your Phone or WhatsApp Number.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/portal/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: cleanInvoice,
          phone: cleanPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "We couldn't find a matching bill with those details. Please double-check your Invoice Number and Phone Number, or contact our support team on WhatsApp."
        );
      }

      setCustomer(data.customer);
      if (data.invoice) {
        setInvoices([data.invoice]);
        setSummary({
          totalInvoices: 1,
          totalAmount: data.invoice.total,
          totalPaid: data.invoice.amount_paid,
          totalBalance: data.invoice.balance,
        });
      }

      await loadPayments();
      setView('dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with billing server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout / Switch Bill
  const handleLogout = async () => {
    try {
      await fetch('/api/portal/logout', { method: 'POST' });
    } catch {
      // Best-effort logout call
    }
    document.cookie = 'ananke_portal_session=; Path=/; Max-Age=0;';
    setCustomer(null);
    setInvoices([]);
    setPayments([]);
    setSummary(null);
    setInvoiceInput('');
    setPhoneInput('');
    setView('lookup');
    setErrorMsg(null);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'PAID') return inv.payment_status === 'Paid';
    if (activeFilter === 'UNPAID') return inv.payment_status === 'Unpaid' || inv.payment_status === 'Overdue';
    if (activeFilter === 'PARTIALLY_PAID') return inv.payment_status === 'Partially Paid';
    return true;
  });

  // Open Preview Modals
  const openInvoicePreview = (inv: ZohoInvoice) => {
    setSelectedInvoice(inv);
    setPreviewType('invoice');
    setPreviewModalOpen(true);
  };

  const openReceiptPreview = (inv: ZohoInvoice) => {
    const match =
      payments.find(
        (p) =>
          p.invoice_id === inv.invoice_id ||
          (p.invoice_numbers && p.invoice_numbers.includes(inv.invoice_number))
      ) || {
        payment_id: inv.payment_id || `pay-${inv.invoice_id}`,
        payment_number: `REC-${inv.invoice_number}`,
        customer_id: inv.customer_id,
        customer_name: inv.customer_name,
        date: inv.payment_date || inv.date,
        payment_mode: 'Cash / Bank Transfer',
        amount: inv.amount_paid > 0 ? inv.amount_paid : inv.total,
        invoice_numbers: inv.invoice_number,
      };

    setSelectedPayment(match);
    setPreviewType('receipt');
    setPreviewModalOpen(true);
  };

  // Generate WhatsApp contact link with non-sensitive pre-filled text
  const getWhatsAppInquiryUrl = (invoiceNumber: string) => {
    const message = `Hello Ananke Laundry team, I am inquiring about my invoice ${invoiceNumber}.`;
    return `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* View 1: Invoice Number & Phone Number Lookup */}
      {view === 'lookup' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-lg mx-auto bg-white rounded-3xl p-6 sm:p-9 shadow-xl border border-gray-100"
        >
          <div className="text-center mb-6">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-primary/5 p-1.5 border border-primary/10 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Image
                src="/logo.png"
                alt="Ananke Laundry Logo"
                width={64}
                height={64}
                className="object-contain"
                priority
              />
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-dark tracking-tight">
              View My <span className="text-olive italic">Bill &amp; Receipts</span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm font-body mt-2 leading-relaxed">
              Find your laundry invoices and download official receipts securely. Enter your Invoice Number and registered Phone Number below.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLookup} className="space-y-4">
            {/* Invoice Number Input */}
            <div>
              <label
                htmlFor="invoiceNumber"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
              >
                Invoice Number *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-400">
                  <FileText size={16} />
                </div>
                <input
                  id="invoiceNumber"
                  type="text"
                  value={invoiceInput}
                  onChange={(e) => setInvoiceInput(e.target.value)}
                  placeholder="e.g. INV-000123 or ANK-1042"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 text-dark font-medium text-sm sm:text-base focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20 transition-all bg-cream/30"
                  autoFocus
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 pl-1">
                Found on your physical receipt or billing notification.
              </p>
            </div>

            {/* Phone Number Input */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
              >
                Phone / WhatsApp Number *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-semibold text-gray-500 border-r border-gray-200 pr-2.5">
                  <span className="text-base leading-none">🇱🇰</span>
                  <span>+94</span>
                </div>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="077 123 4567"
                  className="w-full pl-24 pr-4 py-3.5 rounded-2xl border border-gray-200 text-dark font-medium text-sm sm:text-base focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20 transition-all bg-cream/30"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 pl-1">
                Accepts 07XXXXXXXX, +947XXXXXXXX, or landlines (e.g. 091 225 0777).
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !invoiceInput.trim() || !phoneInput.trim()}
              className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-primary hover:bg-olive text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Searching Records in Zoho...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Find My Bill</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Help & Security Guarantee */}
          <div className="mt-6 pt-5 border-t border-gray-100 space-y-2.5 text-center">
            <div className="flex items-center gap-2 text-gray-400 text-[11px] justify-center">
              <ShieldCheck size={14} className="text-olive" />
              <span>Direct Zoho Books Lookup &bull; Signed Session Security</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Need assistance? Call our Unawatuna facility at{' '}
              <a href={`tel:+94912250777`} className="text-olive font-semibold hover:underline">
                {OFFICIAL_PHONE_DISPLAY}
              </a>
            </p>
          </div>
        </motion.div>
      )}

      {/* View 2: Customer Bill Dashboard & Action Center */}
      {view === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Top Header Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-primary/5 p-1 border border-primary/10 flex items-center justify-center shrink-0 shadow-sm">
                <Image
                  src="/logo.png"
                  alt="Ananke Laundry Logo"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-olive font-semibold text-xs tracking-wider uppercase mb-0.5">
                  <Sparkles size={13} />
                  <span>Verified Customer Bill</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-dark">
                  {customer?.name || 'Valued Customer'}
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm font-body mt-0.5">
                  Verified Contact: <span className="font-mono text-dark font-medium">{customer?.phone || customer?.localPhone}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <a
                href={`tel:+94912250777`}
                className="px-3.5 py-2 rounded-full border border-gray-200 text-dark hover:border-olive text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Phone size={13} className="text-olive" />
                <span>Call {OFFICIAL_PHONE_DISPLAY}</span>
              </a>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Search another bill"
              >
                <Search size={13} />
                <span>Find Another Bill</span>
              </button>
            </div>
          </div>

          {/* Financial Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Total Invoices
                </span>
                <p className="font-heading font-bold text-lg sm:text-2xl text-dark mt-1 break-words">
                  {summary.totalInvoices}
                </p>
                <span className="text-[10px] sm:text-[11px] text-gray-500">Record on File</span>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Total Amount
                </span>
                <p className="font-heading font-bold text-lg sm:text-2xl text-dark mt-1 break-words">
                  LKR {summary.totalAmount.toLocaleString()}
                </p>
                <span className="text-[10px] sm:text-[11px] text-gray-500">Commercial Services</span>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
                  Amount Paid
                </span>
                <p className="font-heading font-bold text-lg sm:text-2xl text-emerald-700 mt-1 break-words">
                  LKR {summary.totalPaid.toLocaleString()}
                </p>
                <span className="text-[10px] sm:text-[11px] text-emerald-600">Receipted Funds</span>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                <span className="text-[10px] sm:text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
                  Balance Due
                </span>
                <p className="font-heading font-bold text-lg sm:text-2xl text-rose-700 mt-1 break-words">
                  LKR {summary.totalBalance.toLocaleString()}
                </p>
                <span className="text-[10px] sm:text-[11px] text-gray-500">Outstanding Balance</span>
              </div>
            </div>
          )}

          {/* Bill Action Center */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-gray-200">
              <div>
                <h3 className="font-heading font-bold text-lg text-dark">Invoice Details &amp; Action Center</h3>
                <p className="text-xs text-gray-500">Directly synchronized with Zoho Books</p>
              </div>

              {invoices.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none pb-1">
                  {(
                    [
                      { id: 'ALL', label: 'All', count: invoices.length },
                      { id: 'PAID', label: 'Paid', count: invoices.filter((i) => i.payment_status === 'Paid').length },
                      { id: 'PARTIALLY_PAID', label: 'Partially Paid', count: invoices.filter((i) => i.payment_status === 'Partially Paid').length },
                      { id: 'UNPAID', label: 'Unpaid', count: invoices.filter((i) => i.payment_status === 'Unpaid' || i.payment_status === 'Overdue').length },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                        activeFilter === tab.id
                          ? 'bg-olive text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-olive/50'
                      }`}
                    >
                      {tab.label} <span className="opacity-80 ml-0.5 font-normal">({tab.count})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Invoices List */}
            {filteredInvoices.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
                <FileText size={32} className="mx-auto text-gray-400 mb-3" />
                <h4 className="font-heading font-bold text-lg text-dark">No Invoices Found</h4>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  No invoices match your selected filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filteredInvoices.map((inv) => {
                  const isPaid = inv.payment_status === 'Paid';
                  const isPartiallyPaid = inv.payment_status === 'Partially Paid';
                  const hasReceipt = inv.amount_paid > 0;

                  return (
                    <div
                      key={inv.invoice_id}
                      className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-5"
                    >
                      {/* Top Row: Invoice #, Date, Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-lg text-dark">
                              #{inv.invoice_number}
                            </span>
                            <span className="text-xs text-gray-400">&bull;</span>
                            <span className="text-xs text-gray-600 font-medium">
                              Issued: {inv.date}
                            </span>
                            {inv.due_date && (
                              <>
                                <span className="text-xs text-gray-400">&bull;</span>
                                <span className="text-xs text-gray-500">
                                  Due: {inv.due_date}
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-gray-700">
                            {inv.description || 'Commercial Laundry & Linen Care Services'}
                          </p>
                        </div>

                        {/* Financial Status Badge */}
                        <div className="shrink-0">
                          {isPaid && (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                              <CheckCircle2 size={14} /> PAID IN FULL
                            </span>
                          )}
                          {isPartiallyPaid && (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
                              <Clock size={14} /> PARTIALLY PAID
                            </span>
                          )}
                          {!isPaid && !isPartiallyPaid && (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
                              <AlertCircle size={14} /> UNPAID
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Financial Amounts Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 p-4 rounded-2xl bg-cream/30 border border-gray-100 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                            Total Bill
                          </span>
                          <span className="font-heading font-bold text-dark text-base sm:text-lg">
                            LKR {inv.total.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                            Amount Paid
                          </span>
                          <span className="font-heading font-bold text-emerald-700 text-base sm:text-lg">
                            LKR {inv.amount_paid.toLocaleString()}
                          </span>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                            Balance Due
                          </span>
                          <span
                            className={`font-heading font-bold text-base sm:text-lg ${
                              inv.balance > 0 ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            LKR {inv.balance.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Real Zoho Line Items (if present) */}
                      {inv.line_items && inv.line_items.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            Service Line Items
                          </h5>
                          <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100 text-xs">
                            {inv.line_items.map((item, idx) => (
                              <div
                                key={item.item_id || idx}
                                className="p-3 flex items-center justify-between gap-3 bg-white"
                              >
                                <div>
                                  <span className="font-semibold text-dark block">{item.name}</span>
                                  {item.description && (
                                    <span className="text-[11px] text-gray-500 block">
                                      {item.description}
                                    </span>
                                  )}
                                  <span className="text-[11px] text-gray-400">
                                    Qty: {item.quantity ?? 1} &times; LKR {(item.rate || 0).toLocaleString()}
                                  </span>
                                </div>
                                <span className="font-heading font-semibold text-dark shrink-0">
                                  LKR {(item.item_total || ((item.quantity || 1) * (item.rate || 0))).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Center Buttons */}
                      <div className="pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {/* 1. View Invoice Modal */}
                          <button
                            onClick={() => openInvoicePreview(inv)}
                            className="w-full px-4 py-3 rounded-2xl bg-gray-100 hover:bg-olive hover:text-white text-dark text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
                          >
                            <Eye size={15} />
                            <span>View Invoice</span>
                          </button>

                          {/* 2. Download Official PDF */}
                          <a
                            href={`/api/portal/invoice-pdf?id=${inv.invoice_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 hover:border-olive text-dark text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm bg-white"
                          >
                            <Download size={15} className="text-olive" />
                            <span>Download PDF</span>
                          </a>

                          {/* 3. View / Download Payment Receipt */}
                          {hasReceipt ? (
                            <button
                              onClick={() => openReceiptPreview(inv)}
                              className="w-full px-4 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-emerald-200/60 shadow-sm"
                            >
                              <Receipt size={15} />
                              <span>View Receipt</span>
                            </button>
                          ) : (
                            <div
                              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200/60 text-gray-400 text-xs font-medium flex items-center justify-center gap-1.5 cursor-not-allowed"
                              title="Receipt will be generated once payment is recorded in Zoho Books"
                            >
                              <HelpCircle size={14} />
                              <span>Receipt (Upon Payment)</span>
                            </div>
                          )}

                          {/* 4. WhatsApp Inquire */}
                          <a
                            href={getWhatsAppInquiryUrl(inv.invoice_number)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
                          >
                            <MessageSquare size={15} />
                            <span>Inquire on WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Document In-App Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        type={previewType}
        invoice={selectedInvoice}
        payment={selectedPayment}
      />
    </div>
  );
}
