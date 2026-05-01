import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Trash2, Filter, X, Plus, ChevronLeft, ChevronRight, ShoppingBag, Upload, Edit2, Flame, Star, Loader2, FileSpreadsheet, Eye, AlertTriangle } from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinary';
import { subscribeToProducts, addProduct, updateProduct, deleteProduct, bulkUpsertProducts } from '../services/productService';
import { subscribeToCategories, addCategory } from '../services/categoryService';
import { deleteDocument } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const BLANK = { name:'', sku:'', categoryId:'', description:'', price:'', discount:'0', stock:'', isActive:true, images:[], isTrending:false, isFeatured:false };

function Toggle({ checked, onChange, color='bg-purple-500' }) {
  return (<button onClick={onChange} className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? color : 'bg-dark-400'}`}><div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`}/></button>);
}

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkData, setBulkData] = useState([]);
  const [bulkFile, setBulkFile] = useState(null);
  const fileRef = useRef(null);
  const csvRef = useRef(null);

  useEffect(() => {
    const u1 = subscribeToProducts(d => { setProducts(d); setLoading(false); });
    const u2 = subscribeToCategories(d => setCategories(d));
    return () => { u1(); u2(); };
  }, []);

  const catMap = useMemo(() => { const m={}; categories.forEach(c => m[c.id]=c); return m; }, [categories]);

  const perPage = 10;
  const filtered = useMemo(() => products.filter(p => {
    const s = search.toLowerCase();
    if (s && !p.name?.toLowerCase().includes(s)) return false;
    if (catFilter !== 'all' && p.categoryId !== catFilter) return false;
    if (statusFilter === 'active' && !p.isActive) return false;
    if (statusFilter === 'inactive' && p.isActive !== false) return false;
    if (statusFilter === 'featured' && !p.isFeatured) return false;
    if (statusFilter === 'trending' && !p.isTrending) return false;
    return true;
  }), [products, search, catFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page-1)*perPage, page*perPage);

  const handleImg = async (e, isEdit=false) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      const setter = isEdit ? setEditProd : setForm;
      setter(p => ({ ...p, images: [...(p.images||[]), url] }));
      toast.success('Image uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const removeImg = (idx, isEdit=false) => {
    const setter = isEdit ? setEditProd : setForm;
    setter(p => ({ ...p, images: (p.images||[]).filter((_,i)=>i!==idx) }));
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return toast.error('Name required');
    if (!form.price) return toast.error('Price required');
    if (!form.categoryId) return toast.error('Select category');
    setSaving(true);
    try {
      await addProduct(form);
      setShowAdd(false); setForm(BLANK);
      toast.success('Product added!');
    } catch(e) { toast.error('Failed'); console.error(e); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!editProd.name.trim()) return toast.error('Name required');
    setSaving(true);
    try {
      await updateProduct(editProd.id, editProd);
      setEditProd(null);
      toast.success('Updated!');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const handleDel = async id => {
    try { await deleteProduct(id); setSelected(p=>p.filter(x=>x!==id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const bulkDel = async () => {
    try { await Promise.all(selected.map(id=>deleteDocument('products',id))); setSelected([]); toast.success(`${selected.length} deleted`); }
    catch { toast.error('Failed'); }
  };

  // ── Bulk Upload Parse ──────────────────────────────────────────────────────
  const parseBulkFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBulkFile(file.name);
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (r) => { setBulkData(r.data); setShowBulk(true); },
        error: () => toast.error('CSV parse failed')
      });
    } else if (['xlsx','xls'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const wb = XLSX.read(ev.target.result, { type:'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(ws);
          setBulkData(data); setShowBulk(true);
        } catch { toast.error('Excel parse failed'); }
      };
      reader.readAsArrayBuffer(file);
    } else { toast.error('Only CSV/XLSX supported'); }
    if (csvRef.current) csvRef.current.value = '';
  };

  const executeBulk = async () => {
    if (!bulkData.length) return;
    setSaving(true); toast.loading('Uploading...', { id:'bulk' });
    try {
      const catLookup = {}; categories.forEach(c => catLookup[c.name.toLowerCase().trim()] = c.id);
      const skuMap = {}; products.forEach(p => { if (p.sku) skuMap[p.sku] = p.id; });
      const items = [];
      for (const row of bulkData) {
        const name = String(row.name||'').trim();
        const price = parseFloat(row.price) || 0;
        if (!name || price <= 0) continue;
        
        // Auto-generate SKU if missing: "Milk 500ml" -> "MILK-500ML"
        let sku = String(row.sku||'').trim().toUpperCase();
        if (!sku) sku = name.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
        
        let catName = String(row.category||'').trim();
        let categoryId = catLookup[catName.toLowerCase()] || '';
        if (catName && !categoryId) {
          const catImg = String(row.categoryImage||'').trim();
          const newId = await addCategory({ name: catName, imageUrl: catImg });
          catLookup[catName.toLowerCase()] = newId; categoryId = newId;
        }
        
        const data = {
          name, sku, price, categoryId,
          discount: parseInt(row.discount)||0,
          stock: parseInt(row.stock)||0,
          images: row.image ? [String(row.image)] : [],
          isFeatured: String(row.isFeatured||'').toLowerCase()==='true',
          isTrending: String(row.isTrending||'').toLowerCase()==='true',
          isActive: String(row.isActive||'true').toLowerCase()!=='false',
        };
        
        items.push({ id: skuMap[sku] || null, data });
      }
      const count = await bulkUpsertProducts(items);
      toast.success(`Upserted ${count} products`, { id:'bulk' });
      setShowBulk(false); setBulkData([]);
    } catch(e) { toast.error(e.message||'Bulk failed', { id:'bulk' }); }
    finally { setSaving(false); }
  };

  const stockColor = s => s > 500 ? 'bg-purple-500' : s > 100 ? 'bg-accent-amber' : 'bg-accent-red';

  const renderForm = (data, setData, isEdit=false) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Product Name</label>
          <input type="text" placeholder="e.g. Fresh Apples" className="glass-input w-full text-sm" value={data.name} onChange={e=>setData(p=>({...p,name:e.target.value}))} /></div>
        <div><label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">SKU</label>
          <input type="text" placeholder="e.g. APPLES-1KG" className="glass-input w-full text-sm uppercase" value={data.sku} onChange={e=>setData(p=>({...p,sku:e.target.value.toUpperCase()}))} /></div>
      </div>
      <div><label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Category</label>
        <select className="glass-input w-full text-sm" value={data.categoryId} onChange={e=>setData(p=>({...p,categoryId:e.target.value}))}>
          <option value="">Select category...</option>
          {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select></div>
      <div><label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Description</label>
        <textarea placeholder="Product details..." className="glass-input w-full text-sm h-20 resize-none" value={data.description||''} onChange={e=>setData(p=>({...p,description:e.target.value}))} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Price (₹)</label>
          <input type="number" placeholder="0" className="glass-input w-full text-sm" value={data.price} onChange={e=>setData(p=>({...p,price:e.target.value}))} /></div>
        <div><label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Discount (%)</label>
          <input type="number" placeholder="0" className="glass-input w-full text-sm" value={data.discount} onChange={e=>setData(p=>({...p,discount:e.target.value}))} /></div>
      </div>
      <div><label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Stock</label>
        <input type="number" placeholder="0" className="glass-input w-full text-sm" value={data.stock} onChange={e=>setData(p=>({...p,stock:e.target.value}))} /></div>
      <div><label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Images</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(data.images||[]).map((url,i)=>(
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
              <img src={url} alt="" className="w-full h-full object-cover"/>
              <button onClick={()=>removeImg(i,isEdit)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={14} className="text-white"/></button>
            </div>
          ))}
        </div>
        <label className="glass-input w-full text-sm flex items-center justify-center gap-2 cursor-pointer py-3 text-text-muted hover:text-text-primary hover:border-purple-500/30 transition-colors">
          <Upload size={16}/> {uploading ? 'Uploading...' : 'Add Image'}
          <input type="file" accept="image/*" className="hidden" onChange={e=>handleImg(e,isEdit)}/>
        </label>
      </div>
      <div className="space-y-3 border-t border-dark-500/30 pt-3">
        {[{key:'isTrending',label:'Trending',desc:'Shows in trending',icon:'🔥',color:'bg-orange-500'},
          {key:'isFeatured',label:'Featured',desc:'Shows in featured',icon:'⭐',color:'bg-yellow-500'},
          {key:'isActive',label:'Active',desc:'Visible in store',icon:'✅',color:'bg-accent-green'}
        ].map(({key,label,desc,icon,color})=>(
          <div key={key} className="flex items-center justify-between">
            <div><p className="text-sm font-semibold text-white">{icon} {label}</p><p className="text-xs text-text-muted">{desc}</p></div>
            <Toggle checked={!!data[key]} onChange={()=>setData(p=>({...p,[key]:!p[key]}))} color={color}/>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-[0.2em] font-semibold mb-2">Catalog</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Products</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {user && <>
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" ref={csvRef} onChange={parseBulkFile}/>
            <button onClick={()=>csvRef.current?.click()} disabled={saving} className="btn-outline flex items-center gap-2 py-2 text-sm">
              <FileSpreadsheet size={16}/> Bulk Import
            </button>
          </>}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Main */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Filters */}
          <div className="glass-card p-3 flex flex-wrap items-center gap-3">
            {user && selected.length > 0 && (
              <button onClick={bulkDel} className="flex items-center gap-2 bg-accent-red/10 text-accent-red px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-accent-red/20 transition-colors">
                <Trash2 size={14}/> Delete ({selected.length})
              </button>
            )}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
              <input type="text" placeholder="Search..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="glass-input pl-9 py-2 text-sm w-full"/>
            </div>
            <select className="glass-input py-2 text-sm" value={catFilter} onChange={e=>{setCatFilter(e.target.value);setPage(1);}}>
              <option value="all">All Categories</option>
              {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="glass-input py-2 text-sm" value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured</option>
              <option value="trending">Trending</option>
            </select>
          </div>

          {/* Table */}
          <div className="glass-card overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-[10px] text-text-muted uppercase tracking-widest border-b border-dark-500/30">
                  {user && <th className="p-4 w-8"></th>}
                  <th className="text-left p-4 font-semibold">Product</th>
                  <th className="text-left p-4 font-semibold">Category</th>
                  <th className="text-left p-4 font-semibold">Price</th>
                  <th className="text-left p-4 font-semibold">Stock</th>
                  <th className="text-left p-4 font-semibold">Flags</th>
                  {user && <th className="p-4 w-20">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(5)].map((_,i)=>(
                  <tr key={i} className="border-t border-dark-500/20">{[...Array(6)].map((_,j)=><td key={j} className="p-4"><div className="h-4 bg-dark-500/40 rounded-lg animate-pulse"/></td>)}</tr>
                )) : paginated.length===0 ? (
                  <tr><td colSpan={7} className="p-12 text-center text-text-muted"><ShoppingBag size={40} className="mx-auto mb-3 opacity-30"/><p>No products found</p></td></tr>
                ) : paginated.map(p=>(
                  <tr key={p.id} className="border-t border-dark-500/20 hover:bg-dark-500/10 transition-colors group">
                    {user && <td className="p-4"><input type="checkbox" className="accent-purple-500 w-4 h-4" checked={selected.includes(p.id)} onChange={()=>setSelected(s=>s.includes(p.id)?s.filter(x=>x!==p.id):[...s,p.id])}/></td>}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={(p.images||[])[0]||'https://placehold.co/48x48/1a2040/64748b?text=?'} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0"/>
                        <div><p className="text-sm font-semibold text-white">{p.name}</p><p className="text-xs text-text-muted">{p.sku||'No SKU'}</p></div>
                      </div>
                    </td>
                    <td className="p-4"><span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400">{catMap[p.categoryId]?.name||'—'}</span></td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-white">₹{parseFloat(p.price||0).toFixed(2)}</p>
                      {p.discount>0 && <p className="text-xs text-accent-red">-{p.discount}% OFF</p>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${p.stock<20?'text-accent-red':'text-white'}`}>{(p.stock||0).toLocaleString()}</span>
                        <div className="w-16 h-1.5 bg-dark-500 rounded-full overflow-hidden"><div className={`h-full rounded-full ${stockColor(p.stock)}`} style={{width:`${Math.min((p.stock/1500)*100,100)}%`}}/></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {!p.isActive && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-dark-400 text-text-muted">Inactive</span>}
                        {p.isTrending && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-orange-400"><Flame size={10}/> Trending</span>}
                        {p.isFeatured && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/15 text-yellow-400"><Star size={10}/> Featured</span>}
                        {p.isActive && !p.isTrending && !p.isFeatured && <span className="text-text-muted text-xs">—</span>}
                      </div>
                    </td>
                    {user && <td className="p-4"><div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={()=>{setEditProd({...p});setShowAdd(false);}} className="text-text-muted hover:text-purple-400"><Edit2 size={14}/></button>
                      <button onClick={()=>handleDel(p.id)} className="text-text-muted hover:text-accent-red"><Trash2 size={14}/></button>
                    </div></td>}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="p-4 border-t border-dark-500/30 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-text-muted">{filtered.length===0?'No products':`${(page-1)*perPage+1}–${Math.min(page*perPage,filtered.length)} of ${filtered.length}`}</p>
              <div className="flex items-center gap-1">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30"><ChevronLeft size={16}/></button>
                {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(pg=>(
                  <button key={pg} onClick={()=>setPage(pg)} className={`w-8 h-8 rounded-lg text-sm font-semibold ${page===pg?'bg-purple-500 text-white':'text-text-muted hover:bg-dark-500/30'}`}>{pg}</button>
                ))}
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30"><ChevronRight size={16}/></button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Panel */}
        {user && showAdd && (
          <div className="w-full lg:w-80 glass-card-solid p-6 slide-in-right self-start lg:sticky lg:top-20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Add Product</h3>
              <button onClick={()=>setShowAdd(false)} className="text-text-muted hover:text-text-primary"><X size={18}/></button>
            </div>
            {renderForm(form, setForm, false)}
            <button onClick={handleAdd} disabled={saving||uploading} className="btn-primary w-full justify-center py-3 text-sm mt-4 rounded-2xl disabled:opacity-60">
              {saving ? <Loader2 size={18} className="animate-spin"/> : <Plus size={18}/>} {saving ? 'Saving...' : 'Add Product'}
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {user && editProd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center fade-in p-4" onClick={()=>setEditProd(null)}>
          <div className="glass-card-solid p-6 md:p-8 w-full max-w-md slide-up max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Product</h3>
              <button onClick={()=>setEditProd(null)} className="text-text-muted hover:text-text-primary"><X size={18}/></button>
            </div>
            {renderForm(editProd, setEditProd, true)}
            <button onClick={handleUpdate} disabled={saving||uploading} className="btn-primary w-full justify-center py-3 mt-4 disabled:opacity-60">
              {saving ? <Loader2 size={18} className="animate-spin"/> : <Edit2 size={18}/>} {saving ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      )}

      {/* Bulk Preview Modal */}
      {showBulk && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center fade-in p-4" onClick={()=>{setShowBulk(false);setBulkData([]);}}>
          <div className="glass-card-solid p-6 w-full max-w-3xl slide-up max-h-[85vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div><h3 className="text-xl font-semibold text-white">Bulk Import Preview</h3><p className="text-sm text-text-muted">{bulkFile} — {bulkData.length} rows</p></div>
              <button onClick={()=>{setShowBulk(false);setBulkData([]);}} className="text-text-muted hover:text-text-primary"><X size={18}/></button>
            </div>
            {bulkData.length > 0 && (
              <div className="overflow-x-auto mb-4">
                <table className="w-full min-w-[600px] text-sm">
                  <thead><tr className="border-b border-dark-500/30 text-[10px] text-text-muted uppercase">
                    {Object.keys(bulkData[0]).map(k=><th key={k} className="text-left p-2">{k}</th>)}
                  </tr></thead>
                  <tbody>{bulkData.slice(0,20).map((row,i)=>(
                    <tr key={i} className="border-t border-dark-500/20">{Object.values(row).map((v,j)=><td key={j} className="p-2 text-text-secondary max-w-[150px] truncate">{String(v)}</td>)}</tr>
                  ))}</tbody>
                </table>
                {bulkData.length>20 && <p className="text-xs text-text-muted mt-2">...and {bulkData.length-20} more rows</p>}
              </div>
            )}
            <div className="flex items-center gap-3">
              <button onClick={executeBulk} disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
                {saving ? <><Loader2 size={16} className="animate-spin"/> Uploading...</> : <><Upload size={16}/> Upload {bulkData.length} Products</>}
              </button>
              <button onClick={()=>{setShowBulk(false);setBulkData([]);}} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      {user && !showAdd && !editProd && (
        <button onClick={()=>setShowAdd(true)} className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 hover:scale-110 transition-transform z-50">
          <ShoppingBag size={22}/>
        </button>
      )}
    </div>
  );
}
