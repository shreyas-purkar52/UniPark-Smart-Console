
import React from 'react';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'info';
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, type }) => {
  return (
    <div className={`
      pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-right-8 duration-500 flex items-start gap-3
      ${type === 'success' 
        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
        : 'bg-primary/10 border-primary/20 text-primary'}
    `}>
      <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${type === 'success' ? 'bg-green-500/20' : 'bg-primary/20'}`}>
        <span className="material-icons-round text-lg">
          {type === 'success' ? 'local_parking' : 'info'}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Parking Update</p>
        <p className="text-xs font-bold leading-relaxed">{message}</p>
      </div>
    </div>
  );
};
