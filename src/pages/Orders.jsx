import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, Truck, Package, CheckCircle, Clock, X, XCircle, RefreshCw, MapPin, Phone, User, ShoppingBag, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribeToOrders, updateOrderStatus, formatOrderDate, normalise } from '../services/ordersService';

const STATUS_FLOW = ['pending', 'confirmed', 'out for delivery', 'delivered'];
const STATUS_LABELS = { pending:'Pending', confirmed:'Confirmed', 'out for delivery':'Out for Delivery', delivered:'Delivered', cancelled:'Cancelled' };
const STATUS_BADGE = { pending:'badge-pending', confirmed:'badge-packed', 'out for delivery':'bg-accent-blue/15 text-accent-blue', delivered:'badge-delivered', cancelled:'badge-cancelled' };

const getNext = c => { const i = STATUS_FLOW.indexOf(normalise(c)); return i>=0 && i<STATUS_FLOW.length-1 ? STATUS_FLOW[i+1] : null; };
const badge = s => STATUS_BADGE[normalise(s)] || 'badge-pending';
const label = s => STATUS_LABELS[normalise(s)] || s;

function OrderDetailPanel({ order, onClose }) {
  const [updating, setUpdating] = useState(false);
  const next = getNext(order.status);
  const items = order.items || [];
  const curIdx = STATUS_FLOW.indexOf(normalise(order.status));
  const addr = order.address;

  const update = async (s) => {
    setUpdating(true);
    try { await updateOrderStatus(order.id, s); toast.success(`→ ${label(s)}`); }
    catch { toast.error('Failed'); }
    finally { setUpdating(false); }
  };

  const formatAddr = () => {
    if (!addr) return null;
    if (typeof addr === 'string') return addr;
    return [addr.fullAddress, addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean).join(', ');
  };

  return (
    <div className="w-full lg:w-[400px] flex-shrink-0 glass-card-solid p-6 slide-in-right self-start lg:sticky lg:top-20 overflow-y-auto max-h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white">Order Details</h3>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X size={18}/></button>
      </div>
      <div className="space-y-4">
        <div className="glass-card p-4">
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Order ID</p>
          <p className="text-base font-bold text-white font-mono break-all">{order.id}</p>
          <p className="text-xs text-text-muted mt-1">{formatOrderDate(order.createdAt)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-3"><p className="text-[10px] text-text-muted mb-2">Status</p><span className={`status-badge ${badge(order.status)}`}>{label(order.status)}</span></div>
          <div className="glass-card p-3"><p className="text-[10px] text-text-muted mb-1">Total</p><p className="text-lg font-bold text-white">₹{Number(order.totalAmount||0).toFixed(2)}</p></div>
        </div>

        <div className="glass-card p-4 space-y-2">
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5"><User size={11}/> Receiver</p>
          <p className="text-sm font-semibold text-white">{order.receiverName||'—'}</p>
          {order.receiverPhone && <p className="text-xs text-text-secondary flex items-center gap-1.5"><Phone size={11} className="text-text-muted"/>{order.receiverPhone}</p>}
          {order.userId && <p className="text-[10px] text-text-muted font-mono mt-1">UID: {order.userId}</p>}
        </div>

        {/* Address */}
        {addr && (
          <div className="glass-card p-4">
            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5"><MapPin size={11}/> Delivery Address</p>
            <p className="text-sm text-text-secondary leading-relaxed">{formatAddr()}</p>
            {typeof addr === 'object' && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                {addr.city && <div><span className="text-text-muted">City:</span> <span className="text-white">{addr.city}</span></div>}
                {addr.pincode && <div><span className="text-text-muted">PIN:</span> <span className="text-white">{addr.pincode}</span></div>}
                {addr.lat && <div><span className="text-text-muted">Lat:</span> <span className="text-white font-mono">{addr.lat}</span></div>}
                {addr.lng && <div><span className="text-text-muted">Lng:</span> <span className="text-white font-mono">{addr.lng}</span></div>}
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5"><ShoppingBag size={11}/> Items ({items.length})</p>
          <div className="glass-card overflow-hidden">
            {items.length===0 ? <p className="text-sm text-text-muted p-4">No items</p> : (
              <table className="w-full">
                <thead><tr className="border-b border-dark-500/30"><th className="text-left p-3 text-[10px] text-text-muted uppercase">Item</th><th className="text-center p-3 text-[10px] text-text-muted uppercase">Qty</th><th className="text-right p-3 text-[10px] text-text-muted uppercase">Price</th></tr></thead>
                <tbody>{items.map((it,i)=>(
                  <tr key={i} className="border-t border-dark-500/20">
                    <td className="p-3 text-sm text-white">{it.name||it.productId}</td>
                    <td className="p-3 text-center text-sm text-text-secondary">×{it.quantity||it.qty||1}</td>
                    <td className="p-3 text-right text-sm font-semibold text-white">₹{(Number(it.price||0)*Number(it.quantity||it.qty||1)).toFixed(2)}</td>
                  </tr>
                ))}</tbody>
                <tfoot className="border-t border-glass-border"><tr><td colSpan={2} className="p-3 text-sm font-semibold text-text-secondary">Total</td><td className="p-3 text-right text-base font-bold text-white">₹{Number(order.totalAmount||0).toFixed(2)}</td></tr></tfoot>
              </table>
            )}
          </div>
        </div>

        {/* Pipeline */}
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-3">Status Pipeline</p>
          <div className="flex items-start gap-0.5">
            {STATUS_FLOW.map((s,i)=>(<div key={s} className="flex-1 flex flex-col items-center gap-1"><div className={`w-full h-1.5 rounded-full transition-colors ${curIdx>=i?'bg-purple-500':'bg-dark-400'}`}/><p className={`text-[8px] font-semibold text-center leading-tight ${normalise(order.status)===s?'text-purple-400':curIdx>=i?'text-text-secondary':'text-text-muted'}`}>{STATUS_LABELS[s]}</p></div>))}
          </div>
        </div>

        {normalise(order.status)!=='delivered' && normalise(order.status)!=='cancelled' && next && (
          <button onClick={()=>update(next)} disabled={updating} className="btn-primary w-full justify-center gap-2 disabled:opacity-60">
            {updating ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>} {updating?'Updating...':`Mark as ${label(next)}`}
          </button>
        )}
        {normalise(order.status)!=='delivered' && normalise(order.status)!=='cancelled' && (
          <div><label className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5 block">Set Status</label>
            <select className="glass-input w-full text-sm" value={normalise(order.status)} onChange={e=>update(e.target.value)} disabled={updating}>
              {STATUS_FLOW.map(s=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select></div>
        )}
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToOrders(data => {
      setOrders(data); setLoading(false);
      setSelected(prev => prev ? data.find(o=>o.id===prev.id)||null : null);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => orders.filter(o => {
    const s = search.toLowerCase();
    const match = (o.receiverName||'').toLowerCase().includes(s) || (o.userId||'').toLowerCase().includes(s) || o.id.toLowerCase().includes(s);
    const statMatch = statusFilter==='All' || normalise(o.status)===normalise(statusFilter);
    return match && statMatch;
  }), [orders, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page-1)*perPage, page*perPage);
  const TABS = ['All','pending','confirmed','out for delivery','delivered','cancelled'];
  const tabCount = t => t==='All' ? orders.length : orders.filter(o=>normalise(o.status)===t).length;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-[0.2em] font-semibold mb-2">Live Order Pipeline</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Orders</h1>
          <p className="text-text-secondary mt-1">Real-time orders from Firestore</p>
        </div>
        <div className="flex items-center gap-2 glass-card px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"/>
          <span className="text-xs font-semibold text-accent-green">Live</span>
          <span className="text-xs text-text-muted">{orders.length} orders</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map(t=>(
          <button key={t} onClick={()=>{setStatusFilter(t);setPage(1);}} className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${statusFilter===t?'bg-purple-500/15 text-purple-400 border border-purple-500/30':'text-text-secondary hover:text-text-primary border border-transparent hover:border-glass-border'}`}>
            {t==='All'?'All':label(t)}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${statusFilter===t?'bg-purple-500/30 text-purple-300':'bg-dark-400 text-text-muted'}`}>{tabCount(t)}</span>
          </button>
        ))}
        <div className="ml-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
          <input type="text" placeholder="Search..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="glass-input pl-9 py-2 text-sm w-48 md:w-64"/>
        </div>
      </div>

      {/* Table + Detail */}
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 glass-card overflow-x-auto min-w-0">
          <table className="w-full min-w-[650px]">
            <thead><tr className="text-[10px] text-text-muted uppercase tracking-widest border-b border-dark-500/30">
              <th className="text-left p-4 font-semibold">Order ID</th>
              <th className="text-left p-4 font-semibold">Receiver</th>
              <th className="text-left p-4 font-semibold">Items</th>
              <th className="text-left p-4 font-semibold">Amount</th>
              <th className="text-left p-4 font-semibold">Date</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? Array.from({length:5}).map((_,i)=><tr key={i} className="border-t border-dark-500/20">{[1,2,3,4,5,6].map(j=><td key={j} className="p-4"><div className="h-4 bg-dark-500/40 rounded-lg animate-pulse"/></td>)}</tr>) : paginated.length===0 ? (
                <tr><td colSpan={7} className="py-16 text-center"><ShoppingBag size={40} className="mx-auto mb-3 text-text-muted opacity-30"/><p className="text-text-muted text-sm">{orders.length===0?'No orders yet':'No matches'}</p></td></tr>
              ) : paginated.map(o=>{
                const n = getNext(o.status);
                const isSel = selected?.id===o.id;
                return (
                  <tr key={o.id} className={`border-t border-dark-500/20 transition-colors cursor-pointer ${isSel?'bg-purple-500/10 border-l-2 border-l-purple-500':'hover:bg-dark-500/10'}`} onClick={()=>setSelected(isSel?null:o)}>
                    <td className="p-4"><p className="text-sm font-bold text-white font-mono truncate max-w-[120px]">{o.id.slice(0,12)}…</p></td>
                    <td className="p-4"><p className="text-sm text-white">{o.receiverName||'—'}</p><p className="text-xs text-text-muted">{o.receiverPhone||''}</p></td>
                    <td className="p-4 text-sm text-text-secondary">{(o.items||[]).length} items</td>
                    <td className="p-4 text-sm font-bold text-white">₹{Number(o.totalAmount||0).toFixed(2)}</td>
                    <td className="p-4 text-xs text-text-secondary whitespace-nowrap">{formatOrderDate(o.createdAt)}</td>
                    <td className="p-4"><span className={`status-badge ${badge(o.status)}`}>{label(o.status)}</span></td>
                    <td className="p-4" onClick={e=>e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button onClick={()=>setSelected(isSel?null:o)} className={`btn-outline py-1.5 px-3 text-xs ${isSel?'border-purple-500/50 text-purple-400':''}`}><Eye size={12}/> {isSel?'Close':'View'}</button>
                        {n && <button onClick={async()=>{try{await updateOrderStatus(o.id,n);toast.success(`→ ${label(n)}`);}catch{toast.error('Failed');}}} className="btn-primary py-1.5 px-3 text-xs">→ {STATUS_LABELS[n]}</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filtered.length>perPage && (
            <div className="p-4 border-t border-dark-500/30 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-text-muted">{(page-1)*perPage+1}–{Math.min(page*perPage,filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-1">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted disabled:opacity-30"><ChevronLeft size={16}/></button>
                {Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(pg=><button key={pg} onClick={()=>setPage(pg)} className={`w-8 h-8 rounded-lg text-sm font-semibold ${page===pg?'bg-purple-500 text-white':'text-text-muted hover:bg-dark-500/30'}`}>{pg}</button>)}
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted disabled:opacity-30"><ChevronRight size={16}/></button>
              </div>
            </div>
          )}
        </div>
        {selected && <OrderDetailPanel order={selected} onClose={()=>setSelected(null)}/>}
      </div>
    </div>
  );
}
