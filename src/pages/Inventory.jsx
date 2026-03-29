import { useState } from 'react';
import { AlertTriangle, Download, Filter, Plus, TrendingUp, Package, Truck, AlertCircle, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { mockInventory } from '../data/mockData';

export default function Inventory() {
  const [inventory] = useState(mockInventory);

  const getActionBadge = (action) => {
    const styles = {
      'ORDER DEDUCTION': 'bg-accent-blue/15 text-accent-blue',
      'SUPPLIER RESTOCK': 'bg-accent-green/15 text-accent-green',
      'DAMAGED GOODS': 'bg-accent-red/15 text-accent-red',
    };
    return styles[action] || 'bg-dark-300/30 text-text-muted';
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-[0.2em] font-semibold mb-2">Operational Overview</p>
          <h1 className="text-4xl font-bold text-white">Inventory Control</h1>
          <p className="text-text-secondary mt-2 max-w-lg">Manage stock levels, monitor real-time movements, and handle automated procurement cycles from a single terminal.</p>
        </div>
        {/* Total Assets */}
        <div className="glass-card p-6 min-w-[260px] bg-gradient-to-br from-purple-900/30 to-dark-600">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-muted uppercase tracking-widest">Total Assets Value</p>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Package size={18} className="text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">${(inventory.totalValue).toLocaleString()}</p>
          <p className="text-xs text-accent-green mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> +12.4% compared to previous month (28.2M)
          </p>
        </div>
      </div>

      {/* Low Stock + Movement History */}
      <div className="grid grid-cols-2 gap-5">
        {/* Low Stock Alerts */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 bg-accent-red rounded-full animate-pulse" />
            <h3 className="text-xl font-semibold text-white">Low Stock Alerts</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-red/15 text-accent-red text-xs font-semibold">
              {inventory.lowStockItems.length} Items Critical
            </span>
          </div>
          <div className="space-y-3">
            {inventory.lowStockItems.map((item, i) => (
              <div key={item.id} className="glass-card p-5 hover:border-accent-red/20 transition-all slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-dark-500/50 flex items-center justify-center">
                      <Package size={20} className="text-text-muted" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white">{item.name}</h4>
                      <p className="text-sm text-accent-red font-semibold">{item.unitsLeft} Units Left</p>
                      <p className="text-xs text-text-muted">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-xl bg-accent-red/10 flex items-center justify-center text-accent-red hover:bg-accent-red/20 transition-colors">
                    <Truck size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Movement History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Movement History</h3>
            <div className="flex items-center gap-2">
              <button className="btn-outline py-1.5 px-3 text-xs">
                <Download size={12} /> Export CSV
              </button>
              <button className="btn-outline py-1.5 px-3 text-xs">
                <Filter size={12} /> Filter Logs
              </button>
            </div>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] text-text-muted uppercase tracking-widest border-b border-dark-500/30">
                  <th className="text-left p-3 font-semibold">Timestamp</th>
                  <th className="text-left p-3 font-semibold">Entity</th>
                  <th className="text-left p-3 font-semibold">Action</th>
                  <th className="text-right p-3 font-semibold">Adjustment</th>
                </tr>
              </thead>
              <tbody>
                {inventory.movementHistory.map((mov, i) => (
                  <tr key={i} className="border-t border-dark-500/20 hover:bg-dark-500/10 transition-colors">
                    <td className="p-3">
                      <p className="text-sm text-white">{mov.time}</p>
                      <p className="text-xs text-text-muted">{mov.orderId || mov.batchId || mov.adminNote || ''}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-dark-500/50 flex items-center justify-center">
                          <Package size={14} className="text-text-muted" />
                        </div>
                        <span className="text-sm text-white">{mov.entity}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`status-badge ${getActionBadge(mov.action)}`}>{mov.action}</span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`text-sm font-bold ${mov.adjustment > 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                        {mov.adjustment > 0 ? '+' : ''}{mov.adjustment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-3 text-center border-t border-dark-500/30">
              <button className="text-xs text-text-muted hover:text-text-primary uppercase tracking-wider font-semibold">
                Load More Activity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Analysis Banner */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-8 bg-gradient-to-br from-dark-600 to-purple-900/20">
          <h3 className="text-2xl font-bold text-white mb-3">Predictive Stock<br />Analysis</h3>
          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            Our AI models suggest increasing 'Beverages' inventory by 15% before the upcoming holiday weekend to prevent out-of-stock scenarios.
          </p>
          <button className="btn-primary text-sm">
            Review Recommendations
          </button>
        </div>
        <div className="glass-card p-0 overflow-hidden bg-gradient-to-br from-dark-600 to-dark-800 flex items-center justify-center">
          <div className="p-8 text-center">
            <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Live Cam: Zone A-4</p>
            <h4 className="text-lg font-semibold text-white">Automated Logistics Terminal</h4>
            <div className="mt-4 w-full h-32 bg-dark-500/50 rounded-xl flex items-center justify-center">
              <AlertCircle size={32} className="text-text-muted" />
            </div>
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
