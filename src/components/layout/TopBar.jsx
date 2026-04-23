import { Search, HelpCircle, Moon, Store, Eye, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-glass-border bg-dark-900/50 backdrop-blur-xl sticky top-0 z-40">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search analytics, orders, products..."
          className="glass-input w-full pl-11 pr-4 py-2.5 text-sm rounded-xl"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {!user && (
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all text-sm font-semibold"
          >
            <LogIn size={16} />
            Login to Edit
          </button>
        )}
        {!user && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-500/30 border border-glass-border text-xs text-text-muted">
            <Eye size={14} />
            View Only
          </div>
        )}
        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-dark-500/30 transition-all">
          <HelpCircle size={18} />
        </button>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-dark-500/30 transition-all">
          <Moon size={18} />
        </button>
        <div className="h-6 w-px bg-dark-400" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-white leading-tight">Store HQ-Central</p>
            <p className="text-[11px] text-accent-green flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 bg-accent-green rounded-full" />
              Operational
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-accent-blue flex items-center justify-center text-white font-bold text-xs">
            {user ? 'MA' : '👁️'}
          </div>
        </div>
      </div>
    </header>
  );
}
