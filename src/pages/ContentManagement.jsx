import { useState, useEffect } from 'react';
import { LayoutPanelTop, ImagePlus, Upload, Trash2, X, Loader2, Flame, Star, Plus, Eye, EyeOff, Edit2, GripVertical } from 'lucide-react';
import { subscribeToBanners, addBanner, updateBanner, deleteBanner } from '../services/bannerService';
import { subscribeToProducts } from '../services/productService';
import { updateDocument, subscribeToCollection } from '../services/firestoreService';
import { uploadToCloudinary } from '../services/cloudinary';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function Toggle({ checked, onChange, color='bg-purple-500' }) {
  return (<button onClick={onChange} className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked?color:'bg-dark-400'}`}><div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${checked?'translate-x-6':'translate-x-0.5'}`}/></button>);
}

// ══════════════════════════════════════════════════════════════════════════════
// Banner Management
// ══════════════════════════════════════════════════════════════════════════════
function BannerManagement({ user }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title:'', subtitle:'', imageUrl:'', isActive:true, priority:0 });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeToBanners(d => { setBanners(d); setLoading(false); });
    return unsub;
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadToCloudinary(file); setForm(f=>({...f,imageUrl:url})); toast.success('Uploaded!'); }
    catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title required');
    if (!form.imageUrl) return toast.error('Upload an image');
    setSaving(true);
    try {
      if (editingId) {
        await updateBanner(editingId, form);
        toast.success('Banner updated!');
      } else {
        await addBanner(form);
        toast.success('Banner created!');
      }
      resetForm();
    } catch(e) { toast.error('Failed'); console.error(e); }
    finally { setSaving(false); }
  };

  const handleEdit = (b) => {
    setForm({ title:b.title, subtitle:b.subtitle||'', imageUrl:b.imageUrl, isActive:b.isActive, priority:b.priority||0 });
    setEditingId(b.id);
    setShowForm(true);
  };

  const handleToggle = async (id, current) => {
    try { await updateBanner(id, { ...banners.find(b=>b.id===id), isActive:!current }); toast.success(current?'Deactivated':'Activated'); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    try { await deleteBanner(id); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const resetForm = () => { setForm({ title:'', subtitle:'', imageUrl:'', isActive:true, priority:0 }); setEditingId(null); setShowForm(false); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-white">Banner Management</h2><p className="text-text-secondary text-sm mt-1">Sorted by priority (lowest number = highest priority)</p></div>
        {user && <button onClick={()=>{resetForm();setShowForm(true);}} className="btn-primary"><Plus size={18}/> Add Banner</button>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_,i)=><div key={i} className="glass-card overflow-hidden animate-pulse"><div className="h-40 bg-dark-500/40"/><div className="p-4 space-y-2"><div className="h-4 w-2/3 bg-dark-500/40 rounded"/><div className="h-3 w-1/2 bg-dark-500/30 rounded"/></div></div>)}</div>
      ) : banners.length===0 ? (
        <div className="glass-card p-16 text-center"><ImagePlus size={48} className="mx-auto mb-4 text-text-muted opacity-40"/><p className="text-text-secondary">No banners yet</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b,i)=>(
            <div key={b.id} className="glass-card overflow-hidden group hover:border-purple-500/30 transition-all slide-up" style={{animationDelay:`${i*60}ms`}}>
              <div className="relative h-40 overflow-hidden bg-dark-500">
                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${b.isActive?'bg-accent-green/20 text-accent-green':'bg-dark-600/60 text-text-muted'}`}>
                  {b.isActive?<Eye size={10}/>:<EyeOff size={10}/>} {b.isActive?'Active':'Inactive'}
                </div>
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold bg-dark-800/70 backdrop-blur-sm text-purple-400">
                  Priority: {b.priority||0}
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-sm font-semibold text-white truncate">{b.title}</h4>
                {b.subtitle && <p className="text-xs text-text-muted mt-0.5 truncate">{b.subtitle}</p>}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-500/30">
                  <div className="flex items-center gap-2">
                    {user ? <Toggle checked={b.isActive} onChange={()=>handleToggle(b.id,b.isActive)} color="bg-accent-green"/> : <span className={`text-xs font-semibold ${b.isActive?'text-accent-green':'text-text-muted'}`}>{b.isActive?'Active':'Off'}</span>}
                  </div>
                  {user && <div className="flex items-center gap-1">
                    <button onClick={()=>handleEdit(b)} className="text-text-muted hover:text-purple-400 transition-colors"><Edit2 size={14}/></button>
                    <button onClick={()=>handleDelete(b.id)} className="text-text-muted hover:text-accent-red transition-colors"><Trash2 size={14}/></button>
                  </div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {user && showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center fade-in p-4" onClick={resetForm}>
          <div className="glass-card-solid p-6 md:p-8 w-full max-w-lg slide-up" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{editingId?'Edit Banner':'Add Banner'}</h3>
              <button onClick={resetForm} className="text-text-muted hover:text-text-primary"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Banner Image</label>
                <label className={`glass-input w-full flex flex-col items-center justify-center gap-2 cursor-pointer py-8 transition-colors ${form.imageUrl?'border-accent-green/40':'hover:border-purple-500/30'} text-text-muted hover:text-text-primary`}>
                  {form.imageUrl ? (<><img src={form.imageUrl} alt="preview" className="w-full h-32 object-cover rounded-lg"/><span className="text-xs text-accent-green mt-1">✓ Uploaded — Click to replace</span></>) : (<><Upload size={24}/><span className="text-sm">{uploading?'Uploading...':'Upload Image'}</span><span className="text-xs opacity-60">1200 × 400px recommended</span></>)}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading}/>
                </label>
              </div>
              <div><label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Title</label>
                <input type="text" placeholder="e.g. Flash Sale" className="glass-input w-full text-sm" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
              <div><label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Subtitle</label>
                <input type="text" placeholder="Optional subtitle" className="glass-input w-full text-sm" value={form.subtitle} onChange={e=>setForm(f=>({...f,subtitle:e.target.value}))}/></div>
              <div><label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Priority (lower = higher)</label>
                <input type="number" placeholder="0" className="glass-input w-full text-sm" value={form.priority} onChange={e=>setForm(f=>({...f,priority:parseInt(e.target.value)||0}))}/></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-dark-500/20 border border-dark-500/30">
                <div><p className="text-sm font-semibold text-white">Active</p><p className="text-xs text-text-muted">Visible in app</p></div>
                <Toggle checked={form.isActive} onChange={()=>setForm(f=>({...f,isActive:!f.isActive}))} color="bg-accent-green"/>
              </div>
              <button onClick={handleSave} disabled={saving||uploading} className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60">
                {saving ? <><Loader2 size={16} className="animate-spin"/> Saving...</> : editingId ? 'Update Banner' : <><Plus size={16}/> Create Banner</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Home Configuration (Trending/Featured toggles)
// ══════════════════════════════════════════════════════════════════════════════
function HomeConfiguration({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const u1 = subscribeToProducts(d => { setProducts(d); setLoading(false); });
    const u2 = subscribeToCollection('categories', d => setCategories(d));
    return () => { u1(); u2(); };
  }, []);

  const catMap = {};
  categories.forEach(c => catMap[c.id] = c.name);

  const handleToggle = async (product, field) => {
    setUpdating(p => ({ ...p, [product.id]: field }));
    try {
      await updateDocument('products', product.id, { [field]: !product[field] });
      toast.success(`${field==='isTrending'?'🔥 Trending':'⭐ Featured'} ${!product[field]?'enabled':'disabled'}`);
    } catch { toast.error('Failed'); }
    finally { setUpdating(p => ({ ...p, [product.id]: null })); }
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
  const trendCount = products.filter(p=>p.isTrending).length;
  const featCount = products.filter(p=>p.isFeatured).length;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-white">Home Configuration</h2><p className="text-text-secondary text-sm mt-1">Control trending and featured sections</p></div>
      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <div className="glass-card p-4 text-center"><p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">🔥 Trending</p><p className="text-2xl font-bold text-orange-400">{trendCount}</p></div>
        <div className="glass-card p-4 text-center"><p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">⭐ Featured</p><p className="text-2xl font-bold text-yellow-400">{featCount}</p></div>
      </div>
      <div className="glass-card p-3"><input type="text" placeholder="Search products..." className="glass-input w-full text-sm" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <div className="glass-card overflow-x-auto">
        <div className="hidden md:grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 border-b border-dark-500/30 min-w-[500px]">
          <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">Product</p>
          <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold w-28 text-center">🔥 Trending</p>
          <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold w-28 text-center">⭐ Featured</p>
        </div>
        {loading ? [...Array(6)].map((_,i)=><div key={i} className="flex items-center gap-4 p-4 border-b border-dark-500/20 animate-pulse"><div className="w-12 h-12 rounded-xl bg-dark-500/40"/><div className="flex-1 space-y-2"><div className="h-4 w-1/3 bg-dark-500/40 rounded"/></div></div>) : filtered.length===0 ? (
          <div className="p-12 text-center text-text-muted">No products found</div>
        ) : filtered.map(p=>(
          <div key={p.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-center p-4 border-b border-dark-500/20 hover:bg-dark-500/10 transition-colors min-w-[500px]">
            <div className="flex items-center gap-3 min-w-0">
              <img src={(p.images||[])[0]||'https://placehold.co/48x48/1a2040/64748b?text=?'} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0"/>
              <div className="min-w-0"><p className="text-sm font-semibold text-white truncate">{p.name}</p><p className="text-xs text-text-muted">{catMap[p.categoryId]||'—'} · ₹{parseFloat(p.price||0).toFixed(2)}</p></div>
            </div>
            <div className="w-28 flex items-center justify-center">
              {user ? updating[p.id]==='isTrending' ? <Loader2 size={18} className="animate-spin text-text-muted"/> : <Toggle checked={p.isTrending||false} onChange={()=>handleToggle(p,'isTrending')} color="bg-orange-500"/> : <span className={`text-xs font-semibold ${p.isTrending?'text-orange-400':'text-text-muted'}`}>{p.isTrending?'Yes':'No'}</span>}
            </div>
            <div className="w-28 flex items-center justify-center">
              {user ? updating[p.id]==='isFeatured' ? <Loader2 size={18} className="animate-spin text-text-muted"/> : <Toggle checked={p.isFeatured||false} onChange={()=>handleToggle(p,'isFeatured')} color="bg-yellow-500"/> : <span className={`text-xs font-semibold ${p.isFeatured?'text-yellow-400':'text-text-muted'}`}>{p.isFeatured?'Yes':'No'}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════════════════════
export default function ContentManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('banners');

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-[0.2em] font-semibold mb-2">App Management</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Content Management</h1>
          <p className="text-text-secondary mt-1">Control what users see on the home screen</p>
        </div>
        <div className="flex items-center bg-dark-600 rounded-lg p-0.5">
          <button onClick={()=>setActiveTab('banners')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab==='banners'?'bg-purple-500 text-white':'text-text-muted hover:text-text-primary'}`}><ImagePlus size={15}/> Banners</button>
          <button onClick={()=>setActiveTab('home')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab==='home'?'bg-purple-500 text-white':'text-text-muted hover:text-text-primary'}`}><LayoutPanelTop size={15}/> Home Config</button>
        </div>
      </div>
      <div className="slide-up">{activeTab==='banners' ? <BannerManagement user={user}/> : <HomeConfiguration user={user}/>}</div>
    </div>
  );
}
