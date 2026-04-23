import { useState, useEffect, useMemo } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownRight, Download, Filter, Loader2 } from 'lucide-react';
import { subscribeToOrders, formatOrderDate, normalise } from '../services/ordersService';

export default function Payments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    let volume = 0;
    let refunds = 0;
    let pending = 0;

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    orders.forEach(o => {
      const amount = Number(o.totalAmount || 0);
      const status = normalise(o.status);
      const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt || 0);

      if (d >= thirtyDaysAgo) {
        if (status === 'delivered') volume += amount;
        if (status === 'cancelled') refunds += amount;
      }
      if (['pending', 'confirmed', 'out for delivery'].includes(status)) {
        pending += amount;
      }
    });

    return { volume, refunds, pending };
  }, [orders]);

  const transactions = useMemo(() => {
    return orders.slice(0, 15).map(o => {
      const status = normalise(o.status);
      return {
        id: o.id,
        date: formatOrderDate(o.createdAt),
        type: status === 'cancelled' ? 'Refund' : 'Credit',
        amount: o.totalAmount || 0,
        status: status === 'delivered' ? 'Completed' : 
                status === 'cancelled' ? 'Processed' : 'Pending',
        method: o.paymentMethod || 'COD / App'
      };
    });
  }, [orders]);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Payments</h1>
          <p className="text-text-secondary mt-1">Manage transactions, refunds, and financial reporting.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline text-sm"><Filter size={14} /> Filter</button>
          <button className="btn-outline text-sm"><Download size={14} /> Export</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Total Volume (30d)</p>
          <div className="flex items-center gap-2 mb-2">
            {loading ? <Loader2 size={24} className="animate-spin text-purple-400" /> : <p className="text-3xl font-bold text-white">₹{stats.volume.toLocaleString()}</p>}
          </div>
          <p className="text-xs text-accent-green flex items-center gap-1"><ArrowUpRight size={12} /> Real-time</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Refunds (30d)</p>
          <div className="flex items-center gap-2 mb-2">
            {loading ? <Loader2 size={24} className="animate-spin text-purple-400" /> : <p className="text-3xl font-bold text-white">₹{stats.refunds.toLocaleString()}</p>}
          </div>
          <p className="text-xs text-text-secondary flex items-center gap-1"><ArrowDownRight size={12} /> Cancelled Orders</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Pending Escrow</p>
          <div className="flex items-center gap-2 mb-2">
             {loading ? <Loader2 size={24} className="animate-spin text-purple-400" /> : <p className="text-3xl font-bold text-white">₹{stats.pending.toLocaleString()}</p>}
          </div>
          <p className="text-xs text-text-secondary">Expected from ongoing deliveries</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-dark-500/30">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-[10px] text-text-muted uppercase tracking-widest border-b border-dark-500/30">
              <th className="text-left p-4 font-semibold">Transaction ID</th>
              <th className="text-left p-4 font-semibold">Date</th>
              <th className="text-left p-4 font-semibold">Method</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-right p-4 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center"><Loader2 size={24} className="animate-spin mx-auto text-purple-400" /></td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-text-muted">No transactions found</td></tr>
            ) : transactions.map((t, i) => (
              <tr key={t.id} className="border-t border-dark-500/20 hover:bg-dark-500/10">
                <td className="p-4 text-sm font-semibold text-white font-mono">{t.id.slice(0,8)}...</td>
                <td className="p-4 text-sm text-text-secondary">{t.date}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-text-muted" />
                    <span className="text-sm text-white">{t.method}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`status-badge ${t.status === 'Completed' || t.status === 'Processed' ? 'badge-delivered' : 'badge-pending'}`}>{t.status}</span>
                </td>
                <td className={`p-4 text-sm font-bold text-right ${t.type === 'Refund' ? 'text-accent-red' : 'text-white'}`}>
                  {t.type === 'Refund' ? '-' : '+'}₹{t.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
