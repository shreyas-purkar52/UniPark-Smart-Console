
import React from 'react';

interface StatusFooterProps {
  isConnected?: boolean | null;
}

export const StatusFooter: React.FC<StatusFooterProps> = ({ isConnected = null }) => {
  const isOnline = isConnected === true;
  const isChecking = isConnected === null;
  
  return (
    <footer className="h-10 bg-panel-dark border-t border-white/5 flex items-center justify-between px-8 text-[10px] font-black tracking-widest text-slate-500 uppercase">
      <div className="flex gap-6 items-center">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : isChecking ? 'bg-yellow-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></span>
          SYSTEM {isOnline ? 'ONLINE' : isChecking ? 'CHECKING' : 'OFFLINE'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-primary animate-pulse' : 'bg-slate-700'}`}></span>
          {isOnline ? 'DB CONNECTED' : 'USING MOCK DB'}
        </span>
        <span className="flex items-center gap-1.5 opacity-50">
          OCR LATENCY: 24ms
        </span>
      </div>

      <div className="flex gap-6 items-center">
        <span className="flex items-center gap-1.5">
          <span className="text-green-500">NORTH PORTAL GATE: OPEN</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-primary">ENFORCEMENT MODE: ACTIVE</span>
        </span>
        <span className="opacity-50">© 2024 UNIPARK SECURITY</span>
      </div>
    </footer>
  );
};
