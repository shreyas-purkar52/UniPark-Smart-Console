import React from 'react';

interface SystemWarningProps {
  isOnline: boolean | null;
}

export const SystemWarning: React.FC<SystemWarningProps> = ({ isOnline }) => {
  // Only show warning when we've confirmed the backend is offline (false)
  // Don't show during initialization/checking phase (null) or when online (true)
  if (isOnline !== false) return null;

  return (
    <div className="
      pointer-events-none
      fixed top-0 left-0 right-0 z-50
      bg-gradient-to-r from-yellow-900/60 via-amber-900/60 to-orange-900/60
      border-b border-yellow-500/30 backdrop-blur-md
      px-8 py-2.5 flex items-center justify-center gap-2
      shadow-lg shadow-black/40
    ">
      {/* Warning Icon with Glow */}
      <div className="flex-shrink-0 flex items-center justify-center">
        <div className="relative w-5 h-5">
          <div className="absolute inset-0 bg-yellow-400/40 rounded-full blur-lg animate-pulse"></div>
          <span className="material-icons-round text-yellow-400 text-sm relative z-10 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)] font-bold">
            warning
          </span>
        </div>
      </div>

      {/* Warning Message */}
      <div className="flex items-center justify-center">
        <span className="text-[11px] font-black uppercase tracking-[0.12em] text-yellow-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] letter-spacing">
          ⚠ Backend Offline — Using Mock Database
        </span>
      </div>

      {/* Pulse indicator */}
      <div className="flex-shrink-0 ml-1 w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_6px_rgba(250,204,21,0.6)]"></div>
    </div>
  );
};
