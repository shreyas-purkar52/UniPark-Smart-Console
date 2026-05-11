
import React, { useState, useEffect } from 'react';
import { LEVELS } from '../constants';
import { ParkingSlot } from '../types';

interface DashboardProps {
  slotsByLevel: Record<number, ParkingSlot[]>;
}

export const Dashboard: React.FC<DashboardProps> = ({ slotsByLevel }) => {
  // Live ticker — recalculates dwell every second
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Calculate global totals
  const allSlots: ParkingSlot[] = (Object.values(slotsByLevel) as ParkingSlot[][]).flat();
  const totalCapacity = allSlots.length;
  const totalAvailable = allSlots.filter(s => s.status === 'AVAILABLE').length;
  const totalOccupied = allSlots.filter(s => s.status === 'OCCUPIED').length;
  const occupancyPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  let totalDwellMinutes = 0;
  let occupiedCountForDwell = 0;
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  allSlots.forEach(slot => {
    if (slot.status === 'OCCUPIED' && slot.occupant?.entryTime) {
      const parts = slot.occupant.entryTime.split(':');
      if (parts.length >= 2) {
        const entryTotalMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        let dwell = currentTotalMinutes - entryTotalMinutes;
        if (dwell < 0) dwell += 24 * 60;
        totalDwellMinutes += dwell;
        occupiedCountForDwell++;
      }
    }
  });

  const avgDwellHours = occupiedCountForDwell > 0
    ? (totalDwellMinutes / occupiedCountForDwell / 60).toFixed(1) + 'h'
    : '0.0h';

  const getFlowLabel = (pct: number) => {
    if (pct >= 90) return { label: 'CRITICAL', cls: 'text-red-500' };
    if (pct >= 70) return { label: 'HEAVY', cls: 'text-orange-400' };
    if (pct >= 40) return { label: 'STEADY', cls: 'text-emerald-400' };
    return { label: 'LIGHT', cls: 'text-blue-400' };
  };

  const getAlertLabel = (pct: number) => {
    if (pct >= 95) return { label: 'FULL', cls: 'text-red-500' };
    if (pct >= 80) return { label: 'HIGH LOAD', cls: 'text-orange-400' };
    if (pct >= 60) return { label: 'MONITOR', cls: 'text-yellow-400' };
    return { label: 'NONE', cls: 'text-slate-400' };
  };

  const globalFlow = getFlowLabel(occupancyPct);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10 bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <nav className="text-[9px] text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-[0.3em] font-black">
            <span>Operational Hub</span>
            <span className="material-icons-round text-[10px] text-primary">circle</span>
            <span className="text-primary">Real-time Dashboard</span>
          </nav>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Central Command</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* LIVE badge */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
          </div>
          <div className="flex bg-[#111] border border-white/5 rounded-2xl px-5 py-3 items-center gap-4 shadow-xl">
            <div className="relative">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500"></span>
              <span className="absolute inset-0 h-3 w-3 rounded-full bg-emerald-500 animate-ping opacity-40"></span>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Network Status</p>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Secure &amp; Optimal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'System Capacity',    val: totalCapacity,  unit: 'SLOTS', icon: 'layers',        color: 'text-primary',    glow: 'shadow-primary/10' },
          { label: 'Current Availability', val: totalAvailable, unit: 'FREE',  icon: 'check_circle',  color: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
          { label: 'Active Occupancy',   val: totalOccupied,  unit: 'UNITS', icon: 'electric_bolt', color: 'text-red-400',     glow: 'shadow-red-500/10' },
          { label: 'Average Stay',       val: avgDwellHours,  unit: 'TIME',  icon: 'schedule',      color: 'text-slate-300',   glow: 'shadow-white/5' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-3xl bg-[#111] border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all shadow-2xl ${stat.glow}`}>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <span className="material-icons-round text-8xl">{stat.icon}</span>
            </div>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-4xl font-black tracking-tighter transition-all duration-500 ${stat.color}`}>{stat.val}</h3>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Global Occupancy Bar */}
      <div className="bg-[#111] border border-white/5 rounded-2xl px-8 py-5 flex items-center gap-8 shadow-xl">
        <div className="shrink-0">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Overall Occupancy</p>
          <p className={`text-3xl font-black tracking-tighter transition-all duration-700 ${occupancyPct >= 80 ? 'text-red-400' : 'text-primary'}`}>{occupancyPct}%</p>
        </div>
        <div className="flex-1 h-3 bg-black rounded-full overflow-hidden border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${occupancyPct >= 80 ? 'bg-red-500' : occupancyPct >= 50 ? 'bg-primary' : 'bg-emerald-500'}`}
            style={{ width: `${occupancyPct}%` }}
          />
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">System Flow</p>
          <p className={`text-xs font-black uppercase tracking-widest ${globalFlow.cls}`}>{globalFlow.label}</p>
        </div>
      </div>

      {/* Floor Utilization Matrix */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
            <span className="w-8 h-px bg-primary/30"></span>
            Floor Utilization Matrix
          </h2>
          <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-slate-600">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-emerald-500/60 border border-emerald-500/30"></span> Low</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-primary/60 border border-primary/50"></span> Med</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-red-500 border border-red-500/50"></span> High</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {LEVELS.map((level) => {
            const levelSlots = slotsByLevel[level.id] || [];
            const occupiedCount = levelSlots.filter(s => s.status === 'OCCUPIED').length;
            const reservedCount = levelSlots.filter(s => s.status === 'RESERVED').length;
            const capacity = levelSlots.length;
            const occupancy = capacity > 0 ? Math.round((occupiedCount / capacity) * 100) : 0;
            const openCount = capacity - occupiedCount - reservedCount;
            const flow = getFlowLabel(occupancy);
            const alert = getAlertLabel(occupancy);
            const barColor = occupancy >= 80 ? 'bg-red-500' : occupancy >= 50 ? 'bg-primary' : 'bg-emerald-500';

            return (
              <div key={level.id} className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col gap-5 hover:bg-white/[0.02] transition-all relative overflow-hidden shadow-2xl group">
                {/* Subtle glow at high occupancy */}
                {occupancy >= 80 && (
                  <div className="absolute inset-0 rounded-3xl border border-red-500/20 pointer-events-none"></div>
                )}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-primary font-black text-[9px] tracking-[0.3em] uppercase block mb-1">Level 0{level.id}</span>
                    <h3 className="text-base font-black uppercase tracking-tighter text-white leading-tight">{level.category}</h3>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${occupancy >= 80 ? 'bg-red-500/10 border-red-500/30 text-red-400' : occupancy >= 50 ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                    <span className="text-[10px] font-black">{occupancy}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                    <span>{occupiedCount} Occupied</span>
                    <span>{openCount} Free</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-[7px] text-slate-600 uppercase font-black tracking-[0.2em] mb-1">Alerts</p>
                    <p className={`text-[10px] font-black transition-colors duration-500 ${alert.cls}`}>{alert.label}</p>
                  </div>
                  <div className="text-center border-l border-white/5">
                    <p className="text-[7px] text-slate-600 uppercase font-black tracking-[0.2em] mb-1">Flow</p>
                    <p className={`text-[10px] font-black transition-colors duration-500 ${flow.cls}`}>{flow.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Peak Activity Chart */}
      <div className="bg-[#111] border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xs">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Peak Analysis</h2>
            <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-wider font-bold">
              Predictive traffic flow based on real-time sensor data across all entry points.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">Updating live</span>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 h-40">
            {[40, 35, 60, 45, 90, 75, 40, 50, 65, 80, 55, 30, 45, 70, 85, 95, 60, 40].map((h, i) => {
              const hour = i + 6;
              const isCurrent = hour === now.getHours();
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-white/5 rounded-full relative overflow-hidden h-32 flex items-end">
                    <div
                      className={`w-full rounded-full transition-all duration-700 ${isCurrent ? 'bg-primary' : 'bg-primary/40 group-hover:bg-primary'}`}
                      style={{ height: `${isCurrent ? Math.max(h, occupancyPct) : h}%` }}
                    />
                  </div>
                  <span className={`text-[7px] font-black uppercase tracking-widest ${isCurrent ? 'text-primary' : 'text-slate-700'}`}>{hour}h</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};
