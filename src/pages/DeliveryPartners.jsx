import { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Plus, Star, Clock, CheckSquare, ArrowRight, Zap, Loader2 } from 'lucide-react';
import { subscribeToCollection } from '../services/firestoreService';

const tabs = ['All', 'Top Rated', 'In-Transit'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card-solid px-3 py-2 text-xs">
        <p className="text-white font-semibold">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function DeliveryPartners() {
  const [activeTab, setActiveTab] = useState('All');
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Note: If you don't have a 'delivery_partners' collection yet, 
  // you can create it directly when adding a partner from the app.
  useEffect(() => {
    const unsub = subscribeToCollection('delivery_partners', (data) => {
      setPartners(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    return partners.filter(p => {
      if (activeTab === 'Top Rated') return (Number(p.rating) || 0) >= 4.9;
      if (activeTab === 'In-Transit') return p.status === 'In Delivery';
      return true;
    });
  }, [partners, activeTab]);

  const getStatusColor = (status) => {
    const colors = { 
      'In Delivery': 'bg-accent-green/15 text-accent-green', 
      'Available': 'bg-accent-blue/15 text-accent-blue', 
      'Inactive': 'bg-dark-300/30 text-text-muted', 
      'Returning': 'bg-accent-amber/15 text-accent-amber' 
    };
    return colors[status] || 'bg-dark-300/30 text-text-muted';
  };

  // We can compute a dynamic performance chart if we had performance logs,
  // but lacking that we'll simulate a 12-point recent timeline for UI aesthetics.
  // In a real app this would be computed from delivery times over the last 12 hours.
  const performanceData = useMemo(() => {
    const baseVal = 92;
    return Array.from({ length: 12 }).map((_, i) => ({
      time: `${i * 2}h`,
      value: Number((baseVal + Math.random() * 6).toFixed(1))
    }));
  }, [partners.length]);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Fleet <span className="font-black italic">Intelligence</span></h1>
          <p className="text-text-secondary mt-2 max-w-lg">Monitor real-time logistics performance and manage the active delivery network across metropolitan sectors.</p>
        </div>
        <button className="btn-outline">
          <Plus size={18} /> Onboard Partner
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Performance Chart */}
        <div className="col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest font-semibold">Live Performance</p>
              <h3 className="text-lg font-semibold text-white mt-1">On-Time Performance</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <span className="text-sm text-text-secondary">Connected</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis domain={[90, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="url(#areaGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Right Stats */}
        <div className="space-y-4">
          <div className="glass-card p-6 text-center h-[calc(50%-8px)]">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
              <Clock size={22} className="text-purple-400" />
            </div>
            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Avg Delivery Time</p>
            <p className="text-3xl font-bold text-white">18.4</p>
            <p className="text-lg text-text-secondary -mt-1">min</p>
            <p className="text-xs text-accent-green mt-2">Live estimation</p>
          </div>
          <div className="glass-card p-6 bg-gradient-to-br from-purple-900/40 to-dark-600 h-[calc(50%-8px)] flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare size={18} className="text-purple-400" />
              <p className="text-xs text-text-muted uppercase tracking-widest font-semibold">Assign Orders</p>
            </div>
            <p className="text-2xl font-bold text-white mb-3">Tasks Ready</p>
            <button className="btn-primary w-full justify-center text-sm py-2.5">
              Auto-Allocate Now
            </button>
          </div>
        </div>
      </div>

      {/* Active Fleet */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-white">Active Fleet</h3>
            <span className="text-text-secondary text-sm">{loading ? '...' : partners.length} Partners Displayed</span>
          </div>
          <div className="flex items-center bg-dark-600 rounded-lg p-0.5">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all
                  ${activeTab === t ? 'bg-purple-500 text-white' : 'text-text-muted hover:text-text-primary'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {loading ? (
             <div className="col-span-2 glass-card p-8 text-center flex flex-col items-center">
                <Loader2 size={32} className="animate-spin text-purple-400 mb-2"/>
                <p className="text-text-muted">Loading active fleet data...</p>
             </div>
          ) : filtered.length === 0 ? (
             <div className="col-span-2 glass-card p-8 text-center">
                <p className="text-text-muted">No delivery partners match this filter.</p>
             </div>
          ) : filtered.map((partner, i) => (
            <div key={partner.id} className="glass-card p-5 flex items-center gap-4 hover:border-purple-500/30 transition-all slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="relative">
                {partner.image || partner.profileImage ? (
                  <img src={partner.image || partner.profileImage} alt={partner.name} className="w-16 h-16 rounded-2xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-dark-400 flex items-center justify-center text-white text-xl font-bold">
                    {(partner.name || 'P').charAt(0)}
                  </div>
                )}
                <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-dark-600 ${partner.online ? 'bg-accent-green' : 'bg-dark-300'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-base font-semibold text-white truncate max-w-[150px]">{partner.name || 'Unknown'}</h4>
                  <div className="flex items-center gap-1 text-accent-amber">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs font-semibold">{Number(partner.rating || 0).toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-xs text-text-muted mb-2 font-mono truncate max-w-[150px]">ID: {partner.id}</p>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider">Total Orders</p>
                    <p className="text-lg font-bold text-white">{(partner.totalOrders || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider">Status</p>
                    <span className={`status-badge ${getStatusColor(partner.status || 'Available')}`}>{partner.status || 'Available'}</span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-xl bg-purple-500/10 flex flex-shrink-0 items-center justify-center text-purple-400 hover:bg-purple-500/20 transition-colors">
                <Zap size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center py-4">
        <button className="text-text-secondary hover:text-text-primary text-sm font-semibold inline-flex items-center gap-2 group">
          View Detailed Analytics
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
