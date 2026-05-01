import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  ShoppingCart, DollarSign, Users,
  Package, FileText, Plus, Loader2,
  RefreshCw, ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToOrders, subscribeToDashboardStats, formatOrderDate } from '../services/ordersService';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_BADGE = {
  pending: 'badge-pending',
  confirmed: 'badge-packed',
  'out for delivery': 'bg-accent-blue/15 text-accent-blue',
  delivered: 'badge-delivered',
  cancelled: 'badge-cancelled',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  'out for delivery': 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const getBadgeClass = (status = '') =>
  STATUS_BADGE[(status || '').toLowerCase().trim()] || 'badge-pending';

const getLabel = (status = '') =>
  STATUS_LABELS[(status || '').toLowerCase().trim()] || status;

/**
 * Build a revenue-by-day chart from orders array.
 * Shows last 7 days' total revenue.
 */
function buildRevenueChart(orders) {
  const days = {};
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Initialise last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    days[key] = { name: dayNames[d.getDay()], value: 0 };
  }

  orders.forEach((o) => {
    const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt || 0);
    const key = d.toDateString();
    if (days[key] !== undefined) {
      days[key].value += Number(o.totalAmount || 0);
    }
  });

  return Object.values(days);
}

// ── Sub-components ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card-solid px-3 py-2 text-xs">
        <p className="text-white font-semibold">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

function StatCard({ label, value, icon: Icon, accent, loading, sub }) {
  return (
    <div className="glass-card p-5 slide-up">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] text-text-muted uppercase tracking-widest">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent.bg}`}>
          <Icon size={16} className={accent.icon} />
        </div>
      </div>
      {loading ? (
        <div className="h-9 bg-dark-500/40 rounded-lg animate-pulse w-28" />
      ) : (
        <p className="text-3xl font-bold text-white">{value}</p>
      )}
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-t border-dark-500/30">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="py-3.5">
          <div className="h-4 bg-dark-500/40 rounded-lg animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // ── Real-time stats ─────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = subscribeToDashboardStats((data) => {
      setStats(data);
      setStatsLoading(false);
      setLastRefreshed(new Date());
    });
    return () => unsub();
  }, []);

  // ── Recent orders & all orders for charts ───────────────────────────────────
  useEffect(() => {
    const unsub = subscribeToOrders((data) => {
      setAllOrders(data);
      setRecentOrders(data.slice(0, 8)); // top 8 for dashboard table
      setOrdersLoading(false);
    });
    return () => unsub();
  }, []);

  const chartData = buildRevenueChart(allOrders);

  const statCards = [
    {
      label: 'Total Orders',
      value: stats ? stats.totalOrders.toLocaleString() : '—',
      icon: ShoppingCart,
      accent: { bg: 'bg-purple-500/15', icon: 'text-purple-400' },
      sub: stats?.pendingOrders > 0 ? `${stats.pendingOrders} pending` : null,
    },
    {
      label: 'Total Revenue',
      value: stats ? `₹${stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}` : '—',
      icon: DollarSign,
      accent: { bg: 'bg-accent-green/15', icon: 'text-accent-green' },
      sub: 'Sum of all order amounts',
    },
    {
      label: 'Total Products',
      value: stats ? stats.totalProducts.toLocaleString() : '—',
      icon: Package,
      accent: { bg: 'bg-accent-blue/15', icon: 'text-accent-blue' },
      sub: 'Live count from Firestore',
    },
    {
      label: 'Registered Users',
      value: stats ? stats.totalUsers.toLocaleString() : '—',
      icon: Users,
      accent: { bg: 'bg-accent-pink/15', icon: 'text-accent-pink' },
      sub: 'All-time user count',
    },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-[0.2em] font-semibold mb-2">
            Live System Dashboard
          </p>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Operational<br />Intelligence.
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass-card px-3 py-2 text-xs text-text-muted">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-accent-green font-semibold">Live</span>
            <span className="text-text-muted">
              Updated {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <button className="btn-outline text-sm">
            <FileText size={16} />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} loading={statsLoading} />
        ))}
      </div>

      {/* Chart + Pending Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Over Last 7 Days */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Revenue (Last 7 Days)</h3>
              <p className="text-sm text-text-secondary">
                Aggregated from live Firestore orders
              </p>
            </div>
            {ordersLoading && <Loader2 size={16} className="text-purple-400 animate-spin" />}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.08)' }} />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6d28d9" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Breakdown */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Order Status</h3>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <RefreshCw size={12} />
              Real-time
            </div>
          </div>
          {statsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-dark-500/40 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { key: 'pending', label: 'Pending', color: 'bg-accent-amber', textColor: 'text-accent-amber' },
                { key: 'confirmed', label: 'Confirmed', color: 'bg-purple-500', textColor: 'text-purple-400' },
                { key: 'out for delivery', label: 'Out for Delivery', color: 'bg-accent-blue', textColor: 'text-accent-blue' },
                { key: 'delivered', label: 'Delivered', color: 'bg-accent-green', textColor: 'text-accent-green' },
                { key: 'cancelled', label: 'Cancelled', color: 'bg-accent-red', textColor: 'text-accent-red' },
              ].map(({ key, label, color, textColor }) => {
                const count = allOrders.filter((o) => (o.status || '').toLowerCase().trim() === key).length;
                const pct = stats?.totalOrders > 0 ? Math.round((count / stats.totalOrders) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-secondary">{label}</span>
                      <span className={`text-xs font-bold ${textColor}`}>{count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-dark-500 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Total Revenue Callout */}
          {!statsLoading && (
            <div className="mt-6 pt-4 border-t border-glass-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary">Total Revenue</p>
                <p className="text-sm font-bold text-accent-green">
                  ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="w-full h-2 bg-dark-500 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-gradient-to-r from-accent-green to-accent-cyan rounded-full w-full" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
            <p className="text-sm text-text-secondary">Last 8 orders — live from Firestore</p>
          </div>
          {ordersLoading && <Loader2 size={16} className="text-purple-400 animate-spin" />}
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-[10px] text-text-muted uppercase tracking-widest">
              <th className="text-left pb-3 font-semibold">Order ID</th>
              <th className="text-left pb-3 font-semibold">Receiver</th>
              <th className="text-left pb-3 font-semibold">Items</th>
              <th className="text-left pb-3 font-semibold">Amount</th>
              <th className="text-left pb-3 font-semibold">Timestamp</th>
              <th className="text-left pb-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {ordersLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : recentOrders.length === 0
              ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ShoppingBag size={36} className="text-text-muted opacity-30" />
                      <p className="text-sm text-text-muted">
                        No orders yet. New orders from your app will appear here in real-time.
                      </p>
                    </div>
                  </td>
                </tr>
              )
              : recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-dark-500/30 hover:bg-dark-500/10 transition-colors">
                  <td className="py-3.5 text-sm font-mono font-semibold text-white">
                    {order.id.slice(0, 10)}…
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-accent-blue flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                        {(order.receiverName || order.userId || '?').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-white">{order.receiverName || '—'}</p>
                        {order.receiverPhone && (
                          <p className="text-xs text-text-muted">{order.receiverPhone}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-sm text-text-secondary">
                    {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
                  </td>
                  <td className="py-3.5 text-sm font-semibold text-white">
                    ₹{Number(order.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 text-xs text-text-secondary whitespace-nowrap">
                    {formatOrderDate(order.createdAt)}
                  </td>
                  <td className="py-3.5">
                    <span className={`status-badge ${getBadgeClass(order.status)}`}>
                      {getLabel(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* FAB */}
      {user && (
        <button className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 hover:scale-110 transition-transform z-50">
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}
