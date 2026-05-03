import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, Package, Loader2, Upload, ImagePlus } from 'lucide-react';
import { subscribeToCategories, addCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { subscribeToCollection } from '../services/firestoreService';
import { uploadToCloudinary } from '../services/cloudinary';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const BLANK_FORM = { name: '', imageUrl: '' };

function SkeletonCard() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="w-full h-32 rounded-xl bg-dark-500/40 mb-4" />
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
  const [uploading, setUploading] = useState(false);

  // ── Real-time subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    const unsubCats = subscribeToCategories((data) => {
      setCategories(data);
      setLoading(false);
    });
    const unsubProducts = subscribeToCollection('products', (data) => {
      setProducts(data);
    });
    return () => { unsubCats(); unsubProducts(); };
  }, []);

  // ── Compute product count per category ─────────────────────────────────────
  const productCountMap = useMemo(() => {
    const map = {};
    products.forEach(p => {
      if (p.categoryId) {
        map[p.categoryId] = (map[p.categoryId] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  // ── Image Upload ───────────────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(f => ({ ...f, imageUrl: url }));
      toast.success('Image uploaded!');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Category name is required');
    
    // Prevent manual duplicate categories (case-insensitive check)
    if (!editingId && categories.some(c => c.name.toLowerCase() === form.name.trim().toLowerCase())) {
      return toast.error('Category already exists');
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, { name: form.name.trim(), imageUrl: form.imageUrl });
        toast.success('Category updated');
      } else {
        await addCategory({ name: form.name.trim(), imageUrl: form.imageUrl });
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
    setForm({ name: cat.name, imageUrl: cat.imageUrl || '' });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id, name, count) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?\n\nWARNING: This will also permanently delete ${count} product(s) associated with this category.`)) {
      return;
    }
    
    try {
      const deletedCount = await deleteCategory(id);
      toast.success(`"${name}" and ${deletedCount} products deleted`);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-[0.2em] font-semibold mb-2">Product Organization</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Categories</h1>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Package size={48} className="mx-auto mb-4 text-text-muted opacity-40" />
          <p className="text-text-secondary">No categories yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => {
            const count = productCountMap[cat.id] || 0;
            return (
              <div key={cat.id} className="glass-card overflow-hidden group hover:border-purple-500/30 transition-all slide-up"
                style={{ animationDelay: `${i * 60}ms` }}>
                {/* Image */}
                <div className="relative h-36 bg-dark-500 overflow-hidden">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name}
                      className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImagePlus size={40} className="text-text-muted opacity-30" />
                    </div>
                  )}
                  {user && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(cat)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-dark-800/70 backdrop-blur-sm text-text-muted hover:text-purple-400 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name, count)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-dark-800/70 backdrop-blur-sm text-text-muted hover:text-accent-red transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-1">{cat.name}</h3>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Package size={14} />
                    <span className="text-sm">{count} Products</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {user && showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center fade-in p-4" onClick={resetForm}>
          <div className="glass-card-solid p-6 md:p-8 w-full max-w-md slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{editingId ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={resetForm} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Category Image</label>
                <label className={`glass-input w-full flex flex-col items-center justify-center gap-2 cursor-pointer py-6 transition-colors
                  ${form.imageUrl ? 'border-accent-green/40' : 'hover:border-purple-500/30'} text-text-muted hover:text-text-primary`}>
                  {form.imageUrl ? (
                    <>
                      <img src={form.imageUrl} alt="preview" className="w-16 h-16 object-cover rounded-lg" />
                      <span className="text-xs text-accent-green mt-1">✓ Image Uploaded — Click to replace</span>
                    </>
                  ) : (
                    <>
                      <Upload size={24} />
                      <span className="text-sm">{uploading ? 'Uploading...' : 'Upload Category Image'}</span>
                      <span className="text-xs opacity-60">Recommended: 400 × 400px</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
              <div>
                <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Category Name</label>
                <input type="text" placeholder="e.g. Beverages" className="glass-input w-full text-sm"
                  value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
              </div>
              <button onClick={handleSave} disabled={saving || uploading}
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
