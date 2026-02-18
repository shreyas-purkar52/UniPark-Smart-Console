
import React from 'react';
import { LEVELS } from '../constants';
import { ParkingSlot } from '../types';

interface DashboardProps {
  slotsByLevel: Record<number, ParkingSlot[]>;
}

export const Dashboard: React.FC<DashboardProps> = ({ slotsByLevel }) => {
  // Calculate global totals
  const allSlots: ParkingSlot[] = (Object.values(slotsByLevel) as ParkingSlot[][]).flat();
  const totalCapacity = allSlots.length;
  const totalAvailable = allSlots.filter(s => s.status === 'AVAILABLE').length;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 bg-[#0a0a0a]">
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-[10px] text-slate-500 mb-1 flex items-center gap-2 uppercase tracking-widest font-black">
            <span>Home</span>
            <span className="material-icons-round text-[12px]">chevron_right</span>
            <span className="text-primary">Dashboard</span>
          </nav>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Real-Time Parking Status</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-primary/10 border border-primary/20 rounded-full px-4 py-2 items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-black text-primary uppercase tracking-widest">System Optimal</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Capacity', val: totalCapacity.toLocaleString(), icon: 'garage', color: 'primary' },
          { label: 'Available', val: totalAvailable.toLocaleString(), icon: 'check_circle', color: 'green-500' },
          { label: 'Arrivals Today', val: '1,128', icon: 'trending_up', color: 'primary' },
          { label: 'Avg Dwell', val: '4.2h', icon: 'schedule', color: 'slate-500' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-[#111] border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
            <div>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className={`text-3xl font-black mt-1 ${stat.color === 'primary' ? 'text-primary' : (stat.color === 'green-500' ? 'text-green-500' : 'text-white')}`}>{stat.val}</h3>
            </div>
            <span className={`material-icons-round text-4xl opacity-10 group-hover:opacity-30 transition-opacity`}>{stat.icon}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {LEVELS.map((level) => {
          const levelSlots = slotsByLevel[level.id] || [];
          const occupiedCount = levelSlots.filter(s => s.status === 'OCCUPIED').length;
          const capacity = levelSlots.length;
          const occupancy = capacity > 0 ? Math.round((occupiedCount / capacity) * 100) : 0;
          const openCount = levelSlots.filter(s => s.status === 'AVAILABLE').length;
          const transitCount = levelSlots.filter(s => s.status === 'RESERVED').length;

          return (
            <div key={level.id} className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center gap-8 hover:bg-white/[0.02] transition-all group">
              <div className="lg:w-64 shrink-0">
                <span className="text-primary font-black text-[10px] tracking-[0.2em] uppercase mb-1 block">Level 0{level.id}</span>
                <h2 className="text-xl font-black uppercase tracking-tighter group-hover:text-primary transition-colors">{level.category} Wing</h2>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Occupancy</span>
                  <span className="text-xl font-black text-primary">{occupancy}%</span>
                </div>
                <div className="h-3 w-full bg-black rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(242,204,13,0.3)]" 
                    style={{ width: `${occupancy}%` }}
                  ></div>
                </div>
              </div>
              <div className="lg:w-[420px] grid grid-cols-4 gap-4 bg-black/40 p-4 rounded-xl border border-white/5 shrink-0 text-center">
                <div>
                  <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest mb-1">Open</p>
                  <p className="text-base font-black text-green-500">{openCount}</p>
                </div>
                <div className="border-l border-white/10">
                  <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest mb-1">Full</p>
                  <p className="text-base font-black text-red-500">{occupiedCount}</p>
                </div>
                <div className="border-l border-white/10">
                  <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest mb-1">Transit</p>
                  <p className="text-base font-black text-primary">{transitCount}</p>
                </div>
                <div className="border-l border-white/10">
                  <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest mb-1">Res</p>
                  <p className="text-base font-black text-blue-500">0</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
