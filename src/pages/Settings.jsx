import { User, Shield, Lock, Bell, Palette } from 'lucide-react';

export default function Settings() {
  const sections = [
    { id: 'profile', icon: User, title: 'Profile Settings', desc: 'Update your personal details and avatar' },
    { id: 'security', icon: Lock, title: 'Security', desc: 'Password, 2FA, and active sessions' },
    { id: 'team', icon: Shield, title: 'Team & Roles', desc: 'Manage sub-admins and access levels' },
    { id: 'notifications', icon: Bell, title: 'Notifications', desc: 'Email and push alert preferences' },
    { id: 'appearance', icon: Palette, title: 'Appearance', desc: 'Theme, layout, and language options' },
  ];

  return (
    <div className="space-y-6 fade-in max-w-5xl mx-auto flex gap-8">
      {/* Sidebar */}
      <div className="w-64 shrink-0 space-y-1">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
        {sections.map(s => (
          <button key={s.id} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors
            ${s.id === 'profile' ? 'bg-purple-500/15 text-purple-400 font-semibold' : 'text-text-secondary hover:bg-dark-500/30 hover:text-text-primary'}`}>
            <s.icon size={18} />
            <span className="text-sm">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-accent-blue flex items-center justify-center text-white text-3xl font-bold">
              AR
            </div>
            <div>
              <button className="btn-outline text-sm mb-2">Change Avatar</button>
              <p className="text-xs text-text-muted">JPG, GIF or PNG. Max size 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">First Name</label>
              <input type="text" defaultValue="Alex" className="glass-input w-full text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Last Name</label>
              <input type="text" defaultValue="Rivera" className="glass-input w-full text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Email Address</label>
              <input type="email" defaultValue="admin@velocitypro.com" className="glass-input w-full text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1.5 block">Role</label>
              <input type="text" defaultValue="Super Admin" disabled className="glass-input w-full text-sm opacity-50 cursor-not-allowed" />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button className="btn-primary text-sm px-8">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
