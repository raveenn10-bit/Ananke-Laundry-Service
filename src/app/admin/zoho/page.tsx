'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  RefreshCw,
  Building,
  CheckCircle2,
  Clock,
  XCircle,
  Database,
  ArrowLeft,
  Key,
} from 'lucide-react';
import { EnquiryRecord, SyncStats } from '@/types/quote';

export default function ZohoAdminDashboard() {
  const [adminKey, setAdminKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const fetchData = useCallback(async (keyToUse: string) => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const statusRes = await fetch('/api/admin/zoho/status', {
        headers: { 'x-admin-key': keyToUse },
      });

      if (statusRes.status === 401) {
        setIsLoading(false);
        return;
      }

      const statusJson = await statusRes.json();
      setStatusData(statusJson);

      const quotesRes = await fetch('/api/admin/quotes', {
        headers: { 'x-admin-key': keyToUse },
      });
      const quotesJson = await quotesRes.json();
      if (quotesJson.success) {
        setEnquiries(quotesJson.enquiries || []);
        setStats(quotesJson.stats || null);
      }
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setActionMessage('Failed to load dashboard data. Check your network or API status.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('ananke_admin_key') || '';
    if (saved) {
      setAdminKey(saved);
      fetchData(saved);
    } else {
      fetchData('');
    }
  }, [fetchData]);

  const handleManualSync = async (id: string) => {
    setSyncingId(id);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/zoho/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ enquiryId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Sync successful: ${data.result?.message || 'Updated in Zoho Books'}`);
      } else {
        setActionMessage(`Sync notice: ${data.result?.message || data.message}`);
      }
      await fetchData(adminKey);
    } catch (err: any) {
      setActionMessage(`Sync error: ${err?.message || 'Network failure'}`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleBatchSync = async () => {
    setIsBatchSyncing(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/zoho/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ syncAllPending: true }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Batch sync complete: Processed ${data.processedCount} records.`);
      } else {
        setActionMessage(`Batch notice: ${data.message}`);
      }
      await fetchData(adminKey);
    } catch (err: any) {
      setActionMessage(`Batch sync error: ${err?.message}`);
    } finally {
      setIsBatchSyncing(false);
    }
  };

  const filteredEnquiries = enquiries.filter((enq) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'synced') return enq.syncStatus === 'synced';
    if (filterStatus === 'pending')
      return enq.syncStatus === 'pending' || enq.syncStatus === 'pending_configuration';
    if (filterStatus === 'failed') return enq.syncStatus === 'failed';
    return true;
  });

  return (
    <div className="min-h-screen bg-cream/40 text-dark pb-16 font-body">
      {/* Top Header */}
      <header className="bg-primary text-white border-b border-primary-light sticky top-0 z-20 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-medium"
            >
              <ArrowLeft size={16} /> Back to Site
            </Link>
            <span className="text-gray-500">|</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent animate-pulse"></div>
              <h1 className="text-base sm:text-lg font-bold font-heading tracking-wide">
                Ananke Laundry &bull; Zoho Books Management
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="bg-white/10 hover:bg-white/20 text-xs px-3.5 py-1.5 rounded-lg font-medium transition-colors border border-white/20"
            >
              {showSetupGuide ? 'Hide Setup Guide' : 'Zoho Credentials Guide'}
            </button>
            <button
              onClick={() => fetchData(adminKey)}
              disabled={isLoading}
              className="bg-accent hover:bg-accent/90 text-dark text-xs px-3.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Setup Guide Banner (Collapsible) */}
        {showSetupGuide && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-olive/30 shadow-md mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-olive text-xs font-bold uppercase tracking-wider block mb-1">
                  Integration Guide
                </span>
                <h2 className="text-xl font-bold font-heading text-dark">
                  How to Activate the Live Zoho Books Connection
                </h2>
              </div>
              <button
                onClick={() => setShowSetupGuide(false)}
                className="text-gray-400 hover:text-dark text-xs bg-gray-100 px-2.5 py-1 rounded-md"
              >
                Close
              </button>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
              The website has complete architecture for Zoho Books Contacts, Estimates, and Invoices. To activate live synchronization, add the following environment variables to your deployment environment (Vercel Project Settings &gt; Environment Variables or local <code className="bg-cream px-2 py-0.5 rounded text-dark font-mono text-xs">.env.local</code>):
            </p>

            <div className="bg-primary text-gray-200 rounded-xl p-4 font-mono text-xs overflow-x-auto mb-4 border border-primary-light">
              <p className="text-accent mb-2"># Zoho Books API Credentials (from https://api-console.zoho.com)</p>
              <p>ZOHO_CLIENT_ID=your_zoho_client_id</p>
              <p>ZOHO_CLIENT_SECRET=your_zoho_client_secret</p>
              <p>ZOHO_REFRESH_TOKEN=your_zoho_refresh_token</p>
              <p>ZOHO_ORGANIZATION_ID=your_zoho_org_id</p>
              <p>ZOHO_DC=com <span className="text-gray-400"># or in, eu, com.au</span></p>
              <p className="text-accent mt-2"># Admin Access Protection</p>
              <p>ADMIN_SECRET_KEY=your_secret_admin_key</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-700">
              <div className="bg-cream/60 p-3 rounded-xl border border-cream-dark">
                <strong className="block text-dark font-semibold mb-1">1. API Console</strong>
                Register a Server-based Application or Self Client on <span className="text-olive underline">api-console.zoho.com</span>.
              </div>
              <div className="bg-cream/60 p-3 rounded-xl border border-cream-dark">
                <strong className="block text-dark font-semibold mb-1">2. Scope</strong>
                Authorize scope: <code className="text-[11px] font-mono">ZohoBooks.contacts.ALL, ZohoBooks.estimates.ALL, ZohoBooks.invoices.ALL</code>
              </div>
              <div className="bg-cream/60 p-3 rounded-xl border border-cream-dark">
                <strong className="block text-dark font-semibold mb-1">3. Zero Risk</strong>
                If keys are missing, leads are safely preserved locally without error to the customer.
              </div>
            </div>
          </div>
        )}

        {/* Action / Notification Banner */}
        {actionMessage && (
          <div className="bg-olive/10 border border-olive/30 text-olive-dark p-4 rounded-xl text-xs sm:text-sm font-medium mb-6 flex items-center justify-between gap-4">
            <span>{actionMessage}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-gray-400 hover:text-dark text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Zoho Books Connection
              </span>
              <ShieldCheck size={18} className="text-olive" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    statusData?.zoho?.isConfigured
                      ? statusData?.zoho?.connectivity?.success
                        ? 'bg-green-500'
                        : 'bg-amber-500'
                      : 'bg-gray-400'
                  }`}
                />
                <span className="text-lg font-bold text-dark">
                  {statusData?.zoho?.isConfigured
                    ? statusData?.zoho?.connectivity?.success
                      ? 'Connected'
                      : 'Auth Pending'
                    : 'Pending Config'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {statusData?.zoho?.isConfigured
                  ? `Data Center: ${statusData.zoho.dataCenter?.toUpperCase()}`
                  : 'Staging locally in secure repository'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Total Website Enquiries
              </span>
              <Database size={18} className="text-olive" />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-dark font-heading block mb-1">
                {stats?.totalEnquiries ?? 0}
              </span>
              <p className="text-xs text-gray-500">All client &amp; commercial leads</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Synced to Zoho Books
              </span>
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-green-700 font-heading block mb-1">
                {stats?.syncedCount ?? 0}
              </span>
              <p className="text-xs text-gray-500">Contacts created / matched</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Pending / Staged
              </span>
              <Clock size={18} className="text-amber-500" />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-amber-600 font-heading block mb-1">
                {stats?.pendingCount ?? 0}
              </span>
              <p className="text-xs text-gray-500">Safe in queue, ready to sync</p>
            </div>
          </div>
        </div>

        {/* Enquiries & Zoho Mapping Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/50">
            <div>
              <h3 className="text-lg font-bold font-heading text-dark">
                Commercial Enquiries &amp; Customer Mapping
              </h3>
              <p className="text-xs text-gray-500">
                Inspect incoming leads, verify duplicate protection, and track Zoho Books contact IDs.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-olive"
              >
                <option value="all">All Statuses</option>
                <option value="synced">Synced Only</option>
                <option value="pending">Pending / Staged</option>
                <option value="failed">Failed Only</option>
              </select>

              <button
                onClick={handleBatchSync}
                disabled={isBatchSyncing || isLoading}
                className="bg-olive hover:bg-accent hover:text-dark text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
              >
                <RefreshCw size={13} className={isBatchSyncing ? 'animate-spin' : ''} />
                Batch Sync Pending
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredEnquiries.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 bg-cream text-olive rounded-full flex items-center justify-center mx-auto mb-3">
                  <Building size={24} />
                </div>
                <h4 className="font-bold text-dark text-sm mb-1">No Enquiries Found</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                  When clients or hotels submit the website quote request form, their records will appear here for Zoho Books synchronization.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100/50 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Client / Business</th>
                    <th className="py-3.5 px-4">Service &amp; Property</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Zoho Customer ID</th>
                    <th className="py-3.5 px-4">Sync Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEnquiries.map((enq) => {
                    const isSynced = enq.syncStatus === 'synced';
                    const isPending =
                      enq.syncStatus === 'pending' || enq.syncStatus === 'pending_configuration';
                    const isFailed = enq.syncStatus === 'failed';

                    return (
                      <tr key={enq.id} className="hover:bg-cream/20 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-dark text-sm">
                            {enq.businessName || enq.customerName}
                          </div>
                          {enq.businessName && (
                            <div className="text-gray-500 text-[11px]">
                              Contact: {enq.customerName}
                            </div>
                          )}
                          {enq.address && (
                            <div className="text-gray-400 text-[11px] truncate max-w-[180px]">
                              {enq.address}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-medium text-dark">{enq.serviceRequired}</div>
                          <div className="text-gray-500 text-[11px]">
                            {enq.propertyType || 'Individual'} &bull; {enq.frequency || 'Standard'}
                          </div>
                          {enq.laundryVolume && (
                            <div className="text-olive text-[11px] font-medium">
                              {enq.laundryVolume}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <div className="text-dark font-medium">{enq.phone}</div>
                          <div className="text-gray-500 text-[11px]">{enq.email}</div>
                        </td>

                        <td className="py-4 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(enq.createdAt).toLocaleDateString()}
                          <div className="text-[10px] text-gray-400">
                            {new Date(enq.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px]">
                          {enq.zohoCustomerId ? (
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-semibold">
                              {enq.zohoCustomerId}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Not mapped yet</span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {isSynced && (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium border border-green-200 text-[11px]">
                              <CheckCircle2 size={12} /> Synced
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium border border-amber-200 text-[11px]">
                              <Clock size={12} /> Staged
                            </span>
                          )}
                          {isFailed && (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-medium border border-red-200 text-[11px]">
                              <XCircle size={12} /> Error
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleManualSync(enq.id)}
                            disabled={syncingId === enq.id}
                            className="bg-white hover:bg-gray-100 border border-gray-300 text-dark px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50"
                          >
                            {syncingId === enq.id ? 'Syncing...' : 'Sync to Zoho'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Security & Access Protection Footer */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-olive" />
            <span>
              Admin Endpoint Protected via <code className="font-mono text-dark font-semibold">ADMIN_SECRET_KEY</code>
            </span>
          </div>
          <div>
            <span>Ananke Laundry (Pvt) Ltd &bull; Cleanline Linen Management Network</span>
          </div>
        </div>
      </main>
    </div>
  );
}
