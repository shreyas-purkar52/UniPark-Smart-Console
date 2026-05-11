
import React from 'react';
import { AuthUser } from '../types';

interface HeaderProps {
  currentTime: Date;
  user: AuthUser;
}

export const Header: React.FC<HeaderProps> = ({ currentTime, user }) => {
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
          <div className="text-right">
            <p className="text-xs font-bold text-white">{user.name}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">{user.stationId} • {user.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 overflow-hidden">
             {user.avatarUrl ? (
                 <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
             ) : (
                <span className="material-icons-round text-primary text-sm">account_circle</span>
             )}
          </div>
        </div>
      </div>
    </header>
  );
};
