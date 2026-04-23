import { useState, useEffect, useMemo } from 'react';
import { Package, TrendingUp, AlertTriangle, Truck, Download, Filter, Plus, Loader2 } from 'lucide-react';
import { subscribeToCollection } from '../services/firestoreService';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real products collection for inventory
  useEffect(() => {
    const unsub = subscribeToCollection('products', (data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Calculate live inventory stats based on products
  const inventoryStats = useMemo(() => {
    let totalValue = 0;
    const lowStockItems = [];
    
    products.forEach(p => {
      // Assuming 'stock' or 'quantity' field exists on product
      const stock = Number(p.stock) || Number(p.quantity) || 0;
      const price = Number(p.price) || 0;
      
      totalValue += (stock * price);
      
      // Determine what constitutes low stock
      if (stock > 0 && stock <= 10) { // e.g., 10 or less
        lowStockItems.push({
          id: p.id,
          name: p.name || 'Unknown Product',
          unitsLeft: stock,
          sku: p.sku || p.id.slice(0, 8).toUpperCase()
        });
      }
    });

    return { totalValue, lowStockItems };
  }, [products]);

  // We fallback to empty movement history if there's no dedicated 'inventory_logs' collection.
  // In a real app, you'd subscribe to `inventory_logs` collection.
  const [movementHistory, setMovementHistory] = useState([]);

  useEffect(() => {
    // Attempt to listen to a hypothetical inventory_logs collection, 
    // gracefully degrading if it's empty.
    const unsub = subscribeToCollection('inventory_logs', (data) => {
      setMovementHistory(data.sort((a,b) => {
         const dA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
         const dB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
         return dB - dA;
      }).slice(0, 5));
    });
    return () => unsub();
  }, []);

  const getActionBadge = (action) => {
    const styles = {
      'ORDER DEDUCTION': 'bg-accent-blue/15 text-accent-blue',
      'SUPPLIER RESTOCK': 'bg-accent-green/15 text-accent-green',
      'DAMAGED GOODS': 'bg-accent-red/15 text-accent-red',
    };
    return styles[action.toUpperCase()] || 'bg-dark-300/30 text-text-muted';
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-[0.2em] font-semibold mb-2">Operational Overview</p>
          <h1 className="text-4xl font-bold text-white">Live Inventory</h1>
          <p className="text-text-secondary mt-2 max-w-lg">Manage live stock levels derived directly from your active products catalog.</p>
        </div>
        {/* Total Assets */}
        <div className="glass-card p-6 min-w-[260px] bg-gradient-to-br from-purple-900/30 to-dark-600">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-muted uppercase tracking-widest">Total Assets Value</p>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Package size={18} className="text-purple-400" />
            </div>
          </div>
          {loading ? (
             <Loader2 size={24} className="animate-spin text-purple-400" />
          ) : (
            <>
              <p className="text-3xl font-bold text-white">₹{inventoryStats.totalValue.toLocaleString()}</p>
              <p className="text-xs text-accent-green mt-1 flex items-center gap-1">
                 Auto-calculated from Products
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Low Stock Alerts */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 bg-accent-red rounded-full animate-pulse" />
            <h3 className="text-xl font-semibold text-white">Low Stock Alerts</h3>
            {!loading && (
              <span className="px-2.5 py-0.5 rounded-full bg-accent-red/15 text-accent-red text-xs font-semibold">
                {inventoryStats.lowStockItems.length} Critical
              </span>
            )}
          </div>
          <div className="space-y-3">
             {loading ? (
                <div className="glass-card p-5 text-center"><Loader2 size={20} className="animate-spin mx-auto text-text-muted"/></div>
             ) : inventoryStats.lowStockItems.length === 0 ? (
                <div className="glass-card p-5 text-center text-text-muted text-sm">All products are sufficiently stocked.</div>
             ) : (
               inventoryStats.lowStockItems.map((item, i) => (
                <div key={item.id} className="glass-card p-5 hover:border-accent-red/20 transition-all slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-dark-500/50 flex items-center justify-center text-text-muted font-bold text-xs uppercase">
                         {item.name.substring(0,2)}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-white truncate max-w-[200px]">{item.name}</h4>
                        <p className="text-sm text-accent-red font-semibold">{item.unitsLeft} Units Left</p>
                        <p className="text-xs text-text-muted">SKU/ID: {item.sku}</p>
                      </div>
                    </div>
                    <button className="w-10 h-10 flex-shrink-0 rounded-xl bg-accent-red/10 flex items-center justify-center text-accent-red hover:bg-accent-red/20 transition-colors">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              ))
             )}
          </div>
        </div>

        {/* Movement History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Movement Logs</h3>
            <div className="flex items-center gap-2">
              <button className="btn-outline py-1.5 px-3 text-xs">
                <Filter size={12} /> Filter
              </button>
            </div>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] text-text-muted uppercase tracking-widest border-b border-dark-500/30">
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-left p-3 font-semibold">Product</th>
                  <th className="text-left p-3 font-semibold">Action</th>
                  <th className="text-right p-3 font-semibold">Change</th>
                </tr>
              </thead>
              <tbody>
                {movementHistory.length === 0 ? (
                   <tr><td colSpan={4} className="p-6 text-center text-sm text-text-muted border-t border-dark-500/20">No logs available in database.</td></tr>
                ) : movementHistory.map((mov, i) => {
                   const d = mov.createdAt?.toDate ? mov.createdAt.toDate() : new Date(mov.createdAt || Date.now());
                   return (
                    <tr key={mov.id || i} className="border-t border-dark-500/20 hover:bg-dark-500/10 transition-colors">
                      <td className="p-3">
                        <p className="text-sm text-white">{d.toLocaleDateString()}</p>
                        <p className="text-xs text-text-muted">{d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </td>
                      <td className="p-3">
                         <span className="text-sm text-white max-w-[150px] truncate block">{mov.entity || mov.productName}</span>
                      </td>
                      <td className="p-3">
                        <span className={`status-badge ${getActionBadge(mov.action || 'UPDATE')}`}>{mov.action || 'UPDATE'}</span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`text-sm font-bold ${mov.adjustment > 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                          {mov.adjustment > 0 ? '+' : ''}{mov.adjustment || 0}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
