'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Search,
  RefreshCw,
  Eye,
  MessageSquare,
  Check,
  Copy,
  ExternalLink,
  X,
  Phone,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  Building,
  CheckCircle2,
  DollarSign,
  Send,
  FileText,
  User,
  MapPin,
  Tag,
  ShieldCheck,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import {
  ZohoOrderRecord,
  ZohoOrderStats,
  ZohoOrderFinancialStatus,
} from '@/types/zohoOrder';

const SECURE_MY_BILL_URL = 'https://ananke-laundry-service.vercel.app/my-bill';

function cleanWhatsAppText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#x20;/gi, ' ')
    .replace(/&#32;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .trim();
}

function generateCustomerWhatsAppMessage(customerName: string, invoiceNumber: string): string {
  const cleanName = cleanWhatsAppText(customerName) || 'Customer';
  const cleanInv = cleanWhatsAppText(invoiceNumber);

  return `🧺 Ananke Laundry\n\nHi ${cleanName} 👋,\n\nYour laundry order has been received successfully.\n\n🧾 Invoice: ${cleanInv}\n\n🔗 View your bill & track your order:\n${SECURE_MY_BILL_URL}\n\nThank you for choosing Ananke Laundry 💚`;
}

interface ZohoOrderCenterProps {
  adminKey?: string;
  onLogout?: () => void;
}

type FilterOption = 'All' | 'Retail' | 'Outside Hotel' | 'Today' | 'New' | 'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue';

