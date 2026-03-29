import { useState } from 'react';
import { Search, Filter, Download, Plus, ChevronLeft, ChevronRight, Eye, TrendingUp, UserPlus } from 'lucide-react';
import { mockCustomers } from '../data/mockData';

const tabs = ['All Customers', 'Active', 'VIP Tier', 'Inactive'];

export default function Customers() {
  const [activeTab, setActiveTab] = useState('All Customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const filtered = mockCustomers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All Customers' || (activeTab === 'Active' && c.status === 'active') || (activeTab === 'Inactive' && c.status === 'inactive') || (activeTab === 'VIP Tier' && c.orders > 30);
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
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
          {/* New Customers Stat */}
          <div className="glass-card px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <TrendingUp size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-widest">New Customers This Week</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-white">+128</p>
                <span className="text-xs text-accent-green font-semibold">↑ 14%</span>
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
            <input type="text" placeholder="Search customers by name, email or ID..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} className="glass-input pl-9 py-2 text-sm w-72" />
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
              <th className="text-left p-4 font-semibold">Customer</th>
              <th className="text-left p-4 font-semibold">Contact Details</th>
              <th className="text-left p-4 font-semibold">Orders Count</th>
              <th className="text-left p-4 font-semibold">Last Active</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((customer) => (
              <tr key={customer.id} className="border-t border-dark-500/20 hover:bg-dark-500/10 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={customer.image} alt={customer.name} className="w-10 h-10 rounded-full object-cover"  />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-dark-600 ${customer.status === 'active' ? 'bg-accent-green' : 'bg-accent-red'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{customer.name}</p>
                      <p className="text-xs text-text-muted">ID: {customer.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm text-white">{customer.email}</p>
                  <p className="text-xs text-text-muted">{customer.phone}</p>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 font-bold text-sm">
                    {customer.orders}
                  </span>
                </td>
                <td className="p-4">
                  <p className="text-sm text-white">{customer.lastActive}</p>
                  <p className="text-xs text-text-muted">{customer.location}</p>
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
        <div className="p-4 border-t border-dark-500/30 flex items-center justify-between">
          <p className="text-xs text-text-muted">Showing {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, filtered.length)} of {filtered.length.toLocaleString()} customers</p>
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
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-text-muted py-4">© 2024 VELOCITYPRO SYSTEM V4.2.0 · DATA ENCRYPTED AND SECURED</p>

      {/* Add Customer FAB */}
      <button className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 hover:scale-110 transition-transform z-50">
        <Plus size={24} />
      </button>
    </div>
  );
}
