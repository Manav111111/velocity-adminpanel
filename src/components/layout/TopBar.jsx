import { Search, HelpCircle, Moon, Eye, LogIn, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-glass-border bg-dark-900/50 backdrop-blur-xl sticky top-0 z-40 gap-3">
      {/* Mobile menu button */}
      <button onClick={onMenuClick} className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-dark-500/30 transition-all flex-shrink-0">
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" placeholder="Search..." className="glass-input w-full pl-11 pr-4 py-2.5 text-sm rounded-xl" />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {!user && (
          <button onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all text-sm font-semibold">
            <LogIn size={16} /> <span className="hidden sm:inline">Login to Edit</span>
          </button>
        )}
        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-dark-500/30 transition-all hidden md:flex">
          <HelpCircle size={18} />
        </button>
        <div className="h-6 w-px bg-dark-400 hidden md:block" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-white leading-tight">Store HQ</p>
            <p className="text-[11px] text-accent-green flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 bg-accent-green rounded-full" /> Operational
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-accent-blue flex items-center justify-center text-white font-bold text-xs">
            {user ? (user.name || 'A').slice(0, 2).toUpperCase() : '👁️'}
          </div>
        </div>
      </div>
    </header>
  );
}
