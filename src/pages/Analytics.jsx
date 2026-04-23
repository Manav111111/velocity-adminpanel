import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Loader2, Activity } from 'lucide-react';
import { subscribeToCollection } from '../services/firestoreService';
import { subscribeToOrders } from '../services/ordersService';

export default function Analytics() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ordersLoaded = false;
    let productsLoaded = false;

    const checkLoading = () => {
      if (ordersLoaded && productsLoaded) setLoading(false);
    }

    const unsubOrders = subscribeToOrders((data) => {
      setOrders(data);
      ordersLoaded = true;
      checkLoading();
    });

    const unsubProducts = subscribeToCollection('products', (data) => {
      setProducts(data);
      productsLoaded = true;
      checkLoading();
    });

    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, []);

  // Compute live Weekly Revenue Trend
  const weeklyRevenueData = useMemo(() => {
    if (!orders.length) return [];
    
    // Group orders into last 4 weeks based on createdAt
    const weeks = [
      { name: 'Week 1', revenue: 0 },
      { name: 'Week 2', revenue: 0 },
      { name: 'Week 3', revenue: 0 },
      { name: 'Week 4', revenue: 0 },
    ];

    const now = new Date();
    
    orders.forEach(o => {
      const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt || 0);
      const diffTime = Math.abs(now - d);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      const amount = Number(o.totalAmount || 0);
      
      if (diffDays <= 7) weeks[3].revenue += amount; // This week
      else if (diffDays <= 14) weeks[2].revenue += amount; // Last week
      else if (diffDays <= 21) weeks[1].revenue += amount; // 2 weeks ago
      else if (diffDays <= 28) weeks[0].revenue += amount; // 3 weeks ago
    });

    return weeks;
  }, [orders]);

  // Compute live Sales by Category
  const categoryBreakdownData = useMemo(() => {
    if (!orders.length || !products.length) return [];
    
    // Map productId -> category
    const productCategories = {};
    products.forEach(p => {
       productCategories[p.id] = p.category || 'Uncategorised';
    });

    const categorySales = {};
    let totalSales = 0;

    orders.forEach(o => {
       // Only count successful/completed orders generally, but we'll count all for now
       if (o.status?.toLowerCase() === 'cancelled') return;
       
       const items = o.items || [];
       items.forEach(item => {
           const cat = productCategories[item.productId || item.id] || item.category || 'Uncategorised';
           const qty = Number(item.quantity || item.qty || 1);
           
           if (!categorySales[cat]) categorySales[cat] = 0;
           categorySales[cat] += qty;
           totalSales += qty;
       });
    });

    const breakdown = Object.keys(categorySales).map(cat => ({
       name: cat,
       value: totalSales > 0 ? Math.round((categorySales[cat] / totalSales) * 100) : 0
    })).sort((a,b) => b.value - a.value).slice(0, 5); // top 5

    return breakdown.length ? breakdown : [{ name: 'No Data', value: 0 }];
  }, [orders, products]);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between">
        <div>
           <p className="text-xs text-text-muted uppercase tracking-[0.2em] font-semibold mb-2 flex items-center gap-1.5">
             <Activity size={12} className="text-purple-400" /> Live Aggregation
           </p>
          <h1 className="text-4xl font-bold text-white">Analytics</h1>
          <p className="text-text-secondary mt-1">Deep dive into store performance and conversion metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white mb-0">Weekly Revenue Trend</h3>
            {loading && <Loader2 size={16} className="text-purple-400 animate-spin" />}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {loading ? (
               <div className="w-full h-full flex items-center justify-center text-text-muted">Loading live data...</div>
            ) : (
              <BarChart data={weeklyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={v => `₹${v >= 1000 ? v/1000 + 'k' : v}`} />
                <Tooltip cursor={{ fill: 'rgba(124,58,237,0.08)' }} contentStyle={{ backgroundColor: '#141933', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-semibold text-white mb-0">Sales by Category (%)</h3>
             {loading && <Loader2 size={16} className="text-purple-400 animate-spin" />}
          </div>
          <ResponsiveContainer width="100%" height={300}>
             {loading ? (
                <div className="w-full h-full flex items-center justify-center text-text-muted">Loading live data...</div>
             ) : (
                <BarChart data={categoryBreakdownData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={v => `${v}%`} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} width={80} />
                  <Tooltip cursor={{ fill: 'rgba(124,58,237,0.08)' }} contentStyle={{ backgroundColor: '#141933', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
             )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
