import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, FolderOpen, Users, Truck, Warehouse,
  Tag, CreditCard, BarChart3, Bell, Star, Settings, Zap, LogOut, LayoutPanelTop, LogIn
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navSections = [
  {
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/orders', icon: ShoppingCart, label: 'Orders' },
      { to: '/products', icon: Package, label: 'Products' },
      { to: '/categories', icon: FolderOpen, label: 'Categories' },
      { to: '/customers', icon: Users, label: 'Customers' },
      { to: '/delivery-partners', icon: Truck, label: 'Delivery Partners' },
      { to: '/inventory', icon: Warehouse, label: 'Inventory' },
    ]
  },
  {
    title: 'INSIGHTS',
    items: [
      { to: '/offers', icon: Tag, label: 'Offers' },
      { to: '/payments', icon: CreditCard, label: 'Payments' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/content', icon: LayoutPanelTop, label: 'Content' },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { to: '/notifications', icon: Bell, label: 'Notifications' },
      { to: '/reviews', icon: Star, label: 'Reviews' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ]
  }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-dark-900/80 backdrop-blur-xl border-r border-glass-border flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white leading-tight">VelocityPro</h1>
          <p className="text-[10px] text-text-muted uppercase tracking-widest">Quick-Commerce Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <p className="text-[10px] text-text-muted uppercase tracking-widest px-3 pt-5 pb-2">{section.title}</p>
            )}
            {section.items.map((item) => {
              const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                    ${isActive
                      ? 'bg-purple-500/15 text-purple-400'
                      : 'text-text-secondary hover:text-text-primary hover:bg-dark-500/30'
                    }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-purple-500 rounded-r-full" />
                  )}
                  <item.icon size={18} className={isActive ? 'text-purple-400' : 'text-text-muted group-hover:text-text-secondary'} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Card */}
      <div className="p-3">
        {user ? (
          <div className="glass-card p-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-accent-blue flex items-center justify-center text-white font-bold text-xs">
                MA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-text-muted">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-xs text-text-muted hover:text-accent-red transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="glass-card p-3 w-full flex items-center gap-3 hover:border-purple-500/30 transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/20 to-accent-blue/20 flex items-center justify-center text-purple-400 group-hover:text-purple-300">
              <LogIn size={16} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-text-secondary group-hover:text-white transition-colors">Login to Edit</p>
              <p className="text-[11px] text-text-muted">View-only mode</p>
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
