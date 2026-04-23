import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tag, Calendar, Percent, DollarSign, Copy, Loader2 } from 'lucide-react';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Offers() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ code: '', discount: '', type: 'percentage', minOrder: '', maxDiscount: '', validUntil: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeToCollection('coupons', (data) => {
      setCoupons(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!form.code || !form.discount) return toast.error('Code and discount required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        discount: Number(form.discount),
        minOrder: Number(form.minOrder) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
      };

      if (editingId) {
        await updateDocument('coupons', editingId, payload);
        toast.success('Coupon updated');
      } else {
        await addDocument('coupons', {
          ...payload,
          usageCount: 0,
          status: 'active'
        });
        toast.success('Coupon created');
      }
      resetForm();
    } catch (err) {
      toast.error('Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setForm({ code: c.code, discount: String(c.discount), type: c.type, minOrder: String(c.minOrder), maxDiscount: String(c.maxDiscount), validUntil: c.validUntil });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => { 
     try {
        await deleteDocument('coupons', id);
        toast.success('Coupon deleted');
     } catch (err) {
        toast.error('Delete failed');
     }
  };
  
  const resetForm = () => { setForm({ code: '', discount: '', type: 'percentage', minOrder: '', maxDiscount: '', validUntil: '' }); setEditingId(null); setShowForm(false); };
  const copyCode = (code) => { navigator.clipboard.writeText(code); toast.success(`Copied: ${code}`); };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-[0.2em] font-semibold mb-2">Promotions Engine</p>
          <h1 className="text-4xl font-bold text-white">Offers & Coupons</h1>
          <p className="text-text-secondary mt-1">Create and manage promotional offers to drive customer engagement.</p>
        </div>
        {user && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
            <Plus size={18} /> Create Coupon
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Active Coupons</p>
          <p className="text-3xl font-bold text-white">{coupons.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Total Redemptions</p>
          <p className="text-3xl font-bold text-white">{coupons.reduce((s, c) => s + c.usageCount, 0).toLocaleString()}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Expired</p>
          <p className="text-3xl font-bold text-white">{coupons.filter(c => c.status === 'expired').length}</p>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] text-text-muted uppercase tracking-widest border-b border-dark-500/30">
              <th className="text-left p-4 font-semibold">Code</th>
              <th className="text-left p-4 font-semibold">Discount</th>
              <th className="text-left p-4 font-semibold">Min Order</th>
              <th className="text-left p-4 font-semibold">Max Discount</th>
              <th className="text-left p-4 font-semibold">Valid Until</th>
              <th className="text-left p-4 font-semibold">Used</th>
              <th className="text-left p-4 font-semibold">Status</th>
              {user && <th className="text-left p-4 font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="p-8 text-center"><Loader2 className="mx-auto text-purple-400 animate-spin" /></td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan="8" className="p-8 text-center text-text-muted">No coupons found. Create your first offer!</td></tr>
            ) : coupons.map(coupon => (
              <tr key={coupon.id} className="border-t border-dark-500/20 hover:bg-dark-500/10 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg">{coupon.code}</span>
                    <button onClick={() => copyCode(coupon.code)} className="text-text-muted hover:text-text-primary"><Copy size={12} /></button>
                  </div>
                </td>
                <td className="p-4 text-sm font-semibold text-white">
                  {coupon.type === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`}
                </td>
                <td className="p-4 text-sm text-text-secondary">₹{coupon.minOrder || 0}</td>
                <td className="p-4 text-sm text-text-secondary">₹{coupon.maxDiscount || 0}</td>
                <td className="p-4 text-sm text-text-secondary">{coupon.validUntil || 'Lifetime'}</td>
                <td className="p-4 text-sm font-semibold text-white">{coupon.usageCount || 0}</td>
                <td className="p-4">
                  <span className={`status-badge ${coupon.status === 'active' ? 'badge-delivered' : 'badge-cancelled'}`}>{coupon.status || 'Active'}</span>
                </td>
                {user && (
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(coupon)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-purple-400 hover:bg-purple-500/10 transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(coupon.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-accent-red hover:bg-accent-red/10 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {user && showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center fade-in" onClick={resetForm}>
          <div className="glass-card-solid p-8 w-full max-w-lg slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h3>
              <button onClick={resetForm} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Coupon Code</label>
                <input type="text" placeholder="e.g. SAVE20" className="glass-input w-full text-sm uppercase"
                  value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Discount Value</label>
                  <input type="number" placeholder="20" className="glass-input w-full text-sm"
                    value={form.discount} onChange={(e) => setForm(f => ({ ...f, discount: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Type</label>
                  <select className="glass-input w-full text-sm" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Min Order ($)</label>
                  <input type="number" placeholder="100" className="glass-input w-full text-sm"
                    value={form.minOrder} onChange={(e) => setForm(f => ({ ...f, minOrder: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Max Discount ($)</label>
                  <input type="number" placeholder="50" className="glass-input w-full text-sm"
                    value={form.maxDiscount} onChange={(e) => setForm(f => ({ ...f, maxDiscount: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Valid Until</label>
                <input type="date" className="glass-input w-full text-sm"
                  value={form.validUntil} onChange={(e) => setForm(f => ({ ...f, validUntil: e.target.value }))} />
              </div>
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-50">
                {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
