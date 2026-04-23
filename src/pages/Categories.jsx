import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, Package, Loader2 } from 'lucide-react';
import {
  subscribeToCollection, subscribeToCollectionOrdered,
  addDocument, updateDocument, deleteDocument
} from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const colorOptions = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444', '#8b5cf6'];
const BLANK_FORM = { name: '', icon: '📦', color: '#7c3aed' };

function SkeletonCard() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="w-14 h-14 rounded-2xl bg-dark-500/40 mb-4" />
      <div className="h-4 w-2/3 bg-dark-500/40 rounded mb-2" />
      <div className="h-3 w-1/2 bg-dark-500/30 rounded" />
    </div>
  );
}

export default function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);

  // ── Real-time subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    // Use unordered subscription so categories without createdAt field are still returned
    const unsubCats = subscribeToCollection('categories', (data) => {
      setCategories(data);
      setLoading(false);
    });
    const unsubProducts = subscribeToCollection('products', (data) => {
      setProducts(data);
    });
    return () => { unsubCats(); unsubProducts(); };
  }, []);

  // ── Compute product count per category dynamically (case-insensitive) ───────
  const productCountMap = useMemo(() => {
    const map = {};
    products.forEach(p => {
      if (p.category) {
        const key = p.category.toLowerCase().trim();
        map[key] = (map[key] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      if (editingId) {
        await updateDocument('categories', editingId, { name: form.name.trim(), icon: form.icon, color: form.color });
        toast.success('Category updated');
      } else {
        await addDocument('categories', { name: form.name.trim(), icon: form.icon, color: form.color });
        toast.success('Category created');
      }
      resetForm();
    } catch (err) {
      toast.error('Operation failed');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    try {
      await deleteDocument('categories', id);
      toast.success(`"${name}" deleted`);
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const resetForm = () => {
    setForm(BLANK_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-[0.2em] font-semibold mb-2">Product Organization</p>
          <h1 className="text-4xl font-bold text-white">Categories</h1>
          <p className="text-text-secondary mt-1">Organize your product catalog into meaningful groups.</p>
        </div>
        {user && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
            <Plus size={18} /> Add Category
          </button>
        )}
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Package size={48} className="mx-auto mb-4 text-text-muted opacity-40" />
          <p className="text-text-secondary">No categories yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {categories.map((cat, i) => {
            const count = productCountMap[cat.name.toLowerCase().trim()] || 0;
            const maxCount = Math.max(...Object.values(productCountMap), 1);
            return (
              <div key={cat.id} className="glass-card p-6 group hover:border-purple-500/30 transition-all slide-up"
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: cat.color + '20' }}>
                    {cat.icon}
                  </div>
                  {user && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(cat)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-purple-400 hover:bg-purple-500/10 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-accent-red hover:bg-accent-red/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{cat.name}</h3>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Package size={14} />
                  <span className="text-sm">{count} Products</span>
                </div>
                <div className="mt-3 w-full h-1 rounded-full bg-dark-400 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((count / maxCount) * 100, 100)}%`, backgroundColor: cat.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {user && showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center fade-in" onClick={resetForm}>
          <div className="glass-card-solid p-8 w-full max-w-md slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{editingId ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={resetForm} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Category Name</label>
                <input type="text" placeholder="e.g. Beverages" className="glass-input w-full text-sm"
                  value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
              </div>
              <div>
                <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Icon (Emoji)</label>
                <input type="text" placeholder="📦" className="glass-input w-full text-sm"
                  value={form.icon} onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-2 block">Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {colorOptions.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`w-8 h-8 rounded-lg transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
                {/* Preview */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: form.color + '20' }}>
                    {form.icon}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: form.color }}>
                    {form.name || 'Category Name'}
                  </span>
                </div>
              </div>
              <button onClick={handleSave} disabled={saving}
                className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60">
                {saving
                  ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  : editingId ? 'Update Category' : 'Create Category'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
