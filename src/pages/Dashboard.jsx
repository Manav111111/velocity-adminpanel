import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Activity, ShoppingCart, DollarSign, Users, Clock, FileText, Radio, AlertTriangle, ArrowUpRight, Plus } from 'lucide-react';
import { dashboardStats, revenueData, topMovers, recentOrders, criticalAlerts } from '../data/mockData';

const statCards = [
  { label: 'TOTAL ORDERS', value: '12,482', trend: '+14%', up: true, icon: ShoppingCart },
  { label: 'REVENUE (USD)', value: '$284.5K', trend: '+22%', up: true, icon: DollarSign },
  { label: 'ACTIVE USERS', value: '3,204', trend: 'Stable →', up: null, icon: Users },
  { label: 'PENDING ORDERS', value: '142', trend: 'High ▲', up: false, icon: Clock },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card-solid px-3 py-2 text-xs">
        <p className="text-white font-semibold">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [chartPeriod, setChartPeriod] = useState('Daily');

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-[0.2em] font-semibold mb-2">System Performance</p>
          <h1 className="text-4xl font-bold text-white leading-tight">Operational<br />Intelligence.</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline text-sm">
            <FileText size={16} />
            Export Report
          </button>
          <button className="btn-outline text-sm">
            <Radio size={16} />
            Live Monitor
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="glass-card p-5 slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-3">{card.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-white">{card.value}</p>
              <span className={`text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1
                ${card.up === true ? 'text-accent-green bg-accent-green/10' : ''}
                ${card.up === false ? 'text-accent-red bg-accent-red/10' : ''}
                ${card.up === null ? 'text-text-secondary bg-dark-400/30' : ''}
              `}>
                {card.up === true && <TrendingUp size={12} />}
                {card.up === false && <TrendingDown size={12} />}
                {card.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Top Movers Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Revenue Velocity</h3>
              <p className="text-sm text-text-secondary">Real-time performance across delivery nodes</p>
            </div>
            <div className="flex items-center bg-dark-600 rounded-lg p-0.5">
              {['Daily', 'Weekly'].map(p => (
                <button key={p} onClick={() => setChartPeriod(p)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all
                    ${chartPeriod === p ? 'bg-purple-500 text-white' : 'text-text-muted hover:text-text-primary'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
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

        {/* Top Movers */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Top Movers</h3>
            <button className="text-xs text-purple-400 hover:text-purple-300 font-semibold">View All</button>
          </div>
          <div className="space-y-4">
            {topMovers.map((item) => (
              <div key={item.id} className="flex items-center gap-3 group">
                <img src={item.image} alt={item.name} className="w-11 h-11 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                  <p className="text-xs text-text-muted">{item.sold}</p>
                </div>
                <p className="text-sm font-bold text-white">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
          {/* Inventory Health */}
          <div className="mt-6 pt-4 border-t border-glass-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-secondary">Inventory Health</p>
              <p className="text-sm font-bold text-accent-green">92%</p>
            </div>
            <div className="w-full h-2 bg-dark-500 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-green to-accent-cyan rounded-full" style={{ width: '92%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders + Alerts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-white">Recent Transactional Flux</h3>
            <button className="btn-outline text-xs py-1.5 px-3">
              All Channels ▾
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-text-muted uppercase tracking-widest">
                <th className="text-left pb-3 font-semibold">Order ID</th>
                <th className="text-left pb-3 font-semibold">Customer</th>
                <th className="text-left pb-3 font-semibold">Amount</th>
                <th className="text-left pb-3 font-semibold">Timestamp</th>
                <th className="text-left pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-dark-500/30 hover:bg-dark-500/10 transition-colors">
                  <td className="py-3.5 text-sm font-semibold text-white">{order.id}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-accent-blue flex items-center justify-center text-[10px] font-bold text-white">
                        {order.avatar}
                      </div>
                      <span className="text-sm text-white">{order.customer}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-sm font-semibold text-white">${order.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td className="py-3.5 text-sm text-text-secondary">{order.date}</td>
                  <td className="py-3.5">
                    <span className={`status-badge ${
                      order.status === 'Delivered' ? 'badge-delivered' :
                      order.status === 'Packed' ? 'badge-packed' :
                      'badge-pending'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Critical Alerts */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-accent-red rounded-full animate-pulse" />
            Critical Alerts
          </h3>
          <div className="space-y-3">
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                alert.type === 'stock' ? 'bg-accent-red/5 border-accent-red/20' :
                alert.type === 'delivery' ? 'bg-accent-amber/5 border-accent-amber/20' :
                'bg-accent-blue/5 border-accent-blue/20'
              }`}>
                <p className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  {alert.type === 'stock' && <AlertTriangle size={14} className="text-accent-red" />}
                  {alert.title}
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">{alert.desc}</p>
                {alert.action && (
                  <button className="mt-2 text-xs font-bold text-accent-red bg-accent-red/10 px-3 py-1 rounded-lg hover:bg-accent-red/20 transition-colors">
                    {alert.action}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 hover:scale-110 transition-transform z-50">
        <Plus size={24} />
      </button>
    </div>
  );
}