export default function ZohoOrderCenter({ adminKey = '', onLogout }: ZohoOrderCenterProps) {
  // Main Data States
  const [orders, setOrders] = useState<ZohoOrderRecord[]>([]);
  const [stats, setStats] = useState<ZohoOrderStats | null>(null);
  const [isLiveZoho, setIsLiveZoho] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncingWithZoho, setIsSyncingWithZoho] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncMeta, setSyncMeta] = useState<{
    lastSuccessfulSync: string | null;
    lastSyncStatus: string;
    lastSyncMessage: string;
    lastModifiedTime: string | null;
    totalSynced: number;
    isSyncing: boolean;
  } | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');

  // Tracking New Invoices & Opened WhatsApp
  const knownInvoiceIdsRef = useRef<Set<string>>(new Set());
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());
  const [whatsAppOpenedMap, setWhatsAppOpenedMap] = useState<Record<string, boolean>>({});

  // Modals
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<ZohoOrderRecord | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [selectedOrderForWhatsApp, setSelectedOrderForWhatsApp] = useState<ZohoOrderRecord | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Fetch Orders Function (Loads exclusively from local persistent cache - zero API requests)
  const fetchOrders = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      }
      setErrorMessage(null);

      try {
        const headers: Record<string, string> = {};
        if (adminKey) {
          headers['x-admin-key'] = adminKey;
        }

        const url = '/api/admin/zoho/orders';

        const res = await fetch(url, {
          headers,
          cache: 'no-store',
        });

        if (!res.ok) {
          if (res.status === 401) {
            setErrorMessage('Unauthorized access. Please log in again.');
            return;
          }
          throw new Error(`Failed to load orders (HTTP ${res.status})`);
        }

        const data = await res.json();
        if (data.syncMeta) {
          setSyncMeta(data.syncMeta);
        }

        if (data.success && Array.isArray(data.orders)) {
          // Detect brand new orders since last fetch
          if (knownInvoiceIdsRef.current.size > 0) {
            const newlyDiscovered = new Set<string>();
            data.orders.forEach((o: ZohoOrderRecord) => {
              if (!knownInvoiceIdsRef.current.has(o.id)) {
                newlyDiscovered.add(o.id);
              }
            });
            if (newlyDiscovered.size > 0) {
              setNewlyAddedIds((prev) => new Set([...Array.from(prev), ...Array.from(newlyDiscovered)]));
            }
          }

          // Update known IDs
          data.orders.forEach((o: ZohoOrderRecord) => {
            knownInvoiceIdsRef.current.add(o.id);
          });

          setOrders(data.orders);
          setStats(data.stats || null);
          setIsLiveZoho(Boolean(data.isLiveZoho));

          if (data.syncMeta?.lastSyncStatus === 'rate_limited') {
            setErrorMessage(
              'Zoho synchronization is temporarily unavailable due to API limits. Showing the latest saved orders.'
            );
          } else if (data.message && data.message.includes('limit')) {
            setErrorMessage(data.message);
          }
        } else {
          // Protect cached orders: never overwrite valid cached orders with empty on transient failure
          if (data.orders && data.orders.length > 0) {
            setOrders(data.orders);
          }
          if (data.stats) setStats(data.stats);
          setIsLiveZoho(Boolean(data.isLiveZoho));
          if (data.message) {
            setErrorMessage(data.message);
          }
        }
      } catch (err: any) {
        console.error('Error fetching Zoho orders:', err);
        setErrorMessage(err.message || 'Network error fetching Zoho orders.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [adminKey]
  );

  // Controlled Sync With Zoho (POST request triggers sequential deduplicated sync)
  const handleSyncWithZoho = async () => {
    if (isSyncingWithZoho) return;
    setIsSyncingWithZoho(true);
    setErrorMessage(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (adminKey) {
        headers['x-admin-key'] = adminKey;
      }

      const res = await fetch('/api/admin/zoho/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({ forceFull: false }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setErrorMessage('Unauthorized access. Please log in again.');
          return;
        }
        throw new Error(`Sync request failed (HTTP ${res.status})`);
      }

      const data = await res.json();
      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
      if (data.stats) {
        setStats(data.stats);
      }
      if (data.syncMeta) {
        setSyncMeta(data.syncMeta);
      }

      if (data.rateLimited || data.syncMeta?.lastSyncStatus === 'rate_limited') {
        setErrorMessage(
          'Zoho synchronization is temporarily unavailable due to API limits. Showing the latest saved orders.'
        );
      } else if (!data.success && data.message) {
        setErrorMessage(data.message);
      }
    } catch (err: any) {
      console.error('Error syncing with Zoho:', err);
      setErrorMessage(err.message || 'Error occurred while syncing with Zoho Books.');
    } finally {
      setIsSyncingWithZoho(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders(false);
  }, [fetchOrders]);

  // Load Full Order Details
  const handleOpenDetails = async (order: ZohoOrderRecord) => {
    setSelectedOrderForDetails(order);
    setIsLoadingDetails(true);

    try {
      const headers: Record<string, string> = {};
      if (adminKey) {
        headers['x-admin-key'] = adminKey;
      }

      const res = await fetch(`/api/admin/zoho/orders?detailsId=${encodeURIComponent(order.id)}`, {
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          setSelectedOrderForDetails(data.order);
        }
      }
    } catch (err) {
      console.warn('Could not load detailed line items:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Open WhatsApp Confirmation Modal
  const handleOpenWhatsApp = (order: ZohoOrderRecord) => {
    setSelectedOrderForWhatsApp(order);
    setIsCopied(false);
    setWhatsAppModalOpen(true);
  };

  // Launch WhatsApp Chat URL
  const handleLaunchWhatsApp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!selectedOrderForWhatsApp || !selectedOrderForWhatsApp.whatsappPhone) return;

    const message = generateCustomerWhatsAppMessage(
      selectedOrderForWhatsApp.customerName,
      selectedOrderForWhatsApp.invoiceNumber
    );

    const targetPhone = selectedOrderForWhatsApp.whatsappPhone;
    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;

    // Mark as opened in current session (do this before navigation)
    setWhatsAppOpenedMap((prev) => ({
      ...prev,
      [selectedOrderForWhatsApp.id]: true,
    }));

    // Use anchor click trick to stay within the user gesture event —
    // window.open() can be blocked by popup blockers when called after
    // any async or state-update path. Direct <a> navigation is not blocked.
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    // Append to body briefly so Firefox respects it
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  // Copy Message to Clipboard
  const handleCopyMessage = async () => {
    if (!selectedOrderForWhatsApp) return;

    const message = generateCustomerWhatsAppMessage(
      selectedOrderForWhatsApp.customerName,
      selectedOrderForWhatsApp.invoiceNumber
    );

    try {
      await navigator.clipboard.writeText(message);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);

      setWhatsAppOpenedMap((prev) => ({
        ...prev,
        [selectedOrderForWhatsApp.id]: true,
      }));
    } catch {
      // Fallback
    }
  };

  // Filtered Orders Calculation
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = order.customerName.toLowerCase().includes(q);
        const invMatch = order.invoiceNumber.toLowerCase().includes(q);
        const soMatch = order.salesOrderNumber?.toLowerCase().includes(q);
        const phoneMatch = order.phone?.toLowerCase().includes(q) || order.whatsappPhone?.includes(q);
        const companyMatch = order.companyName?.toLowerCase().includes(q);
        const catMatch = order.category?.toLowerCase().includes(q);

        if (!nameMatch && !invMatch && !soMatch && !phoneMatch && !companyMatch && !catMatch) {
          return false;
        }
      }

      // 2. Status Filter
      if (activeFilter === 'All') return true;

      if (activeFilter === 'Today') {
        return order.date === todayStr || (order.createdTime && order.createdTime.startsWith(todayStr));
      }

      if (activeFilter === 'New') {
        return order.isNew || newlyAddedIds.has(order.id);
      }

      if (activeFilter === 'Paid') {
        return order.financialStatus === 'Paid';
      }

      if (activeFilter === 'Unpaid') {
        return order.financialStatus === 'Unpaid';
      }

      if (activeFilter === 'Partially Paid') {
        return order.financialStatus === 'Partially Paid';
      }

      if (activeFilter === 'Overdue') {
        return order.financialStatus === 'Overdue';
      }

      if (activeFilter === 'Retail') {
        const cat = (order.category || '').toLowerCase();
        return cat.includes('retail');
      }

      if (activeFilter === 'Outside Hotel') {
        const cat = (order.category || '').toLowerCase();
        return cat.includes('outside') || cat.includes('hotel');
      }

      return true;
    });
  }, [orders, searchQuery, activeFilter, todayStr, newlyAddedIds]);

  // Format currency helper
  const formatLKR = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // Helper: Status Badge Styler
  const renderStatusBadge = (status: ZohoOrderFinancialStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 size={11} className="text-emerald-700" />
            PAID
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock size={11} className="text-amber-700" />
            PARTIALLY PAID
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
            <AlertCircle size={11} className="text-red-600" />
            OVERDUE
          </span>
        );
      case 'Unpaid':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            UNPAID
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ================================================== */}
      {/* 1. DASHBOARD HEADER                                */}
      {/* ================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-olive bg-olive/10 px-2.5 py-0.5 rounded-lg">
              Official Admin Portal
            </span>
            {isLiveZoho ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Zoho Books Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Connecting to Live Zoho API...
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-dark tracking-tight">
            ANANKE LAUNDRY &mdash; Zoho Order Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            View Zoho customer orders and quickly send bill notifications through WhatsApp.
          </p>
        </div>

        {/* Sync with Zoho & Logout Actions */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5 self-start md:self-center shrink-0">
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleSyncWithZoho}
              disabled={isSyncingWithZoho || isLoading}
              className="px-4 py-2.5 rounded-2xl bg-olive hover:bg-olive/90 active:scale-95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Incrementally synchronize invoices from Zoho Books to local SQLite cache"
            >
              <RefreshCw size={14} className={isSyncingWithZoho ? 'animate-spin' : ''} />
              <span>{isSyncingWithZoho ? 'Syncing...' : 'Sync with Zoho'}</span>
            </button>
            {syncMeta?.lastSuccessfulSync ? (
              <span className="text-[10px] text-gray-500 font-medium">
                Last synced: {new Date(syncMeta.lastSuccessfulSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-medium">
                Local cache ready ({orders.length} orders)
              </span>
            )}
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 self-stretch sm:self-auto justify-center"
              title="Log Out of Admin Portal"
            >
              <LogOut size={14} className="text-rose-600" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Rate Limit Warning Banner (Non-destructive, displays saved orders) */}
      {syncMeta?.lastSyncStatus === 'rate_limited' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span className="font-medium">
              Zoho synchronization is temporarily unavailable due to API limits. Showing the latest saved orders.
            </span>
          </div>
          {syncMeta.lastSuccessfulSync && (
            <span className="text-[11px] font-semibold text-amber-800 shrink-0 bg-amber-100/90 px-3 py-1 rounded-xl">
              Last successful sync: {new Date(syncMeta.lastSuccessfulSync).toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* Error / Status Alert Banner */}
      {errorMessage && syncMeta?.lastSyncStatus !== 'rate_limited' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:text-rose-950 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ================================================== */}
      {/* 2. SUMMARY METRIC CARDS                            */}
      {/* ================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <FileText size={16} className="text-olive" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-dark font-heading block">
              {stats?.totalOrders ?? orders.length}
            </span>
            <span className="text-[10px] text-gray-400">All customer invoices</span>
          </div>
        </div>

        {/* New Orders */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/80 shadow-xs flex flex-col justify-between bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">New Orders</span>
            <Sparkles size={16} className="text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-heading block">
              {stats?.newOrders ?? 0}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Recent 24-48 hrs</span>
          </div>
        </div>

        {/* Paid */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Paid</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-heading block">
              {stats?.paidOrders ?? 0}
            </span>
            <span className="text-[10px] text-gray-400">Settled balances</span>
          </div>
        </div>

        {/* Unpaid */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Unpaid</span>
            <Clock size={16} className="text-rose-500" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-heading block">
              {stats?.unpaidOrders ?? 0}
            </span>
            <span className="text-[10px] text-gray-400">Payment pending</span>
          </div>
        </div>

        {/* Partially Paid */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Partially Paid</span>
            <DollarSign size={16} className="text-amber-500" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-heading block">
              {stats?.partiallyPaidOrders ?? 0}
            </span>
            <span className="text-[10px] text-gray-400">Partial deposits</span>
          </div>
        </div>

        {/* Retail Orders Card */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'Retail' ? 'All' : 'Retail')}
          className={`rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all flex flex-col justify-between ${
            activeFilter === 'Retail'
              ? 'bg-emerald-100 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200'
          }`}
          title="Click to view only Retail laundry orders"
        >
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Retail Orders</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-heading block">
              {orders.filter((o) => (o.category || '').toLowerCase().includes('retail')).length}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Walk-in & Residential</span>
          </div>
        </div>

        {/* Outside Hotel Orders Card */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'Outside Hotel' ? 'All' : 'Outside Hotel')}
          className={`rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all flex flex-col justify-between ${
            activeFilter === 'Outside Hotel'
              ? 'bg-blue-100 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
              : 'bg-blue-50/60 hover:bg-blue-50 border-blue-200'
          }`}
          title="Click to view only Outside Hotel orders"
        >
          <div className="flex items-center justify-between text-blue-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Outside Hotel</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-heading block">
              {orders.filter((o) => (o.category || '').toLowerCase().includes('outside') || (o.category || '').toLowerCase().includes('hotel')).length}
            </span>
            <span className="text-[10px] text-blue-600 font-medium">Hotels, Resorts & Villas</span>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. SEARCH & FILTERS BAR                            */}
      {/* ================================================== */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Fast Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, phone or invoice..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream/30 border border-gray-200 text-xs sm:text-sm text-dark placeholder:text-gray-400 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark text-xs p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="text-xs text-gray-400 font-medium">
            Showing <strong className="text-dark">{filteredOrders.length}</strong> of {orders.length} orders
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none pb-1 pt-1">
          {(
            [
              'All',
              'Retail',
              'Outside Hotel',
              'Today',
              'New',
              'Paid',
              'Unpaid',
              'Partially Paid',
              'Overdue',
            ] as FilterOption[]
          ).map((filter) => {
            const isActive = activeFilter === filter;
            const retailCount = orders.filter((o) => (o.category || '').toLowerCase().includes('retail')).length;
            const outsideHotelCount = orders.filter(
              (o) => (o.category || '').toLowerCase().includes('outside') || (o.category || '').toLowerCase().includes('hotel')
            ).length;

            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? filter === 'Retail'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : filter === 'Outside Hotel'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-dark text-white shadow-xs'
                    : filter === 'Retail'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    : filter === 'Outside Hotel'
                    ? 'bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100'
                    : 'bg-cream/40 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-dark'
                }`}
              >
                <span>{filter === 'All' ? 'All Orders' : filter}</span>
                {filter === 'Retail' && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    {retailCount}
                  </span>
                )}
                {filter === 'Outside Hotel' && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-blue-200 text-blue-900'
                    }`}
                  >
                    {outsideHotelCount}
                  </span>
                )}
                {filter === 'New' && (stats?.newOrders || 0) > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px]">
                    {stats?.newOrders}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================== */}
      {/* 4. ORDERS LIST (DESKTOP TABLE & MOBILE CARDS)      */}
      {/* ================================================== */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-200 shadow-sm">
          <div className="w-8 h-8 border-2 border-olive border-t-accent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-gray-500">Loading orders from Zoho Books...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm max-w-md mx-auto">
          <div className="w-12 h-12 bg-cream text-olive rounded-full flex items-center justify-center mx-auto mb-3">
            {errorMessage ? <AlertCircle size={22} className="text-amber-600" /> : <Search size={22} />}
          </div>
          <h3 className="font-heading font-bold text-base text-dark">
            {errorMessage ? 'Zoho Books Rate Limit Reached' : 'No Matching Orders'}
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            {errorMessage || 'No customer orders found matching your search or active filter.'}
          </p>
          {errorMessage && (
            <p className="text-[11px] text-amber-700 bg-amber-50 rounded-xl p-2.5 mt-3 border border-amber-200">
              The 10,000 daily API quota on Zoho Books has been reached. Zoho will reset this counter automatically. No mock/demo data is shown.
            </p>
          )}
          {(searchQuery || activeFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-dark text-xs font-semibold transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* DESKTOP RESPONSIVE TABLE (Visible md and up) */}
          <div className="hidden md:block bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-4 px-4">Invoice</th>
                    <th className="py-4 px-4">Customer</th>
                    <th className="py-4 px-4">Phone</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4">Total</th>
                    <th className="py-4 px-4">Balance</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const isNewOrder = order.isNew || newlyAddedIds.has(order.id);
                    const wasWhatsAppOpened = Boolean(whatsAppOpenedMap[order.id]);

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-cream/20 transition-colors group"
                      >
                        {/* Invoice & Sales Order */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-dark text-sm">
                              {order.invoiceNumber}
                            </span>
                            {isNewOrder && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white animate-pulse">
                                NEW
                              </span>
                            )}
                          </div>
                          {order.salesOrderNumber && (
                            <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                              SO: {order.salesOrderNumber}
                            </div>
                          )}
                          {wasWhatsAppOpened && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1">
                              <Check size={10} /> WhatsApp Opened
                            </span>
                          )}
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-dark text-sm">
                            {order.customerName}
                          </div>
                          {order.companyName && (
                            <div className="text-gray-500 text-[11px] truncate max-w-[180px]">
                              {order.companyName}
                            </div>
                          )}
                          {order.category && (
                            <div className="mt-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  order.category.toLowerCase().includes('retail')
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : 'bg-blue-50 text-blue-800 border-blue-300'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    order.category.toLowerCase().includes('retail')
                                      ? 'bg-emerald-500'
                                      : 'bg-blue-500'
                                  }`}
                                />
                                {order.category}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {order.hasUsablePhone ? (
                            <div className="font-medium text-dark font-mono text-[12px] flex items-center gap-1.5">
                              <Phone size={12} className="text-emerald-600" />
                              <span>{order.phone}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">
                              No phone number
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 whitespace-nowrap text-gray-600 font-medium">
                          {order.date}
                        </td>

                        {/* Total */}
                        <td className="py-4 px-4 whitespace-nowrap font-bold text-dark">
                          {formatLKR(order.total)}
                        </td>

                        {/* Balance */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              order.balance > 0 ? 'text-rose-700' : 'text-emerald-700'
                            }`}
                          >
                            {formatLKR(order.balance)}
                          </span>
                          {order.amountPaid > 0 && (
                            <div className="text-[10px] text-gray-400">
                              Paid: {formatLKR(order.amountPaid)}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {renderStatusBadge(order.financialStatus)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenDetails(order)}
                              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-dark text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                              title="View Invoice & Order Details"
                            >
                              <Eye size={13} className="text-gray-500" />
                              <span>View Details</span>
                            </button>

                            {order.hasUsablePhone ? (
                              <button
                                onClick={() => handleOpenWhatsApp(order)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                title="Send WhatsApp Bill Notification"
                              >
                                <MessageSquare size={13} />
                                <span>Send WhatsApp</span>
                              </button>
                            ) : (
                              <button
                                disabled
                                className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-400 text-xs font-medium cursor-not-allowed border border-gray-200"
                                title="Customer phone number is missing in Zoho"
                              >
                                No phone number
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARD VIEW (Visible below md) */}
          <div className="md:hidden space-y-4">
            {filteredOrders.map((order) => {
              const isNewOrder = order.isNew || newlyAddedIds.has(order.id);
              const wasWhatsAppOpened = Boolean(whatsAppOpenedMap[order.id]);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4"
                >
                  {/* Card Header: Invoice # & NEW Badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-dark">
                        {order.invoiceNumber}
                      </span>
                      {order.salesOrderNumber && (
                        <span className="text-[10px] text-gray-400 font-mono">
                          ({order.salesOrderNumber})
                        </span>
                      )}
                    </div>
                    {isNewOrder && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Customer & Phone */}
                  <div>
                    <h3 className="font-bold text-dark text-base">{order.customerName}</h3>
                    {order.companyName && (
                      <p className="text-xs text-gray-500">{order.companyName}</p>
                    )}
                    {order.category && (
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            order.category.toLowerCase().includes('retail')
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-blue-50 text-blue-800 border-blue-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              order.category.toLowerCase().includes('retail')
                                ? 'bg-emerald-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          {order.category}
                        </span>
                      </div>
                    )}
                    <p className="text-xs font-mono text-gray-600 mt-0.5">
                      {order.hasUsablePhone ? order.phone : 'No phone number'}
                    </p>
                  </div>

                  {/* Financial Details */}
                  <div className="bg-cream/40 rounded-2xl p-3.5 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Total:</span>
                      <strong className="text-dark font-bold">{formatLKR(order.total)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Balance:</span>
                      <strong
                        className={`font-bold ${
                          order.balance > 0 ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        {formatLKR(order.balance)}
                      </strong>
                    </div>
                  </div>

                  {/* Status & Date */}
                  <div className="flex items-center justify-between pt-1">
                    <div>{renderStatusBadge(order.financialStatus)}</div>
                    <div className="text-xs text-gray-500 font-medium">{order.date}</div>
                  </div>

                  {wasWhatsAppOpened && (
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      <Check size={11} /> WhatsApp Opened
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleOpenDetails(order)}
                      className="w-full py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-dark text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={14} className="text-gray-500" />
                      <span>View Details</span>
                    </button>

                    {order.hasUsablePhone ? (
                      <button
                        onClick={() => handleOpenWhatsApp(order)}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageSquare size={15} />
                        <span>🟢 Send WhatsApp</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 text-xs font-medium cursor-not-allowed border border-gray-200 text-center"
                      >
                        No phone number
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ================================================== */}
      {/* 5. VIEW DETAILS MODAL                              */}
      {/* ================================================== */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-auto shadow-2xl border border-gray-200 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-olive text-xs font-bold uppercase tracking-wider block mb-1">
                  Zoho Invoice Breakdown
                </span>
                <div className="flex items-center gap-3">
                  <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-dark">
                    Invoice #{selectedOrderForDetails.invoiceNumber}
                  </h3>
                  {renderStatusBadge(selectedOrderForDetails.financialStatus)}
                </div>
                {selectedOrderForDetails.salesOrderNumber && (
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    Linked Sales Order: {selectedOrderForDetails.salesOrderNumber}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer & Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-cream/40 p-4 rounded-2xl border border-cream-dark space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Customer &amp; Contact
                </span>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-dark text-sm">{selectedOrderForDetails.customerName}</p>
                  {selectedOrderForDetails.category && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        selectedOrderForDetails.category.toLowerCase().includes('retail')
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-blue-50 text-blue-800 border-blue-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedOrderForDetails.category.toLowerCase().includes('retail')
                            ? 'bg-emerald-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      {selectedOrderForDetails.category}
                    </span>
                  )}
                </div>
                {selectedOrderForDetails.companyName && (
                  <p className="text-gray-600">{selectedOrderForDetails.companyName}</p>
                )}
                <p className="text-dark font-mono">{selectedOrderForDetails.phone}</p>
                {selectedOrderForDetails.email && (
                  <p className="text-gray-500">{selectedOrderForDetails.email}</p>
                )}
                {selectedOrderForDetails.billingAddress?.address && (
                  <p className="text-gray-500 text-[11px] pt-1">
                    {selectedOrderForDetails.billingAddress.address}
                    {selectedOrderForDetails.billingAddress.city
                      ? `, ${selectedOrderForDetails.billingAddress.city}`
                      : ''}
                  </p>
                )}
              </div>

              <div className="bg-cream/40 p-4 rounded-2xl border border-cream-dark space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Invoice Schedule
                </span>
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice Date:</span>
                  <span className="font-semibold text-dark">{selectedOrderForDetails.date}</span>
                </div>
                {selectedOrderForDetails.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Due Date:</span>
                    <span className="font-semibold text-dark">{selectedOrderForDetails.dueDate}</span>
                  </div>
                )}
                {selectedOrderForDetails.createdTime && (
                  <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                    <span>Created:</span>
                    <span>{new Date(selectedOrderForDetails.createdTime).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-dark text-xs uppercase tracking-wider">
                  Line Items &bull; Laundry Services
                </h4>
                {isLoadingDetails && (
                  <span className="text-[10px] text-olive font-semibold animate-pulse">
                    Refreshing items...
                  </span>
                )}
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Service / Item</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrderForDetails.lineItems && selectedOrderForDetails.lineItems.length > 0 ? (
                      selectedOrderForDetails.lineItems.map((item, idx) => (
                        <tr key={item.itemId || idx} className="hover:bg-cream/10">
                          <td className="py-3 px-3">
                            <span className="font-bold text-dark block">{item.name}</span>
                            {item.description && (
                              <span className="text-gray-400 text-[11px] block">{item.description}</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-medium">{item.quantity}</td>
                          <td className="py-3 px-3 text-right text-gray-600">{formatLKR(item.rate)}</td>
                          <td className="py-3 px-3 text-right font-bold text-dark">
                            {formatLKR(item.itemTotal)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 px-3 text-center text-gray-400 italic">
                          Commercial laundry service summary
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-cream/50 rounded-2xl p-4 space-y-2 text-xs border border-cream-dark">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Invoice Amount:</span>
                <strong className="text-dark font-bold">{formatLKR(selectedOrderForDetails.total)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <strong className="text-emerald-700 font-bold">
                  {formatLKR(selectedOrderForDetails.amountPaid)}
                </strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200/60 text-sm">
                <span className="font-bold text-dark">Balance Due:</span>
                <strong
                  className={`font-extrabold ${
                    selectedOrderForDetails.balance > 0 ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {formatLKR(selectedOrderForDetails.balance)}
                </strong>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-dark text-xs font-semibold"
              >
                Close
              </button>

              {selectedOrderForDetails.hasUsablePhone && (
                <button
                  onClick={() => {
                    const ord = selectedOrderForDetails;
                    setSelectedOrderForDetails(null);
                    handleOpenWhatsApp(ord);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageSquare size={14} />
                  <span>Send WhatsApp Message</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 6. WHATSAPP CONFIRMATION PREVIEW MODAL             */}
      {/* ================================================== */}
      {whatsAppModalOpen && selectedOrderForWhatsApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full my-auto shadow-2xl border border-gray-200 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-dark">
                    Send WhatsApp Bill Notification
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Official Ananke Laundry Order Notification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsAppModalOpen(false)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Recipient Details Card */}
            <div className="bg-cream/40 rounded-2xl p-4 border border-cream-dark text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Recipient Customer:</span>
                <span className="font-bold text-dark">{selectedOrderForWhatsApp.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Destination WhatsApp:</span>
                <span className="font-mono font-bold text-emerald-700">
                  +{selectedOrderForWhatsApp.whatsappPhone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice Number:</span>
                <span className="font-mono font-semibold text-dark">
                  #{selectedOrderForWhatsApp.invoiceNumber}
                </span>
              </div>
              {selectedOrderForWhatsApp.category && (
                <div className="flex justify-between items-center pt-1.5 border-t border-cream-dark/60">
                  <span className="text-gray-500">Order Category:</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      selectedOrderForWhatsApp.category.toLowerCase().includes('retail')
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-blue-50 text-blue-800 border-blue-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedOrderForWhatsApp.category.toLowerCase().includes('retail')
                          ? 'bg-emerald-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    {selectedOrderForWhatsApp.category}
                  </span>
                </div>
              )}
            </div>

            {/* Live WhatsApp Bubble Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-gray-500 uppercase tracking-wider">
                  Live WhatsApp Message Preview:
                </span>
                <span className="text-emerald-700 font-semibold">Strict Plain Text</span>
              </div>
              <div className="bg-[#E7F8E8] border border-emerald-200/90 rounded-2xl p-4 text-xs font-mono text-dark whitespace-pre-wrap leading-relaxed shadow-xs select-all">
                {generateCustomerWhatsAppMessage(
                  selectedOrderForWhatsApp.customerName,
                  selectedOrderForWhatsApp.invoiceNumber
                )}
              </div>
            </div>

            {/* Instruction Notice */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-500 leading-relaxed">
              💡 <strong>Manual Send:</strong> Clicking below will launch WhatsApp with this message
              pre-filled. The staff member will manually review and click <strong>Send</strong> inside WhatsApp. No automated API is involved.
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              {selectedOrderForWhatsApp.whatsappPhone ? (
                <a
                  href={`https://wa.me/${selectedOrderForWhatsApp.whatsappPhone}?text=${encodeURIComponent(generateCustomerWhatsAppMessage(selectedOrderForWhatsApp.customerName, selectedOrderForWhatsApp.invoiceNumber))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setWhatsAppOpenedMap((prev) => ({
                      ...prev,
                      [selectedOrderForWhatsApp.id]: true,
                    }));
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer no-underline"
                >
                  <Send size={15} />
                  <span>Open in WhatsApp &amp; Send</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Send size={15} />
                  <span>No Phone Number</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyMessage}
                className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isCopied
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-olive'
                }`}
              >
                {isCopied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                <span>{isCopied ? 'Copied! ✓' : 'Copy Message'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
