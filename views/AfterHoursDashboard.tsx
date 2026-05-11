
import React, { useMemo } from 'react';
import { ParkingSlot } from '../types';

interface AfterHoursDashboardProps {
  slotsByLevel: Record<number, ParkingSlot[]>;
}

export const AfterHoursDashboard: React.FC<AfterHoursDashboardProps> = ({ slotsByLevel }) => {
  const activeLateVehicles = useMemo(() => {
    // 1. Get all occupied slots
    const allSlots = (Object.values(slotsByLevel) as ParkingSlot[][]).flat();
    const occupied = allSlots.filter(s => s.status === 'OCCUPIED' && s.occupant);

    // 2. Filter Rules for After Hours Monitor
    // Rule: Exclude Hostel Students (they are allowed to stay)
    // Rule: Include Visitors, Faculty, VIP, and Localite Students
    return occupied.filter(slot => {
        const v = slot.occupant!;
        
        // If student, check type
        if (v.role === 'STUDENT') {
            return v.studentType === 'LOCALITE'; // Only show Localites who are late
        }
        
        // Always show other categories (Visitors, Faculty, VIP shouldn't stay late usually)
        return true;
    });
  }, [slotsByLevel]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#080808] relative">
      {/* Red Alert Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)] z-10"></div>
      
      <div className="mb-8 relative z-20 flex justify-between items-end">
         <div>
            <div className="flex items-center gap-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest border border-red-900/50 px-2 py-0.5 rounded bg-red-900/20">Protocol 11-PM Active</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">After Hours Monitor</h1>
            <p className="text-slate-500 text-xs mt-1 font-bold">Displaying vehicles present after 11:00 PM cutoff</p>
         </div>
         <div className="text-right">
             <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Unauthorized / Pending</p>
             <p className="text-4xl font-black text-white">{activeLateVehicles.length}</p>
         </div>
      </div>

      <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
         <table className="w-full text-left">
            <thead>
               <tr className="bg-red-950/20 text-[10px] font-black uppercase tracking-[0.2em] text-red-400 border-b border-white/5">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Vehicle Identity</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Slot</th>
                  <th className="px-6 py-4">Entry Time</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {activeLateVehicles.map(slot => (
                   <tr key={slot.slotId} className="hover:bg-white/[0.02] group">
                       <td className="px-6 py-4">
                           <span className="inline-flex items-center gap-2 px-2 py-1 rounded border border-red-500/20 bg-red-500/10 text-[9px] font-black text-red-500 uppercase tracking-widest">
                               <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                               Overstay
                           </span>
                       </td>
                       <td className="px-6 py-4">
                           <span className="block text-sm font-black text-white font-mono tracking-wide">{slot.occupant?.plateNumber}</span>
                           <span className="text-[10px] text-slate-500 uppercase font-bold">{slot.occupant?.ownerName}</span>
                       </td>
                       <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${slot.occupant?.role === 'VISITOR' ? 'text-primary' : 'text-slate-300'}`}>
                                    {slot.occupant?.role}
                                </span>
                                {slot.occupant?.role === 'STUDENT' && (
                                    <span className="text-[9px] text-red-400 font-bold">{slot.occupant?.studentType}</span>
                                )}
                            </div>
                       </td>
                       <td className="px-6 py-4 text-xs font-mono font-black text-white group-hover:text-primary transition-colors">{slot.slotId}</td>
                       <td className="px-6 py-4">
                           <span className="text-xs font-mono text-slate-400">{slot.occupant?.entryTime}</span>
                       </td>
                   </tr>
               ))}
               {activeLateVehicles.length === 0 && (
                   <tr>
                       <td colSpan={5} className="text-center py-20">
                           <span className="material-icons-round text-4xl text-green-500/50 mb-2">check_circle</span>
                           <p className="text-slate-600 text-xs uppercase font-black tracking-widest">Facility Clear</p>
                           <p className="text-[10px] text-slate-700 mt-1">No unauthorized localites or visitors remaining.</p>
                       </td>
                   </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};
