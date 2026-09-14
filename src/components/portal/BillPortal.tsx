'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  ShieldCheck,
  KeyRound,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Receipt,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Building,
  User,
  LogOut,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ZohoInvoice, ZohoPayment } from '@/types/zoho';
import DocumentPreviewModal from './DocumentPreviewModal';

type PortalStep = 'phone' | 'otp' | 'dashboard';
type FilterStatus = 'ALL' | 'PAID' | 'UNPAID' | 'PARTIALLY_PAID';

interface CustomerInfo {
  name: string;
  phone: string;
  localPhone: string;
  formatted: string;
  customerId?: string;
}

interface FinancialSummary {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalBalance: number;
}

export default function BillPortal() {
  // State Machine
  const [step, setStep] = useState<PortalStep>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devHint, setDevHint] = useState<string | null>(null);

  // OTP Timer
  const [cooldown, setCooldown] = useState(0);

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

  // Input references for 6-digit OTP
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check existing session on mount
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const res = await fetch('/api/portal/invoices');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.invoices) {
            setCustomer(data.customer);
            setInvoices(data.invoices);
            setSummary(data.summary);
            setStep('dashboard');
            // Fetch payments
            loadPayments();
          }
        }
      } catch {
        // No active session, stay on phone step
      }
    }
    checkExistingSession();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

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

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send verification code.');
      }

      setSuccessMsg(data.message);
      setCooldown(data.cooldownSeconds || 60);
      if (data.devHint) {
        setDevHint(data.devHint);
      }
      setStep('otp');
      // Focus first OTP input
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP input digit change
  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Handle paste
      const pasted = val.slice(0, 6).split('');
      const newOtp = [...otpInput];
      pasted.forEach((char, i) => {
        if (i < 6 && /\d/.test(char)) {
          newOtp[i] = char;
        }
      });
      setOtpInput(newOtp);
      const nextIdx = Math.min(pasted.length, 5);
      otpRefs.current[nextIdx]?.focus();
      return;
    }

    if (val && !/^\d+$/.test(val)) return;

    const newOtp = [...otpInput];
    newOtp[index] = val;
    setOtpInput(newOtp);

    // Auto-advance
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpInput.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, otp: fullOtp }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Verification failed. Please check code.');
      }

      setCustomer(data.customer);

      // Now fetch the verified invoices
      const invRes = await fetch('/api/portal/invoices');
      const invData = await invRes.json();

      if (invData.success) {
        setInvoices(invData.invoices || []);
        setSummary(invData.summary || null);
      }

      await loadPayments();
      setStep('dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout / Switch Phone
  const handleLogout = async () => {
    try {
      await fetch('/api/portal/logout', { method: 'POST' });
    } catch {
      // Best-effort logout call
    }
    // Clear any non-httpOnly cookie if present
    document.cookie = 'ananke_portal_session=; Path=/; Max-Age=0;';
    setCustomer(null);
    setInvoices([]);
    setPayments([]);
    setSummary(null);
    setOtpInput(['', '', '', '', '', '']);
    setStep('phone');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'PAID') return inv.payment_status === 'Paid';
    if (activeFilter === 'UNPAID') return inv.payment_status === 'Unpaid' || inv.payment_status === 'Overdue';
    if (activeFilter === 'PARTIALLY_PAID') return inv.payment_status === 'Partially Paid';
    return true;
  });

  // Open Preview Modal
  const openInvoicePreview = (inv: ZohoInvoice) => {
    setSelectedInvoice(inv);
    setPreviewType('invoice');
    setPreviewModalOpen(true);
  };

  const openReceiptPreview = (inv: ZohoInvoice) => {
    // Look for matching payment by invoice_id or invoice_number
    const match = payments.find(
      (p) => p.invoice_id === inv.invoice_id || (p.invoice_numbers && p.invoice_numbers.includes(inv.invoice_number))
    ) || {
      payment_id: inv.payment_id || 'mock-pay-1042',
      payment_number: `REC-${inv.invoice_number}`,
      customer_id: inv.customer_id,
      customer_name: inv.customer_name,
      date: inv.payment_date || inv.date,
      payment_mode: 'Cash on Collection',
      amount: inv.amount_paid > 0 ? inv.amount_paid : inv.total,
      invoice_numbers: inv.invoice_number,
    };

    setSelectedPayment(match);
    setPreviewType('receipt');
    setPreviewModalOpen(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Step 1: Phone Number Input */}
      {step === 'phone' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100"
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
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-dark">
              View My <span className="text-olive italic">Bill &amp; Receipts</span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm font-body mt-2 leading-relaxed">
              Access your invoices and payment receipts securely. Enter the phone number associated with your laundry service.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Your Phone Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-semibold text-gray-500 border-r border-gray-200 pr-2.5">
                  <span className="text-base leading-none">🇱🇰</span>
                  <span>+94</span>
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="077 123 4567"
                  className="w-full pl-24 pr-4 py-3.5 rounded-2xl border border-gray-200 text-dark font-medium text-sm focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20 transition-all bg-cream/30"
                  autoFocus
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 pl-1">
                Formats accepted: 0771234567, +94771234567, or 0912250777
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !phoneInput.trim()}
              className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-olive text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-2 text-gray-400 text-[11px] justify-center">
            <ShieldCheck size={14} className="text-olive" />
            <span>Encrypted with OTP verification &bull; Zero unauthorized access</span>
          </div>
        </motion.div>
      )}

      {/* Step 2: OTP Verification */}
      {step === 'otp' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-accent/20 text-accent-dark flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-7 h-7 text-dark" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-dark">
              Enter Verification Code
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm font-body mt-2">
              We sent a 6-digit code to <span className="font-semibold text-dark">{phoneInput}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setErrorMsg(null);
              }}
              className="text-xs text-olive hover:text-accent font-semibold mt-1 underline underline-offset-4"
            >
              Change Phone Number
            </button>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {devHint && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <Info size={14} className="text-amber-600 shrink-0" />
              <span>
                <strong>Test Hint:</strong> Your verification code is <strong className="font-mono text-sm">{devHint}</strong>
              </span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {/* 6 Digit Inputs */}
            <div className="flex justify-between gap-2 sm:gap-2.5">
              {otpInput.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center font-heading font-bold text-xl sm:text-2xl rounded-xl border border-gray-200 bg-cream/30 focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20 text-dark transition-all"
                  required
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || otpInput.join('').length !== 6}
              className="w-full py-3.5 px-6 rounded-2xl bg-accent hover:bg-olive text-dark hover:text-white font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                  <span>Verifying &amp; Loading Invoices...</span>
                </>
              ) : (
                <>
                  <span>Verify &amp; View My Bill</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Resend Action */}
          <div className="mt-6 text-center text-xs text-gray-500">
            {cooldown > 0 ? (
              <div className="flex items-center justify-center gap-1 text-gray-400">
                <Clock size={13} />
                <span>Resend code in {cooldown}s</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleSendOtp()}
                className="text-olive hover:text-accent font-semibold flex items-center gap-1.5 mx-auto"
              >
                <RotateCcw size={13} />
                <span>Didn&apos;t receive code? Resend OTP</span>
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Step 3: Customer Documents Dashboard */}
      {step === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Customer Top Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-primary/5 p-1 border border-primary/10 flex items-center justify-center shrink-0 shadow-sm">
                <Image
                  src="/logo.png"
                  alt="Ananke Laundry Logo"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 text-olive font-semibold text-xs tracking-wider uppercase mb-1">
                  <Sparkles size={14} />
                  <span>Verified Customer Portal</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-dark">
                  Welcome, {customer?.name || 'Valued Customer'}
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm font-body mt-0.5">
                  Phone: <span className="font-mono text-dark font-medium">{customer?.formatted || customer?.phone}</span>
                  {customer?.customerId && (
                    <span className="ml-2 text-gray-400">&bull; Account #{customer.customerId.slice(-6)}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="tel:+94912250777"
                className="px-4 py-2.5 rounded-full border border-gray-200 text-dark hover:border-olive text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Phone size={13} className="text-olive" />
                <span>Support: 091 225 0777</span>
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Sign out of portal"
              >
                <LogOut size={13} />
                <span>Exit</span>
              </button>
            </div>
          </div>

          {/* Financial Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Total Invoices</span>
                <p className="font-heading font-bold text-2xl text-dark mt-1">{summary.totalInvoices}</p>
                <span className="text-[11px] text-gray-500">Processed Records</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Total Billed</span>
                <p className="font-heading font-bold text-2xl text-dark mt-1">LKR {summary.totalAmount.toLocaleString()}</p>
                <span className="text-[11px] text-gray-500">Commercial Services</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Total Paid</span>
                <p className="font-heading font-bold text-2xl text-emerald-700 mt-1">LKR {summary.totalPaid.toLocaleString()}</p>
                <span className="text-[11px] text-emerald-600">Receipted Funds</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">Balance Due</span>
                <p className="font-heading font-bold text-2xl text-rose-700 mt-1">LKR {summary.totalBalance.toLocaleString()}</p>
                <span className="text-[11px] text-gray-500">Outstanding Balance</span>
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-gray-200">
            <div>
              <h3 className="font-heading font-semibold text-lg text-dark">Your Bills &amp; Receipts</h3>
              <p className="text-xs text-gray-500">Ordered by newest issue date</p>
            </div>

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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    activeFilter === tab.id
                      ? 'bg-olive text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-olive/50'
                  }`}
                >
                  {tab.label} <span className="opacity-80 ml-0.5 font-normal">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Invoices List */}
          {filteredInvoices.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
                <FileText size={28} />
              </div>
              <h4 className="font-heading font-bold text-lg text-dark">No Invoices Found</h4>
              <p className="text-gray-500 text-xs sm:text-sm font-body mt-2 leading-relaxed">
                There are no invoices matching the selected filter for this account.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setActiveFilter('ALL')}
                  className="px-5 py-2.5 rounded-full bg-olive text-white text-xs font-semibold hover:bg-accent hover:text-dark transition-all"
                >
                  View All Invoices
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.payment_status === 'Paid';
                const isPartiallyPaid = inv.payment_status === 'Partially Paid';
                const hasReceipt = inv.amount_paid > 0;

                return (
                  <motion.div
                    key={inv.invoice_id}
                    layout
                    className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    {/* Left Details */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono font-bold text-base text-dark">
                          #{inv.invoice_number}
                        </span>
                        <span className="text-xs text-gray-400">&bull;</span>
                        <span className="text-xs text-gray-600 font-medium">
                          {inv.date}
                        </span>

                        {/* Status Badge */}
                        {isPaid && (
                          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={12} /> PAID
                          </span>
                        )}
                        {isPartiallyPaid && (
                          <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Clock size={12} /> PARTIALLY PAID
                          </span>
                        )}
                        {!isPaid && !isPartiallyPaid && (
                          <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <AlertCircle size={12} /> UNPAID
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-heading font-semibold text-dark">
                        {inv.description || 'Commercial Laundry & Linen Care'}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-600 pt-1">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Total Amount</span>
                          <span className="font-bold text-dark text-sm">
                            LKR {inv.total.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Amount Paid</span>
                          <span className="font-bold text-emerald-700 text-sm">
                            LKR {inv.amount_paid.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Balance Due</span>
                          <span className={`font-bold text-sm ${inv.balance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                            LKR {inv.balance.toLocaleString()}
                          </span>
                        </div>

                        {inv.payment_date && (
                          <div>
                            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Payment Date</span>
                            <span className="text-gray-700 font-medium">
                              {inv.payment_date}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap sm:flex-nowrap md:flex-col lg:flex-row items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0">
                      {/* View Invoice */}
                      <button
                        onClick={() => openInvoicePreview(inv)}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-olive hover:text-white text-dark text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Eye size={14} />
                        <span>View Invoice</span>
                      </button>

                      {/* Download Invoice PDF */}
                      <a
                        href={`/api/portal/invoice-pdf?id=${inv.invoice_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-gray-200 hover:border-olive text-dark text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Download size={14} className="text-olive" />
                        <span>Download PDF</span>
                      </a>

                      {/* View & Download Payment Receipt if Paid */}
                      {hasReceipt && (
                        <>
                          <button
                            onClick={() => openReceiptPreview(inv)}
                            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-emerald-200/60"
                          >
                            <Receipt size={14} />
                            <span>View Receipt</span>
                          </button>

                          <a
                            href={`/api/portal/receipt-pdf?id=${inv.payment_id || 'mock-pay-1042'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Download size={14} />
                            <span>Receipt PDF</span>
                          </a>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
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
