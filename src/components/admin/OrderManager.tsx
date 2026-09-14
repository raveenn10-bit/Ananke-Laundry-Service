'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
  Send,
  ExternalLink,
  History,
  X,
  User,
  Phone,
  Calendar,
  Building,
  Sparkles,
  RefreshCw,
  FileText,
  Truck,
  CheckCheck,
} from 'lucide-react';
import { OrderRecord, OrderStatus, OrderPaymentStatus, ZohoCustomerLookupResult } from '@/types/order';

interface OrderManagerProps {
  adminKey: string;
}

const ALL_STATUSES: OrderStatus[] = [
  'Received',
  'Processing',
  'In Progress',
  'Ready',
  'Completed',
  'Collected',
  'Delivered',
  'Cancelled',
];

export default function OrderManager({ adminKey }: OrderManagerProps) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New Order Modal State
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [lookupResults, setLookupResults] = useState<ZohoCustomerLookupResult[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<ZohoCustomerLookupResult | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    itemName: 'Commercial Hotel Linen Care & Pressing',
    quantity: 20,
    expectedDays: 2,
    paymentStatus: 'Unpaid' as OrderPaymentStatus,
    notes: '',
    selectedInvoiceId: '',
    selectedInvoiceNumber: '',
  });

  // History Drawer State
  const [activeHistoryOrder, setActiveHistoryOrder] = useState<OrderRecord | null>(null);

  // Status updating indicator
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'x-admin-key': adminKey },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Customer Lookup
  const handleCustomerSearch = async () => {
    if (!lookupQuery.trim()) return;
    setIsSearchingCustomer(true);
    try {
      const res = await fetch(
        `/api/admin/zoho/customer-lookup?q=${encodeURIComponent(lookupQuery.trim())}`,
        { headers: { 'x-admin-key': adminKey } }
      );
      const data = await res.json();
      if (data.success) {
        setLookupResults(data.customers || []);
      }
    } catch (err: any) {
      console.error('Customer lookup error:', err);
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  const handleSelectCustomer = (c: ZohoCustomerLookupResult) => {
    setSelectedCustomer(c);
    if (c.invoices && c.invoices.length > 0) {
      setFormData((prev) => ({
        ...prev,
        selectedInvoiceId: c.invoices[0].invoiceId,
        selectedInvoiceNumber: c.invoices[0].invoiceNumber,
      }));
    }
  };

  // Submit New Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert('Please select a customer found from Zoho Books or enter customer details.');
      return;
    }

    setIsLoading(true);
    try {
      const expectedDate = new Date(Date.now() + formData.expectedDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          zohoCustomerId: selectedCustomer.customerId,
          zohoInvoiceId: formData.selectedInvoiceId || undefined,
          zohoInvoiceNumber: formData.selectedInvoiceNumber || undefined,
          customerName: selectedCustomer.customerName,
          customerPhone: selectedCustomer.phone || selectedCustomer.mobile,
          customerEmail: selectedCustomer.email,
          itemName: formData.itemName,
          quantity: formData.quantity,
          expectedCompletionDate: expectedDate,
          currentStatus: 'Received',
          paymentStatus: formData.paymentStatus,
          notes: formData.notes,
          createdBy: 'Admin (Galle Plant)',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice(`Order #${data.order.orderId} created successfully!`);
        setIsNewOrderModalOpen(false);
        setSelectedCustomer(null);
        setLookupResults([]);
        setLookupQuery('');
        await fetchOrders();
      } else {
        alert(data.message || 'Failed to create order.');
      }
    } catch (err: any) {
      alert(`Error creating order: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Status Change Handler
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    setActionNotice(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          newStatus,
          changedBy: 'Admin (Unawatuna Facility)',
          sendEmail: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice(
          `Status of #${orderId} updated to '${newStatus}'. ${
            data.emailSent ? '📧 Customer email dispatched automatically.' : ''
          }`
        );
        await fetchOrders();

        // Update active history order if open
        if (activeHistoryOrder && activeHistoryOrder.orderId === orderId) {
          setActiveHistoryOrder(data.order);
        }
      } else {
        alert(data.message || 'Failed to update status.');
      }
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Open WhatsApp Link
  const handleSendWhatsApp = (order: OrderRecord) => {
    const text = `🧺 *ANANKE LAUNDRY (PVT) LTD — ORDER UPDATE*
----------------------------------------
Hello *${order.customerName}*,

Good news! Your laundry order *#${order.orderId}* is now *${order.currentStatus.toUpperCase()}* ✨

📋 *Service / Item:* ${order.itemName}
🔢 *Quantity:* ${order.quantity} units
📌 *Status:* ${order.currentStatus}
💳 *Payment Status:* ${order.paymentStatus}
${order.zohoInvoiceNumber ? `🧾 *Invoice Ref:* #${order.zohoInvoiceNumber}\n` : ''}
📍 *Facility Pickup Address:*
No. 195/2, Matara Road, Unawatuna, Galle
📞 *Hotline:* 091 225 0777
🌐 *Website:* anankelaundry.com

Thank you for choosing Ananke Laundry!`;

    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const phoneDigits = cleanPhone.startsWith('94')
      ? cleanPhone
      : cleanPhone.startsWith('0')
      ? `94${cleanPhone.slice(1)}`
      : `94${cleanPhone}`;

    const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filter Orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.currentStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.itemName.toLowerCase().includes(q) ||
        (o.zohoInvoiceNumber && o.zohoInvoiceNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-950">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Action & Filter Bar */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, Customer Name, Phone, or Invoice #..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs sm:text-sm text-dark placeholder:text-gray-400 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/20"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders()}
            disabled={isLoading}
            className="p-2.5 rounded-2xl border border-gray-200 hover:border-olive text-gray-600 hover:text-dark transition-colors"
            title="Reload Orders"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-olive hover:bg-olive/90 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95"
          >
            <Plus size={16} />
            <span>New Order / Job</span>
          </button>
        </div>
      </div>

      {/* Status Filter Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none pb-1">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
            statusFilter === 'ALL'
              ? 'bg-dark text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          All Orders ({orders.length})
        </button>
        {ALL_STATUSES.map((status) => {
          const count = orders.filter((o) => o.currentStatus === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-olive text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-olive/40'
              }`}
            >
              {status} {count > 0 && <span className="opacity-80 ml-0.5">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Orders Table / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-dark">No Orders Found</h3>
          <p className="text-gray-500 text-xs mt-1">There are no orders matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isUpdating = updatingOrderId === order.orderId;
            return (
              <div
                key={order.orderId}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base text-dark bg-cream px-3 py-1 rounded-xl">
                      #{order.orderId}
                    </span>
                    {order.zohoInvoiceNumber && (
                      <span className="text-xs text-olive font-semibold bg-olive/10 px-2.5 py-1 rounded-lg">
                        Zoho: #{order.zohoInvoiceNumber}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">&bull;</span>
                    <span className="text-xs text-gray-500">Ordered: {order.orderDate}</span>
                  </div>

                  {/* Actions: WhatsApp & History */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendWhatsApp(order)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                      title="Send WhatsApp Update to Customer"
                    >
                      <Send size={13} />
                      <span>Send WhatsApp Update</span>
                    </button>
                    <button
                      onClick={() => setActiveHistoryOrder(order)}
                      className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-dark text-xs font-medium transition-colors flex items-center gap-1.5"
                      title="View Status History Timeline"
                    >
                      <History size={14} />
                      <span>Timeline ({order.statusHistory.length})</span>
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold block">Customer</span>
                    <p className="font-heading font-semibold text-dark text-sm mt-0.5">{order.customerName}</p>
                    <p className="text-gray-500">{order.customerPhone}</p>
                    {order.customerEmail && <p className="text-gray-400 truncate">{order.customerEmail}</p>}
                  </div>

                  <div>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold block">Item / Service</span>
                    <p className="font-medium text-dark text-sm mt-0.5">{order.itemName}</p>
                    <p className="text-gray-500">Qty: {order.quantity} units</p>
                  </div>

                  <div>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold block">Target Date &amp; Payment</span>
                    <p className="text-gray-700 mt-0.5">Due: <strong className="text-dark">{order.expectedCompletionDate}</strong></p>
                    <p className={`font-semibold mt-0.5 ${order.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      Payment: {order.paymentStatus}
                    </p>
                  </div>

                  {/* Status Dropdown Control */}
                  <div>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold block mb-1">
                      Current Status (Updates Customer)
                    </span>
                    <div className="relative">
                      <select
                        value={order.currentStatus}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value as OrderStatus)}
                        className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all cursor-pointer ${
                          order.currentStatus === 'Ready'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.currentStatus === 'Processing'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : order.currentStatus === 'Completed' || order.currentStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                            : 'bg-cream text-dark border-gray-200'
                        }`}
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {isUpdating && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <RefreshCw size={13} className="animate-spin text-olive" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Changing to Processing, Ready, or Completed triggers an email.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History Timeline Modal / Drawer */}
      {activeHistoryOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-bold text-lg text-dark">
                  Order Timeline &bull; #{activeHistoryOrder.orderId}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Customer: {activeHistoryOrder.customerName}</p>
              </div>
              <button
                onClick={() => setActiveHistoryOrder(null)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Timeline List */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {activeHistoryOrder.statusHistory.map((hist, idx) => (
                <div key={hist.id || idx} className="relative">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                      idx === 0 ? 'bg-olive ring-4 ring-olive/20' : 'bg-gray-400'
                    }`}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-dark">{hist.newStatus}</span>
                      <span className="text-[11px] text-gray-400">
                        {hist.date} at {hist.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Updated by: <strong>{hist.changedBy}</strong></p>
                    {hist.notes && <p className="text-xs text-gray-600 bg-cream/50 p-2 rounded-xl">{hist.notes}</p>}
                    {hist.emailSent && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Mail size={11} /> Automatic customer email sent
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveHistoryOrder(null)}
              className="w-full py-2.5 rounded-xl bg-gray-100 text-dark font-semibold text-xs hover:bg-gray-200"
            >
              Close Timeline
            </button>
          </div>
        </div>
      )}

      {/* New Order Modal with Instant Zoho Customer Lookup */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-auto shadow-2xl border border-gray-100 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-olive text-xs font-bold uppercase tracking-wider block">Zoho Connected</span>
                <h3 className="font-heading font-bold text-xl text-dark">Create Laundry Order / Job</h3>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* STEP 1: Zoho Books Customer Lookup */}
            <div className="bg-cream/40 p-5 rounded-2xl border border-cream-dark space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-dark">
                Step 1: Search Zoho Books Customer (Invoice #, Name, or Phone)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCustomerSearch())}
                  placeholder="e.g. ANK-1042, Araliya, or 0771234567..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-dark bg-white focus:outline-none focus:border-olive"
                />
                <button
                  type="button"
                  onClick={handleCustomerSearch}
                  disabled={isSearchingCustomer || !lookupQuery.trim()}
                  className="px-4 py-2.5 rounded-xl bg-dark hover:bg-primary text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Search size={14} className={isSearchingCustomer ? 'animate-spin' : ''} />
                  <span>Search Zoho</span>
                </button>
              </div>

              {/* Search Results */}
              {lookupResults.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-semibold text-gray-500">Matching Zoho Books Contacts:</span>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {lookupResults.map((c) => (
                      <div
                        key={c.customerId}
                        onClick={() => handleSelectCustomer(c)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                          selectedCustomer?.customerId === c.customerId
                            ? 'bg-olive/15 border-olive text-dark font-medium'
                            : 'bg-white border-gray-200 hover:border-olive/50'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-dark">{c.customerName}</p>
                          <p className="text-gray-500">
                            {c.phone || c.mobile} &bull; {c.email}
                          </p>
                          {c.invoices && c.invoices.length > 0 && (
                            <p className="text-[10px] text-olive font-medium mt-0.5">
                              Linked Invoices: {c.invoices.map((i) => `#${i.invoiceNumber}`).join(', ')}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          className="px-3 py-1 rounded-lg bg-olive text-white text-[11px] font-semibold hover:bg-accent hover:text-dark"
                        >
                          {selectedCustomer?.customerId === c.customerId ? 'Selected ✓' : 'Select Customer'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCustomer && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                  <span>
                    Linked Customer: <strong>{selectedCustomer.customerName}</strong> ({selectedCustomer.phone}) — No manual typing required.
                  </span>
                </div>
              )}
            </div>

            {/* STEP 2: Order Specifications Form */}
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Item / Laundry Service Name</label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-olive"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Quantity (Units / Batches)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-olive"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Expected Completion</label>
                  <select
                    value={formData.expectedDays}
                    onChange={(e) => setFormData({ ...formData, expectedDays: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-olive bg-white"
                  >
                    <option value={1}>Same-Day / 24 Hours Express</option>
                    <option value={2}>2 Days Standard</option>
                    <option value={3}>3 Days Commercial</option>
                    <option value={5}>5 Days Scheduled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as OrderPaymentStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-olive bg-white"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1 text-xs">Internal Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Special care for duvet covers, deliver before 4 PM..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-olive"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-dark text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !selectedCustomer}
                  className="px-6 py-2.5 rounded-xl bg-olive hover:bg-olive/90 text-white font-semibold text-xs sm:text-sm shadow-md disabled:opacity-50"
                >
                  {isLoading ? 'Creating Order...' : 'Create Order & Initialize Tracking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
