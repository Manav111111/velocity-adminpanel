import { useState, useEffect, useCallback } from 'react';
import {
  Search, Trash2, RefreshCw, Filter, SlidersHorizontal, X, Plus,
  ChevronLeft, ChevronRight, ShoppingBag, Upload, Edit2, Flame, Star, Loader2
} from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinary';
import {
  subscribeToCollectionOrdered, subscribeToCollection,
  addDocument, updateDocument, deleteDocument
} from '../services/firestoreService';
import toast from 'react-hot-toast';

const BLANK_PRODUCT = {
  name: '', category: '', description: '', price: '', discount: '0',
  stock: '', publish: true, image: '', isTrending: false, isFeatured: false
};

// ── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-t border-dark-500/20">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-dark-500/40 rounded-lg animate-pulse" style={{ width: i === 1 ? '70%' : '50%' }} />
        </td>
      ))}
    </tr>
  );
}

// ── Category Badge ────────────────────────────────────────────────────────────
function CategoryBadge({ name, categories }) {
  const cat = categories.find(c => c.name === name);
  const color = cat?.color || '#7c3aed';
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
      style={{ backgroundColor: color + '22', color }}
    >
      {name || '—'}
    </span>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // product being edited
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [newProduct, setNewProduct] = useState(BLANK_PRODUCT);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Real-time subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    const unsubProducts = subscribeToCollectionOrdered('products', 'createdAt', 'desc', (data) => {
      setProducts(data);
      setLoading(false);
    });
    const unsubCats = subscribeToCollection('categories', (data) => {
      setCategories(data);
    });
    return () => { unsubProducts(); unsubCats(); };
  }, []);

  // ── Filtering & Pagination ─────────────────────────────────────────────────
  const perPage = 10;
  const tabFiltered = products.filter(p =>
    activeTab === 'live' ? p.status !== 'draft' : p.status === 'draft'
  );
  const filtered = tabFiltered.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  // ── Image Upload ───────────────────────────────────────────────────────────
  const handleImageUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      if (isEdit) {
        setEditProduct(prev => ({ ...prev, image: url }));
      } else {
        setNewProduct(prev => ({ ...prev, image: url }));
      }
      toast.success('Image uploaded!');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ── Add Product ────────────────────────────────────────────────────────────
  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) return toast.error('Product name is required');
    if (!newProduct.price) return toast.error('Price is required');
    if (!newProduct.category) return toast.error('Please select a category');
    setSaving(true);
    try {
      await addDocument('products', {
        name: newProduct.name.trim(),
        category: newProduct.category,
        description: newProduct.description.trim(),
        price: parseFloat(newProduct.price),
        discount: parseInt(newProduct.discount) || 0,
        stock: parseInt(newProduct.stock) || 0,
        status: newProduct.publish ? 'active' : 'draft',
        image: newProduct.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop',
        isTrending: newProduct.isTrending,
        isFeatured: newProduct.isFeatured,
      });
      setShowAddPanel(false);
      setNewProduct(BLANK_PRODUCT);
      toast.success('Product added!');
    } catch (err) {
      toast.error('Failed to add product');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit Product ───────────────────────────────────────────────────────────
  const startEdit = (product) => {
    setEditProduct({ ...product });
    setShowAddPanel(false);
  };

  const handleUpdateProduct = async () => {
    if (!editProduct.name.trim()) return toast.error('Product name is required');
    if (!editProduct.price) return toast.error('Price is required');
    setSaving(true);
    try {
      await updateDocument('products', editProduct.id, {
        name: editProduct.name.trim(),
        category: editProduct.category,
        description: editProduct.description || '',
        price: parseFloat(editProduct.price),
        discount: parseInt(editProduct.discount) || 0,
        stock: parseInt(editProduct.stock) || 0,
        status: editProduct.publish !== false ? editProduct.status : 'draft',
        image: editProduct.image,
        isTrending: editProduct.isTrending || false,
        isFeatured: editProduct.isFeatured || false,
      });
      setEditProduct(null);
      toast.success('Product updated!');
    } catch (err) {
      toast.error('Failed to update product');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await deleteDocument('products', id);
      setSelectedProducts(prev => prev.filter(x => x !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const bulkDelete = async () => {
    try {
      await Promise.all(selectedProducts.map(id => deleteDocument('products', id)));
      setSelectedProducts([]);
      toast.success(`${selectedProducts.length} products deleted`);
    } catch {
      toast.error('Bulk delete failed');
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const getStockBarColor = (stock) => {
    if (stock > 500) return 'bg-purple-500';
    if (stock > 100) return 'bg-accent-amber';
    return 'bg-accent-red';
  };

  const totalItems = products.length;
  const stockValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);

  // ── Panel form shared fields renderer ─────────────────────────────────────
  const renderFormFields = (data, setData, isEdit = false) => (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Product Name</label>
        <input type="text" placeholder="e.g. Kinetic Sport Edition" className="glass-input w-full text-sm"
          value={data.name} onChange={(e) => setData(p => ({ ...p, name: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Category</label>
        <select className="glass-input w-full text-sm" value={data.category}
          onChange={(e) => setData(p => ({ ...p, category: e.target.value }))}>
          <option value="">Select category...</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Description</label>
        <textarea placeholder="Explain the product features..." className="glass-input w-full text-sm h-20 resize-none"
          value={data.description || ''} onChange={(e) => setData(p => ({ ...p, description: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Price ($)</label>
          <input type="number" placeholder="0.00" className="glass-input w-full text-sm"
            value={data.price} onChange={(e) => setData(p => ({ ...p, price: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Discount (%)</label>
          <input type="number" placeholder="0" className="glass-input w-full text-sm"
            value={data.discount} onChange={(e) => setData(p => ({ ...p, discount: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Stock Quantity</label>
        <input type="number" placeholder="Enter units" className="glass-input w-full text-sm"
          value={data.stock} onChange={(e) => setData(p => ({ ...p, stock: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Product Image</label>
        <label className="glass-input w-full text-sm flex items-center justify-center gap-2 cursor-pointer py-4 text-text-muted hover:text-text-primary hover:border-purple-500/30 transition-colors">
          <Upload size={16} />
          {uploading ? 'Uploading...' : data.image ? 'Image Uploaded ✓' : 'Upload Image'}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, isEdit)} />
        </label>
        {data.image && (
          <img src={data.image} alt="preview" className="mt-2 w-full h-24 object-cover rounded-xl opacity-80" />
        )}
      </div>
      {/* Toggles */}
      <div className="space-y-3 border-t border-dark-500/30 pt-3">
        {[
          { key: 'isTrending', label: 'Mark as Trending', desc: 'Shows in trending section', icon: '🔥' },
          { key: 'isFeatured', label: 'Mark as Featured', desc: 'Shows in featured section', icon: '⭐' },
        ].map(({ key, label, desc, icon }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{icon} {label}</p>
              <p className="text-xs text-text-muted">{desc}</p>
            </div>
            <button onClick={() => setData(p => ({ ...p, [key]: !p[key] }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${data[key] ? 'bg-purple-500' : 'bg-dark-400'}`}>
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${data[key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Publish Immediately</p>
            <p className="text-xs text-text-muted">Visible on store frontend</p>
          </div>
          <button onClick={() => setData(p => ({ ...p, publish: !p.publish, status: !p.publish ? 'active' : 'draft' }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${(data.publish !== false && data.status !== 'draft') ? 'bg-purple-500' : 'bg-dark-400'}`}>
            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${(data.publish !== false && data.status !== 'draft') ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-[0.2em] font-semibold mb-2">Catalog Management</p>
          <h1 className="text-4xl font-bold text-white">Products</h1>
        </div>
        <div className="flex items-center bg-dark-600 rounded-lg p-0.5">
          <button onClick={() => setActiveTab('live')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'live' ? 'bg-purple-500 text-white' : 'text-text-muted hover:text-text-primary'}`}>
            Live View
          </button>
          <button onClick={() => setActiveTab('drafts')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'drafts' ? 'bg-purple-500 text-white' : 'text-text-muted hover:text-text-primary'}`}>
            Drafts
          </button>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Main Table */}
        <div className="flex-1 space-y-4">
          {/* Toolbar */}
          <div className="glass-card p-4 flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input type="checkbox" className="accent-purple-500 w-4 h-4"
                checked={selectedProducts.length === paginated.length && paginated.length > 0}
                onChange={(e) => setSelectedProducts(e.target.checked ? paginated.map(p => p.id) : [])} />
              Select All ({filtered.length})
            </label>
            {selectedProducts.length > 0 && (
              <button onClick={bulkDelete} className="flex items-center gap-2 bg-accent-red/10 text-accent-red px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-red/20 transition-colors">
                <Trash2 size={14} /> Bulk Delete ({selectedProducts.length})
              </button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="glass-input pl-9 py-2 text-sm w-48" />
              </div>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-glass-border text-text-muted hover:text-text-primary hover:border-purple-500/30 transition-colors">
                <Filter size={14} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] text-text-muted uppercase tracking-widest border-b border-dark-500/30">
                  <th className="text-left p-4 font-semibold w-8"></th>
                  <th className="text-left p-4 font-semibold">Product Info</th>
                  <th className="text-left p-4 font-semibold">Category</th>
                  <th className="text-left p-4 font-semibold">Price</th>
                  <th className="text-left p-4 font-semibold">Stock</th>
                  <th className="text-left p-4 font-semibold">Flags</th>
                  <th className="text-left p-4 font-semibold w-16">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-text-muted">
                      <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                      <p>No products found. Add your first product!</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((product) => (
                    <tr key={product.id} className="border-t border-dark-500/20 hover:bg-dark-500/10 transition-colors group">
                      <td className="p-4">
                        <input type="checkbox" className="accent-purple-500 w-4 h-4"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleSelect(product.id)} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop'}
                            alt={product.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <p className="text-sm font-semibold text-white">{product.name}</p>
                            <p className="text-xs text-text-muted">ID: #{product.id?.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <CategoryBadge name={product.category} categories={categories} />
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-semibold text-white">${parseFloat(product.price || 0).toFixed(2)}</p>
                        {product.discount > 0 && (
                          <p className="text-xs text-accent-red">-{product.discount}% OFF</p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${product.stock < 20 ? 'text-accent-red' : 'text-white'}`}>
                            {(product.stock || 0).toLocaleString()}
                          </span>
                          <div className="w-16 h-1.5 bg-dark-500 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${getStockBarColor(product.stock)}`}
                              style={{ width: `${Math.min((product.stock / 1500) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {product.isTrending && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-orange-400">
                              <Flame size={10} /> Trending
                            </span>
                          )}
                          {product.isFeatured && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/15 text-yellow-400">
                              <Star size={10} /> Featured
                            </span>
                          )}
                          {!product.isTrending && !product.isFeatured && (
                            <span className="text-text-muted text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => startEdit(product)}
                            className="text-text-muted hover:text-purple-400 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(product.id)}
                            className="text-text-muted hover:text-accent-red transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="p-4 border-t border-dark-500/30 flex items-center justify-between">
              <p className="text-xs text-text-muted uppercase tracking-wider">
                {filtered.length === 0 ? 'No products' : `Showing ${(currentPage - 1) * perPage + 1}–${Math.min(currentPage * perPage, filtered.length)} of ${filtered.length}`}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-dark-500/30 disabled:opacity-30 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors
                      ${currentPage === page ? 'bg-purple-500 text-white' : 'text-text-muted hover:text-text-primary hover:bg-dark-500/30'}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-dark-500/30 disabled:opacity-30 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Product Panel */}
        {showAddPanel && (
          <div className="w-80 glass-card-solid p-6 slide-in-right self-start sticky top-20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Add New Product</h3>
              <button onClick={() => setShowAddPanel(false)} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>
            {renderFormFields(newProduct, setNewProduct, false)}
            <button onClick={handleAddProduct} disabled={saving || uploading}
              className="btn-primary w-full justify-center py-3.5 text-sm mt-4 rounded-2xl disabled:opacity-60">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {saving ? 'Saving...' : 'INITIALIZE PRODUCT'}
            </button>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center fade-in" onClick={() => setEditProduct(null)}>
          <div className="glass-card-solid p-8 w-full max-w-md slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Product</h3>
              <button onClick={() => setEditProduct(null)} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>
            {renderFormFields(editProduct, setEditProduct, true)}
            <button onClick={handleUpdateProduct} disabled={saving || uploading}
              className="btn-primary w-full justify-center py-3 mt-4 disabled:opacity-60">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Edit2 size={18} />}
              {saving ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="glass-card p-5 text-center">
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Total Items</p>
          <p className="text-3xl font-bold text-white">{totalItems.toLocaleString()}</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Stock Value</p>
          <p className="text-3xl font-bold text-white">${(stockValue / 1000).toFixed(0)}k</p>
        </div>
      </div>

      {/* Floating Add Button */}
      {!showAddPanel && !editProduct && (
        <button onClick={() => setShowAddPanel(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 hover:scale-110 transition-transform z-50">
          <ShoppingBag size={22} />
        </button>
      )}
    </div>
  );
}
