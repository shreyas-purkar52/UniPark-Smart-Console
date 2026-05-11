
import React from 'react';
import { AuthUser } from '../types';

interface HeaderProps {
  currentTime: Date;
  user: AuthUser;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTime, user, onLogout, isDarkMode, onToggleTheme }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).toUpperCase();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="h-16 border-b border-white/5 bg-[#111] flex items-center justify-between px-8 z-30">
      <div className="flex items-center gap-2">
        <span className="text-xl font-black italic tracking-tighter uppercase">UniPark</span>
        <span className="h-4 w-px bg-white/10 mx-2"></span>
        <div className="flex flex-col">
          <span className="text-[10px] text-primary font-black uppercase tracking-widest leading-none">Security Console</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 text-slate-400 font-mono text-xs font-medium">
          <span className="material-icons-round text-sm">schedule</span>
          <span>{formatDate(currentTime)} | {formatTime(currentTime)}</span>
        </div>

        <div className="flex items-center gap-4 pl-8 border-l border-white/5">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all group relative overflow-hidden"
          >
            <span
              className={`material-icons-round text-lg transition-all duration-300 ${
                isDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90 absolute'
              }`}
            >
              light_mode
            </span>
            <span
              className={`material-icons-round text-lg transition-all duration-300 ${
                !isDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90 absolute'
              }`}
            >
              dark_mode
            </span>
          </button>

          <div className="text-right">
            <p className="text-xs font-bold text-white">{user.name}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">{user.stationId} • {user.role}</p>
          </div>
          <button 
            onClick={onLogout}
            className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all group"
            title="Secure Logout"
          >
            <span className="material-icons-round text-lg group-hover:rotate-12 transition-transform">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
