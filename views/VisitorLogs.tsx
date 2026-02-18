
import React from 'react';
import { ParkingLog } from '../types';

interface VisitorLogsProps {
  logs: ParkingLog[];
  onShowNotification: (message: string, type: 'success' | 'info') => void;
}

export const VisitorLogs: React.FC<VisitorLogsProps> = ({ logs, onShowNotification }) => {
  const handleExportCSV = () => {
    if (logs.length === 0) {
      onShowNotification("No data to export", 'info');
      return;
    }
    // Simple CSV export simulation
    onShowNotification(`Exporting ${logs.length} records...`, 'success');
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6 bg-[#0a0a0a]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">System Logs</h1>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">Total Entries: {logs.length}</p>
        </div>
        <button onClick={handleExportCSV} className="px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 text-slate-400 text-xs font-black uppercase">Export CSV</button>
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
              {logs.map((log) => (
                <tr key={log.logId} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{log.entryTime}</span>
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
              {logs.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-600 text-xs uppercase font-bold tracking-widest">No Log Entries Found</td>
                </tr>
              )}
            </tbody>
        </table>
      </div>
    </div>
  );
};
