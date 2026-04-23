import { useState, useEffect, useMemo } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Eye, Truck, Package,
  CheckCircle, Clock, X, XCircle, RefreshCw, MapPin, Phone,
  User, ShoppingBag, AlertCircle, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribeToOrders, updateOrderStatus, formatOrderDate, normalise } from '../services/ordersService';

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Canonical status flow. The app stores lowercase statuses;
 * we normalise for display and matching.
 */
const STATUS_FLOW = ['pending', 'confirmed', 'out for delivery', 'delivered'];

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  'out for delivery': 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_ICONS = {
  pending: Clock,
  confirmed: Package,
  'out for delivery': Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const STATUS_BADGE = {
  pending: 'badge-pending',
  confirmed: 'badge-packed',
  'out for delivery': 'bg-accent-blue/15 text-accent-blue',
  delivered: 'badge-delivered',
  cancelled: 'badge-cancelled',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const getNextStatus = (current) => {
  const idx = STATUS_FLOW.indexOf(normalise(current));
  return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
};

const getBadgeClass = (status) =>
  STATUS_BADGE[normalise(status)] || 'badge-pending';

const getLabel = (status) =>
  STATUS_LABELS[normalise(status)] || status;

// ── Loading Skeleton ──────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-t border-dark-500/20">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-dark-500/40 rounded-lg animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// ── Order Detail Panel ────────────────────────────────────────────────────────

function OrderDetailPanel({ order, onClose }) {
  const [updating, setUpdating] = useState(false);

  const nextStatus = getNextStatus(order.status);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      toast.success(`Status updated → ${getLabel(newStatus)}`, {
        style: { background: '#0f1629', color: '#f1f5f9', border: '1px solid rgba(139,92,246,0.3)' },
        iconTheme: { primary: '#10b981', secondary: '#fff' },
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status. Try again.');
    } finally {
      setUpdating(false);
    }
  };

  const items = order.items || [];
  const currentIdx = STATUS_FLOW.indexOf(normalise(order.status));

  return (
    <div className="w-[400px] flex-shrink-0 glass-card-solid p-6 slide-in-right self-start sticky top-20 overflow-y-auto max-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white">Order Details</h3>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Order ID */}
        <div className="glass-card p-4">
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Order ID</p>
          <p className="text-base font-bold text-white font-mono">{order.id}</p>
          <p className="text-xs text-text-muted mt-1">{formatOrderDate(order.createdAt)}</p>
        </div>

        {/* Status + Total */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-3">
            <p className="text-[10px] text-text-muted mb-2">Status</p>
            <span className={`status-badge ${getBadgeClass(order.status)}`}>
              {getLabel(order.status)}
            </span>
          </div>
          <div className="glass-card p-3">
            <p className="text-[10px] text-text-muted mb-1">Total Amount</p>
            <p className="text-lg font-bold text-white">
              ₹{Number(order.totalAmount || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Receiver Details */}
        <div className="glass-card p-4 space-y-2">
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <User size={11} /> Receiver
          </p>
          <p className="text-sm font-semibold text-white">{order.receiverName || '—'}</p>
          {order.receiverPhone && (
            <p className="text-xs text-text-secondary flex items-center gap-1.5">
              <Phone size={11} className="text-text-muted" />
              {order.receiverPhone}
            </p>
          )}
          {order.userId && (
            <p className="text-[10px] text-text-muted font-mono mt-1">UID: {order.userId}</p>
          )}
        </div>

        {/* Delivery Address */}
        {order.address && (
          <div className="glass-card p-4">
            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <MapPin size={11} /> Delivery Address
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              {typeof order.address === 'object'
                ? [order.address.line1, order.address.line2, order.address.city, order.address.pincode]
                    .filter(Boolean).join(', ')
                : order.address}
            </p>
          </div>
        )}

        {/* Items */}
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <ShoppingBag size={11} /> Items ({items.length})
          </p>
          <div className="glass-card overflow-hidden">
            {items.length === 0 ? (
              <p className="text-sm text-text-muted p-4">No items found</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-500/30">
                    <th className="text-left p-3 text-[10px] text-text-muted uppercase tracking-wider">Item</th>
                    <th className="text-center p-3 text-[10px] text-text-muted uppercase tracking-wider">Qty</th>
                    <th className="text-right p-3 text-[10px] text-text-muted uppercase tracking-wider">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-t border-dark-500/20">
                      <td className="p-3 text-sm text-white">{item.name || item.productId}</td>
                      <td className="p-3 text-center text-sm text-text-secondary">×{item.quantity || item.qty || 1}</td>
                      <td className="p-3 text-right text-sm font-semibold text-white">
                        ₹{(Number(item.price || 0) * Number(item.quantity || item.qty || 1)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-glass-border">
                  <tr>
                    <td colSpan={2} className="p-3 text-sm font-semibold text-text-secondary">Total</td>
                    <td className="p-3 text-right text-base font-bold text-white">
                      ₹{Number(order.totalAmount || 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>

        {/* Status Pipeline */}
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-3">Status Pipeline</p>
          <div className="flex items-start gap-0.5">
            {STATUS_FLOW.map((s, i) => {
              const isCompleted = currentIdx >= i;
              const isCurrent = normalise(order.status) === s;
              return (
                <div key={s} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full h-1.5 rounded-full transition-colors ${
                    isCompleted ? 'bg-purple-500' : 'bg-dark-400'
                  }`} />
                  <p className={`text-[8px] font-semibold text-center leading-tight ${
                    isCurrent ? 'text-purple-400' : isCompleted ? 'text-text-secondary' : 'text-text-muted'
                  }`}>
                    {STATUS_LABELS[s]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Update Button */}
        {normalise(order.status) !== 'delivered' && normalise(order.status) !== 'cancelled' && nextStatus && (
          <button
            onClick={() => handleStatusUpdate(nextStatus)}
            disabled={updating}
            className="btn-primary w-full justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {updating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {updating ? 'Updating…' : `Mark as ${getLabel(nextStatus)}`}
          </button>
        )}

        {/* Manual status select (all options) */}
        {normalise(order.status) !== 'delivered' && normalise(order.status) !== 'cancelled' && (
          <div>
            <label className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5 block">
              Set Custom Status
            </label>
            <select
              className="glass-input w-full text-sm"
              value={normalise(order.status)}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              disabled={updating}
            >
              {STATUS_FLOW.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  // ── Real-time subscription ──────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
      setError(null);
      // Keep selected order in sync with live data
      setSelectedOrder((prev) => {
        if (!prev) return null;
        return data.find((o) => o.id === prev.id) || null;
      });
    });
    return () => unsub();
  }, []);

  // ── Filtering + pagination ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        (o.receiverName || '').toLowerCase().includes(searchLower) ||
        (o.userId || '').toLowerCase().includes(searchLower) ||
        o.id.toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter === 'All' ||
        normalise(o.status) === normalise(statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const ALL_TABS = ['All', 'pending', 'confirmed', 'out for delivery', 'delivered', 'cancelled'];

  const tabCount = (tab) =>
    tab === 'All' ? orders.length : orders.filter((o) => normalise(o.status) === tab).length;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-[0.2em] font-semibold mb-2">
            Live Order Pipeline
          </p>
          <h1 className="text-4xl font-bold text-white">Orders</h1>
          <p className="text-text-secondary mt-1">
            Real-time orders from Firebase Firestore. Auto-updates when new orders arrive.
          </p>
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-2 glass-card px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs font-semibold text-accent-green">Live</span>
          <span className="text-xs text-text-muted">{orders.length} orders</span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-card p-4 border-accent-red/30 bg-accent-red/5 flex items-center gap-3">
          <AlertCircle size={18} className="text-accent-red flex-shrink-0" />
          <p className="text-sm text-accent-red">{error}</p>
        </div>
      )}

      {/* Status Tabs + Search */}
      <div className="flex items-center gap-2 flex-wrap">
        {ALL_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5
              ${statusFilter === tab
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-text-secondary hover:text-text-primary border border-transparent hover:border-glass-border'
              }`}
          >
            {tab === 'All' ? 'All' : STATUS_LABELS[tab]}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              statusFilter === tab ? 'bg-purple-500/30 text-purple-300' : 'bg-dark-400 text-text-muted'
            }`}>
              {tabCount(tab)}
            </span>
          </button>
        ))}
        <div className="ml-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, ID, UID…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="glass-input pl-9 py-2 text-sm w-64"
          />
        </div>
      </div>

      {/* Table + Detail Panel */}
      <div className="flex gap-5">
        {/* Orders Table */}
        <div className="flex-1 glass-card overflow-hidden min-w-0">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-text-muted uppercase tracking-widest border-b border-dark-500/30">
                <th className="text-left p-4 font-semibold">Order ID</th>
                <th className="text-left p-4 font-semibold">Receiver</th>
                <th className="text-left p-4 font-semibold">Items</th>
                <th className="text-left p-4 font-semibold">Amount</th>
                <th className="text-left p-4 font-semibold">Date</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : paginated.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <ShoppingBag size={40} className="text-text-muted opacity-30" />
                        <p className="text-text-muted text-sm">
                          {orders.length === 0
                            ? 'No orders yet. Orders placed in the app will appear here in real-time.'
                            : 'No orders match your filter.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )
                : paginated.map((order) => {
                  const nextStatus = getNextStatus(order.status);
                  const itemCount = (order.items || []).length;
                  const isSelected = selectedOrder?.id === order.id;

                  return (
                    <tr
                      key={order.id}
                      className={`border-t border-dark-500/20 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-purple-500/10 border-l-2 border-l-purple-500'
                          : 'hover:bg-dark-500/10'
                      }`}
                      onClick={() => setSelectedOrder(isSelected ? null : order)}
                    >
                      <td className="p-4">
                        <p className="text-sm font-bold text-white font-mono truncate max-w-[120px]">
                          {order.id.slice(0, 12)}…
                        </p>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm text-white font-medium">{order.receiverName || '—'}</p>
                          <p className="text-xs text-text-muted">{order.receiverPhone || ''}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-text-secondary">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-white">
                        ₹{Number(order.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-xs text-text-secondary whitespace-nowrap">
                        {formatOrderDate(order.createdAt)}
                      </td>
                      <td className="p-4">
                        <span className={`status-badge ${getBadgeClass(order.status)}`}>
                          {getLabel(order.status)}
                        </span>
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(isSelected ? null : order)}
                            className={`btn-outline py-1.5 px-3 text-xs ${isSelected ? 'border-purple-500/50 text-purple-400' : ''}`}
                          >
                            <Eye size={12} /> {isSelected ? 'Close' : 'View'}
                          </button>
                          {nextStatus && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await updateOrderStatus(order.id, nextStatus);
                                  toast.success(`→ ${getLabel(nextStatus)}`, {
                                    style: { background: '#0f1629', color: '#f1f5f9', border: '1px solid rgba(139,92,246,0.3)' },
                                  });
                                } catch {
                                  toast.error('Update failed');
                                }
                              }}
                              className="btn-primary py-1.5 px-3 text-xs"
                            >
                              → {STATUS_LABELS[nextStatus]}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {/* Pagination */}
          {!loading && filtered.length > perPage && (
            <div className="p-4 border-t border-dark-500/30 flex items-center justify-between">
              <p className="text-xs text-text-muted">
                Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold ${
                      currentPage === page ? 'bg-purple-500 text-white' : 'text-text-muted hover:bg-dark-500/30'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Detail Panel */}
        {selectedOrder && (
          <OrderDetailPanel
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  );
}
