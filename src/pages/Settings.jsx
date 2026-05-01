import { useState } from 'react';
import { User, Shield, Lock, Bell, Palette, AlertTriangle, Trash2, Loader2, X } from 'lucide-react';
import { deleteAllDocuments } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAll = async () => {
    if (confirmText !== 'DELETE') return toast.error('Type DELETE to confirm');
    setDeleting(true);
    toast.loading('Deleting all content...', { id: 'del-all' });
    try {
      const [pCount, cCount, bCount] = await Promise.all([
        deleteAllDocuments('products'),
        deleteAllDocuments('categories'),
        deleteAllDocuments('banners'),
      ]);
      toast.success(`Deleted ${pCount} products, ${cCount} categories, ${bCount} banners`, { id: 'del-all' });
      setShowDeleteModal(false);
      setConfirmText('');
    } catch (err) {
      toast.error('Delete failed: ' + err.message, { id: 'del-all' });
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const sections = [
    { id: 'profile', icon: User, title: 'Profile Settings', desc: 'Update your personal details and avatar' },
    { id: 'security', icon: Lock, title: 'Security', desc: 'Password, 2FA, and active sessions' },
    { id: 'team', icon: Shield, title: 'Team & Roles', desc: 'Manage sub-admins and access levels' },
    { id: 'notifications', icon: Bell, title: 'Notifications', desc: 'Email and push alert preferences' },
    { id: 'appearance', icon: Palette, title: 'Appearance', desc: 'Theme, layout, and language options' },
  ];

  return (
    <div className="space-y-6 fade-in max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full lg:w-64 shrink-0 space-y-1">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
        {sections.map(s => (
          <button key={s.id} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors
            ${s.id === 'profile' ? 'bg-purple-500/15 text-purple-400 font-semibold' : 'text-text-secondary hover:bg-dark-500/30 hover:text-text-primary'}`}>
            <s.icon size={18} />
            <span className="text-sm">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6">
        {/* Profile Section */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-500 to-accent-blue flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
              {user ? (user.name || 'A').slice(0, 2).toUpperCase() : 'AR'}
            </div>
            <div>
              <button className="btn-outline text-sm mb-2">Change Avatar</button>
              <p className="text-xs text-text-muted">JPG, GIF or PNG. Max size 2MB</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">First Name</label>
              <input type="text" defaultValue={user?.name?.split(' ')[0] || 'Admin'} className="glass-input w-full text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Last Name</label>
              <input type="text" defaultValue={user?.name?.split(' ')[1] || ''} className="glass-input w-full text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Email</label>
              <input type="email" defaultValue={user?.email || 'admin@velocitypro.com'} className="glass-input w-full text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Role</label>
              <input type="text" defaultValue={user?.role || 'Super Admin'} disabled className="glass-input w-full text-sm opacity-50 cursor-not-allowed" />
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <button className="btn-primary text-sm px-8">Save Changes</button>
          </div>
        </div>

        {/* Danger Zone */}
        {user && (
          <div className="glass-card p-6 border-accent-red/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-red/15 flex items-center justify-center">
                <AlertTriangle size={20} className="text-accent-red" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
                <p className="text-sm text-text-muted">Irreversible destructive actions</p>
              </div>
            </div>
            <div className="border border-accent-red/20 rounded-xl p-4 bg-accent-red/5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Delete All Content</p>
                  <p className="text-xs text-text-muted mt-1">Permanently delete all products, categories, and banners. Orders and users will NOT be affected.</p>
                </div>
                <button onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 bg-accent-red/10 text-accent-red px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-red/20 transition-colors border border-accent-red/20 flex-shrink-0">
                  <Trash2 size={16} /> Delete All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center fade-in p-4" onClick={() => { setShowDeleteModal(false); setConfirmText(''); }}>
          <div className="glass-card-solid p-6 md:p-8 w-full max-w-md slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-red/15 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-accent-red" />
                </div>
                <h3 className="text-xl font-semibold text-white">Confirm Deletion</h3>
              </div>
              <button onClick={() => { setShowDeleteModal(false); setConfirmText(''); }} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-accent-red/10 border border-accent-red/20">
                <p className="text-sm text-accent-red font-semibold mb-2">⚠️ This action is irreversible!</p>
                <p className="text-xs text-text-secondary">This will permanently delete:</p>
                <ul className="text-xs text-text-secondary mt-1 space-y-1">
                  <li>• All <strong className="text-white">products</strong></li>
                  <li>• All <strong className="text-white">categories</strong></li>
                  <li>• All <strong className="text-white">banners</strong></li>
                </ul>
                <p className="text-xs text-accent-green mt-2">✓ Orders and users will NOT be deleted</p>
              </div>
              <div>
                <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">
                  Type <span className="text-accent-red font-bold">DELETE</span> to confirm
                </label>
                <input type="text" placeholder="DELETE" className="glass-input w-full text-sm"
                  value={confirmText} onChange={e => setConfirmText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && confirmText === 'DELETE' && handleDeleteAll()} />
              </div>
              <button onClick={handleDeleteAll}
                disabled={confirmText !== 'DELETE' || deleting}
                className="w-full flex items-center justify-center gap-2 bg-accent-red text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {deleting ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : <><Trash2 size={16} /> Delete All Content</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
