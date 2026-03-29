import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, Truck, Package, CheckCircle, Clock, X, XCircle } from 'lucide-react';
import { mockOrders, mockDeliveryPartners } from '../data/mockData';
import toast from 'react-hot-toast';

const statusFlow = ['Pending', 'Packed', 'Out for Delivery', 'Delivered'];
const statusIcons = { 'Pending': Clock, 'Packed': Package, 'Out for Delivery': Truck, 'Delivered': CheckCircle, 'Cancelled': XCircle };

export default function Orders() {
  const [orders, setOrders] = useState(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const filtered = orders.filter(o => {
    const matchesSearch = o.customer.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const updateStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    toast.success(`Order ${orderId} → ${newStatus}`);
  };

  const getNextStatus = (current) => {
    const idx = statusFlow.indexOf(current);
    return idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
  };

  const getStatusBadge = (status) => {
    const cls = {
      'Delivered': 'badge-delivered', 'Packed': 'badge-packed', 'Pending': 'badge-pending',
      'Out for Delivery': 'bg-accent-blue/15 text-accent-blue', 'Cancelled': 'badge-cancelled'
    };
    return cls[status] || 'badge-pending';
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-[0.2em] font-semibold mb-2">Order Pipeline</p>
          <h1 className="text-4xl font-bold text-white">Orders</h1>
          <p className="text-text-secondary mt-1">Track, manage and fulfill customer orders across all channels.</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2">
        {['All', ...statusFlow, 'Cancelled'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${statusFilter === s ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'text-text-secondary hover:text-text-primary border border-transparent hover:border-glass-border'}`}>
            {s}
          </button>
        ))}
        <div className="ml-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search orders..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} className="glass-input pl-9 py-2 text-sm w-56" />
        </div>
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <div className="flex-1 glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-text-muted uppercase tracking-widest border-b border-dark-500/30">
                <th className="text-left p-4 font-semibold">Order ID</th>
                <th className="text-left p-4 font-semibold">Customer</th>
                <th className="text-left p-4 font-semibold">Amount</th>
                <th className="text-left p-4 font-semibold">Date</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((order) => {
                const Icon = statusIcons[order.status] || Clock;
                const nextStatus = getNextStatus(order.status);
                return (
                  <tr key={order.id} className="border-t border-dark-500/20 hover:bg-dark-500/10 transition-colors">
                    <td className="p-4 text-sm font-semibold text-white">{order.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm text-white font-medium">{order.customer}</p>
                        <p className="text-xs text-text-muted">{order.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-white">${order.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-sm text-text-secondary">{order.date} • {order.time}</td>
                    <td className="p-4">
                      <span className={`status-badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedOrder(order)}
                          className="btn-outline py-1.5 px-3 text-xs">
                          <Eye size={12} /> View
                        </button>
                        {nextStatus && (
                          <button onClick={() => updateStatus(order.id, nextStatus)}
                            className="btn-primary py-1.5 px-3 text-xs">
                            → {nextStatus}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-4 border-t border-dark-500/30 flex items-center justify-between">
            <p className="text-xs text-text-muted">Showing {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30"><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold ${currentPage === page ? 'bg-purple-500 text-white' : 'text-text-muted hover:bg-dark-500/30'}`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {/* Order Detail Panel */}
        {selectedOrder && (
          <div className="w-96 glass-card-solid p-6 slide-in-right self-start sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="glass-card p-4">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Order ID</p>
                <p className="text-lg font-bold text-white">{selectedOrder.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-3">
                  <p className="text-xs text-text-muted mb-1">Status</p>
                  <span className={`status-badge ${getStatusBadge(selectedOrder.status)}`}>{selectedOrder.status}</span>
                </div>
                <div className="glass-card p-3">
                  <p className="text-xs text-text-muted mb-1">Total</p>
                  <p className="text-lg font-bold text-white">${selectedOrder.amount.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Customer</p>
                <p className="text-sm font-semibold text-white">{selectedOrder.customer}</p>
                <p className="text-xs text-text-secondary">{selectedOrder.email}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Items</p>
                {selectedOrder.items.map((item, i) => (
                  <p key={i} className="text-sm text-text-secondary py-1 border-b border-dark-500/20 last:border-0">• {item}</p>
                ))}
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Delivery Address</p>
                <p className="text-sm text-text-secondary">{selectedOrder.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Payment</p>
                  <p className="text-sm text-white">{selectedOrder.payment}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Delivery Partner</p>
                  <p className="text-sm text-white">{selectedOrder.deliveryPartner || 'Unassigned'}</p>
                </div>
              </div>
              {/* Status Pipeline */}
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Status Pipeline</p>
                <div className="flex items-center gap-1">
                  {statusFlow.map((s, i) => {
                    const isCompleted = statusFlow.indexOf(selectedOrder.status) >= i;
                    const isCurrent = selectedOrder.status === s;
                    return (
                      <div key={s} className="flex-1 flex flex-col items-center gap-1">
                        <div className={`w-full h-1.5 rounded-full ${isCompleted ? 'bg-purple-500' : 'bg-dark-400'}`} />
                        <p className={`text-[9px] font-semibold ${isCurrent ? 'text-purple-400' : isCompleted ? 'text-text-secondary' : 'text-text-muted'}`}>{s}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Assign Delivery Partner */}
              {!selectedOrder.deliveryPartner && selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && (
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">Assign Partner</label>
                  <select className="glass-input w-full text-sm"
                    onChange={(e) => {
                      const partner = e.target.value;
                      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, deliveryPartner: partner } : o));
                      setSelectedOrder(prev => ({ ...prev, deliveryPartner: partner }));
                      toast.success(`Assigned ${partner}`);
                    }}>
                    <option value="">Select partner...</option>
                    {mockDeliveryPartners.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
