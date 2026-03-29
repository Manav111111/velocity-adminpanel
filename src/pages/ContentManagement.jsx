import { useState, useEffect } from 'react';
import {
  LayoutPanelTop, ImagePlus, Upload, Trash2, X, Loader2,
  Flame, Star, ToggleLeft, ToggleRight, Plus, Eye, EyeOff
} from 'lucide-react';
import {
  subscribeToCollection, subscribeToCollectionOrdered,
  addDocument, updateDocument, deleteDocument
} from '../services/firestoreService';
import { uploadToCloudinary } from '../services/cloudinary';
import toast from 'react-hot-toast';

// ── Banner Skeleton ───────────────────────────────────────────────────────────
function BannerSkeleton() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="h-40 bg-dark-500/40" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-2/3 bg-dark-500/40 rounded" />
        <div className="h-3 w-1/2 bg-dark-500/30 rounded" />
      </div>
    </div>
  );
}

// ── Home Config Skeleton ──────────────────────────────────────────────────────
function ProductRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-dark-500/20 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-dark-500/40" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-dark-500/40 rounded" />
        <div className="h-3 w-1/4 bg-dark-500/30 rounded" />
      </div>
      <div className="flex gap-6">
        <div className="h-6 w-20 bg-dark-500/30 rounded-full" />
        <div className="h-6 w-20 bg-dark-500/30 rounded-full" />
      </div>
    </div>
  );
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, color = 'bg-purple-500' }) {
  return (
    <button onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? color : 'bg-dark-400'}`}>
      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 – Banner Management
// ══════════════════════════════════════════════════════════════════════════════
function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', imageUrl: '', isActive: true });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeToCollectionOrdered('banners', 'createdAt', 'desc', (data) => {
      setBanners(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(f => ({ ...f, imageUrl: url }));
      toast.success('Banner image uploaded!');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Banner title is required');
    if (!form.imageUrl) return toast.error('Please upload a banner image');
    setSaving(true);
    try {
      await addDocument('banners', {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        imageUrl: form.imageUrl,
        isActive: form.isActive,
      });
      setForm({ title: '', subtitle: '', imageUrl: '', isActive: true });
      setShowForm(false);
      toast.success('Banner created!');
    } catch (err) {
      toast.error('Failed to create banner');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id, current) => {
    try {
      await updateDocument('banners', id, { isActive: !current });
      toast.success(current ? 'Banner deactivated' : 'Banner activated');
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument('banners', id);
      toast.success('Banner deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Banner Management</h2>
          <p className="text-text-secondary text-sm mt-1">Control home screen banners visible to app users.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} /> Add Banner
        </button>
      </div>

      {/* Banner Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <BannerSkeleton key={i} />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <ImagePlus size={48} className="mx-auto mb-4 text-text-muted opacity-40" />
          <p className="text-text-secondary">No banners yet. Add your first banner!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {banners.map((banner, i) => (
            <div key={banner.id} className="glass-card overflow-hidden group hover:border-purple-500/30 transition-all slide-up"
              style={{ animationDelay: `${i * 60}ms` }}>
              {/* Image */}
              <div className="relative h-40 overflow-hidden bg-dark-500">
                <img src={banner.imageUrl} alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {/* Active Badge */}
                <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm
                  ${banner.isActive ? 'bg-accent-green/20 text-accent-green' : 'bg-dark-600/60 text-text-muted'}`}>
                  {banner.isActive ? <Eye size={10} /> : <EyeOff size={10} />}
                  {banner.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-white truncate">{banner.title}</h4>
                {banner.subtitle && (
                  <p className="text-xs text-text-muted mt-0.5 truncate">{banner.subtitle}</p>
                )}
                <p className="text-[10px] text-text-muted mt-1 opacity-60">
                  {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : ''}
                </p>
                {/* Actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-500/30">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    {banner.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    <Toggle
                      checked={banner.isActive}
                      onChange={() => handleToggleActive(banner.id, banner.isActive)}
                      color="bg-accent-green"
                    />
                  </div>
                  <button onClick={() => handleDelete(banner.id)}
                    className="text-text-muted hover:text-accent-red transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Banner Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center fade-in"
          onClick={() => setShowForm(false)}>
          <div className="glass-card-solid p-8 w-full max-w-lg slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Add New Banner</h3>
              <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Banner Image</label>
                <label className={`glass-input w-full flex flex-col items-center justify-center gap-2 cursor-pointer py-8 transition-colors
                  ${form.imageUrl ? 'border-accent-green/40' : 'hover:border-purple-500/30'} text-text-muted hover:text-text-primary`}>
                  {form.imageUrl ? (
                    <>
                      <img src={form.imageUrl} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                      <span className="text-xs text-accent-green mt-1">✓ Image Uploaded — Click to replace</span>
                    </>
                  ) : (
                    <>
                      <Upload size={24} />
                      <span className="text-sm">{uploading ? 'Uploading...' : 'Upload Banner Image'}</span>
                      <span className="text-xs opacity-60">Recommended: 1200 × 400px</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
              <div>
                <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Banner Title</label>
                <input type="text" placeholder="e.g. Flash Sale – Up to 50% Off" className="glass-input w-full text-sm"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Subtitle (Optional)</label>
                <input type="text" placeholder="e.g. Limited time offer on premium products" className="glass-input w-full text-sm"
                  value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-dark-500/20 border border-dark-500/30">
                <div>
                  <p className="text-sm font-semibold text-white">Activate Immediately</p>
                  <p className="text-xs text-text-muted">Banner will be visible in the app</p>
                </div>
                <Toggle checked={form.isActive} onChange={() => setForm(f => ({ ...f, isActive: !f.isActive }))} color="bg-accent-green" />
              </div>
              <button onClick={handleSave} disabled={saving || uploading}
                className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Plus size={16} /> Create Banner</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 – Home Configuration
// ══════════════════════════════════════════════════════════════════════════════
function HomeConfiguration() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({}); // { [productId]: 'trending'|'featured'|null }
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = subscribeToCollectionOrdered('products', 'createdAt', 'desc', (data) => {
      setProducts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleToggle = async (product, field) => {
    setUpdating(prev => ({ ...prev, [product.id]: field }));
    try {
      const newVal = !product[field];
      await updateDocument('products', product.id, { [field]: newVal });
      toast.success(`${field === 'isTrending' ? '🔥 Trending' : '⭐ Featured'} ${newVal ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(prev => ({ ...prev, [product.id]: null }));
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const trendingCount = products.filter(p => p.isTrending).length;
  const featuredCount = products.filter(p => p.isFeatured).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Home Configuration</h2>
        <p className="text-text-secondary text-sm mt-1">Control which products appear in trending and featured sections.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">🔥 Trending</p>
          <p className="text-2xl font-bold text-orange-400">{trendingCount}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">⭐ Featured</p>
          <p className="text-2xl font-bold text-yellow-400">{featuredCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-3">
        <input type="text" placeholder="Search products..." className="glass-input w-full text-sm"
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>

      {/* Product List */}
      <div className="glass-card overflow-hidden">
        {/* Header Row */}
        <div className="hidden md:grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 border-b border-dark-500/30">
          <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">Product</p>
          <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold w-28 text-center">🔥 Trending</p>
          <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold w-28 text-center">⭐ Featured</p>
        </div>

        {loading ? (
          [...Array(6)].map((_, i) => <ProductRowSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <p>No products found.</p>
          </div>
        ) : (
          filtered.map((product) => (
            <div key={product.id} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center p-4 border-b border-dark-500/20 hover:bg-dark-500/10 transition-colors">
              {/* Product Info */}
              <div className="flex items-center gap-3 min-w-0">
                <img src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop'}
                  alt={product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                  <p className="text-xs text-text-muted">{product.category} · ${parseFloat(product.price || 0).toFixed(2)}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {product.isTrending && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-orange-400">
                        <Flame size={8} /> Trending
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/15 text-yellow-400">
                        <Star size={8} /> Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Trending Toggle */}
              <div className="w-28 flex items-center justify-center">
                {updating[product.id] === 'isTrending' ? (
                  <Loader2 size={18} className="animate-spin text-text-muted" />
                ) : (
                  <Toggle
                    checked={product.isTrending || false}
                    onChange={() => handleToggle(product, 'isTrending')}
                    color="bg-orange-500"
                  />
                )}
              </div>

              {/* Featured Toggle */}
              <div className="w-28 flex items-center justify-center">
                {updating[product.id] === 'isFeatured' ? (
                  <Loader2 size={18} className="animate-spin text-text-muted" />
                ) : (
                  <Toggle
                    checked={product.isFeatured || false}
                    onChange={() => handleToggle(product, 'isFeatured')}
                    color="bg-yellow-500"
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState('banners');

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-[0.2em] font-semibold mb-2">App Management</p>
          <h1 className="text-4xl font-bold text-white">Content Management</h1>
          <p className="text-text-secondary mt-1">Control what users see on the home screen of the app.</p>
        </div>
        {/* Tab Switcher */}
        <div className="flex items-center bg-dark-600 rounded-lg p-0.5">
          <button onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all
              ${activeTab === 'banners' ? 'bg-purple-500 text-white' : 'text-text-muted hover:text-text-primary'}`}>
            <ImagePlus size={15} /> Banners
          </button>
          <button onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all
              ${activeTab === 'home' ? 'bg-purple-500 text-white' : 'text-text-muted hover:text-text-primary'}`}>
            <LayoutPanelTop size={15} /> Home Config
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="slide-up">
        {activeTab === 'banners' ? <BannerManagement /> : <HomeConfiguration />}
      </div>
    </div>
  );
}
