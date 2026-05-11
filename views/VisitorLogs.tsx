
import React, { useState } from 'react';
import { ParkingLog } from '../types';
import { LEVELS } from '../constants';

interface VisitorLogsProps {
  logs: ParkingLog[];
  onShowNotification: (message: string, type: 'success' | 'info') => void;
}

export const VisitorLogs: React.FC<VisitorLogsProps> = ({ logs, onShowNotification }) => {
  const [activeLevel, setActiveLevel] = useState<number>(0); // 0 means "All Levels"
  const [searchQuery, setSearchQuery] = useState('');

  const handleExportCSV = () => {
    if (logs.length === 0) {
      onShowNotification("No data to export", 'info');
      return;
    }
    onShowNotification(`Exporting ${logs.length} records...`, 'success');
  };

  const filteredLogs = logs.filter(log => {
    const matchesLevel = activeLevel === 0 || log.levelId === activeLevel;
    const matchesSearch = log.vehicleSnapshot.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.vehicleSnapshot.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 bg-[#0a0a0a]">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Security Logs</h1>
          <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-[0.3em] font-black flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Real-time Audit Trail · {logs.length} Total Entries
          </p>
        </div>
        <button onClick={handleExportCSV} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
          <span className="material-icons-round text-sm">download</span>
          Export Records
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Level Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#111] border border-white/5 rounded-2xl">
            <button 
              onClick={() => setActiveLevel(0)}
              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeLevel === 0 ? 'bg-primary text-black shadow-[0_0_20px_rgba(242,204,13,0.3)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              All Floors
            </button>
            {LEVELS.map(level => (
              <button 
                key={level.id}
                onClick={() => setActiveLevel(level.id)}
                className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeLevel === level.id ? 'bg-white text-black' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                title={level.name}
              >
                L{level.id}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md group">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder="SEARCH PLATE OR OWNER..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-600"
            />
          </div>

          {(activeLevel !== 0 || searchQuery !== '') && (
            <button 
              onClick={() => { setActiveLevel(0); setSearchQuery(''); }}
              className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span className="material-icons-round text-sm">restart_alt</span>
              Reset
            </button>
          )}
        </div>

        {/* Selected Level Description */}
        {activeLevel !== 0 && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
            <div className="h-4 w-1 bg-primary rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Viewing: <span className="text-white">{LEVELS.find(l => l.id === activeLevel)?.name}</span>
            </span>
          </div>
        )}
      </div>

      <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <table className="w-full text-left">
            <thead>
              <tr className="bg-black/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Vehicle / Owner</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Slot ID</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.logId} className="hover:bg-white/[0.02] group transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{log.entryTime}</span>
                      {log.exitTime && <span className="text-[10px] text-slate-500 font-mono">Exit: {log.exitTime}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="block text-sm font-bold text-white">{log.vehicleSnapshot.plateNumber}</span>
                      <span className="text-[10px] text-slate-500">{log.vehicleSnapshot.ownerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 border border-white/10 px-2 py-1 rounded">{log.vehicleSnapshot.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-black text-primary">{log.slotId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${log.status === 'Active' ? 'text-green-500' : 'text-slate-500'}`}>{log.status}</span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center py-20">
                      <span className="material-icons-round text-4xl text-slate-800 mb-4 block">history_toggle_off</span>
                      <p className="text-slate-600 text-[10px] uppercase font-black tracking-[0.2em]">No activity recorded for this floor</p>
                    </td>
                </tr>
              )}
            </tbody>
        </table>
      </div>
    </div>
  );
};
