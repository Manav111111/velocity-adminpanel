import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, Plus, ChevronLeft, ChevronRight, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { subscribeToCollection } from '../services/firestoreService';

const tabs = ['All Customers', 'Active', 'Inactive'];

export default function Customers() {
  const [activeTab, setActiveTab] = useState('All Customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const perPage = 10;

  useEffect(() => {
    const unsub = subscribeToCollection('users', (data) => {
      // Filter out any admin users if necessary, or just display all.
      setCustomers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch = 
        (c.name || '').toLowerCase().includes(searchStr) || 
        (c.email || '').toLowerCase().includes(searchStr) || 
        (c.id || '').toLowerCase().includes(searchStr) ||
        (c.phone || '').toLowerCase().includes(searchStr);
        
      // For active/inactive, we can assume users might have a status field. 
      // If not, treat everyone as active for demonstration unless explicitly marked 'inactive'.
      const status = c.status || 'active';
      const matchesTab = activeTab === 'All Customers' || 
                         (activeTab === 'Active' && status === 'active') || 
                         (activeTab === 'Inactive' && status === 'inactive');
      
      return matchesSearch && matchesTab;
    });
  }, [customers, searchQuery, activeTab]);

  const newCustomersThisWeek = customers.filter(c => {
    if (!c.createdAt) return false;
    const createdDate = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return createdDate >= oneWeekAgo;
  }).length;

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Customers</h1>
          <p className="text-text-secondary mt-2 max-w-lg">Manage your global customer base, track purchasing habits, and provide high-touch support.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-card px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <TrendingUp size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-widest">New Customers (Live)</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-white">{loading ? '...' : `+${newCustomersThisWeek}`}</p>
                <span className="text-xs text-accent-green font-semibold">Live from DB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {tabs.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                ${activeTab === tab ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'text-text-secondary hover:text-text-primary border border-transparent'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" placeholder="Search users by name, email..." value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="glass-input pl-9 py-2 text-sm w-72" />
          </div>
          <button className="btn-outline text-sm py-2">
            <Filter size={14} /> Filters
          </button>
          <button className="btn-outline text-sm py-2">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] text-text-muted uppercase tracking-widest border-b border-dark-500/30">
              <th className="text-left p-4 font-semibold">User ID</th>
              <th className="text-left p-4 font-semibold">Customer Details</th>
              <th className="text-left p-4 font-semibold">Contact</th>
              <th className="text-left p-4 font-semibold">Account Status</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <Loader2 size={24} className="animate-spin text-purple-400 mx-auto" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <p className="text-text-secondary">No customers found.</p>
                </td>
              </tr>
            ) : paginated.map((customer) => (
              <tr key={customer.id} className="border-t border-dark-500/20 hover:bg-dark-500/10 transition-colors">
                <td className="p-4">
                   <p className="text-sm font-mono text-white max-w-[120px] truncate">{customer.id}</p>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {customer.profileImage || customer.avatar ? (
                         <img src={customer.profileImage || customer.avatar} alt={customer.name} className="w-10 h-10 rounded-full object-cover"  />
                      ) : (
                         <div className="w-10 h-10 rounded-full bg-dark-400 flex items-center justify-center text-white font-bold text-sm">
                           {(customer.name || customer.email || '?').charAt(0).toUpperCase()}
                         </div>
                      )}
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-dark-600 ${customer.status === 'inactive' ? 'bg-accent-red' : 'bg-accent-green'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{customer.name || 'Unnamed User'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm text-white">{customer.email || '—'}</p>
                  <p className="text-xs text-text-muted">{customer.phone || '—'}</p>
                </td>
                <td className="p-4">
                   <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${customer.status === 'inactive' ? 'bg-accent-red/10 text-accent-red' : 'bg-accent-green/10 text-accent-green'}`}>
                     {customer.status === 'inactive' ? 'Inactive' : 'Active'}
                   </span>
                </td>
                <td className="p-4">
                  <button className="btn-outline py-1.5 px-4 text-xs">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-dark-500/30 flex items-center justify-between">
            <p className="text-xs text-text-muted">Showing {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} customers</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30"><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold ${currentPage === page ? 'bg-purple-500 text-white' : 'text-text-muted hover:bg-dark-500/30'}`}>{page}</button>
              ))}
              {totalPages > 3 && <span className="text-text-muted px-1">...</span>}
              {totalPages > 3 && (
                <button onClick={() => setCurrentPage(totalPages)} className={`w-8 h-8 rounded-lg text-sm font-semibold ${currentPage === totalPages ? 'bg-purple-500 text-white' : 'text-text-muted hover:bg-dark-500/30'}`}>{totalPages}</button>
              )}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      <button className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 hover:scale-110 transition-transform z-50">
        <Plus size={24} />
      </button>
    </div>
  );
}
