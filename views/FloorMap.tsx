
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { LEVELS, MOCK_GATE_VISITOR } from '../constants';
import { ParkingSlot, Vehicle, Role, StudentType } from '../types';

interface FloorMapProps {
  showScanSidebar?: boolean;
  slotsByLevel: Record<number, ParkingSlot[]>;
  onAllocate: (slotId: string, vehicle: Vehicle) => void;
  onRelease: (slotId: string) => void;
  onShowNotification: (message: string, type: 'success' | 'info') => void;
}

const LiftBlock = ({ label }: { label: string }) => (
  <div className="w-20 h-40 bg-[#151515] border border-white/10 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl my-auto shrink-0">
    <div className="absolute inset-x-0 top-0 h-1 bg-primary/30"></div>
    <span className="material-icons-round text-2xl text-slate-600 group-hover:text-primary transition-colors mb-2">elevator</span>
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center leading-tight">{label}</span>
  </div>
);

const DrivingLane = ({ direction = 'left' }: { direction?: 'left' | 'right' }) => (
  <div className="h-12 w-full flex items-center justify-center relative overflow-hidden opacity-30 my-1">
     <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white border-t border-dashed border-white/40 w-full"></div>
     <div className="flex justify-around w-full px-12">
        {Array.from({length: 3}).map((_, i) => (
           <span key={i} className={`material-icons-round text-white/40 text-lg ${direction === 'left' ? '-rotate-180' : ''}`}>
             arrow_right_alt
           </span>
        ))}
     </div>
  </div>
);

const getSlotColorClasses = (slot: ParkingSlot, selectedLevelId: number, selectedSlotId: string | null) => {
    const isLevel1 = selectedLevelId === 1;
    const isVip = slot.category === 'VIP'; 
    const isOccupied = slot.status === 'OCCUPIED';
    const isReserved = slot.status === 'RESERVED'; 
    const isSelected = slot.slotId === selectedSlotId;

    let classes = "relative transition-all duration-300 rounded-lg shadow-lg border flex items-center justify-center ";

    if (isReserved) {
      return classes + "bg-primary border-primary text-black z-20 animate-pulse shadow-[0_0_15px_rgba(242,204,13,0.8)]";
    }
    if (isSelected) {
      classes += "ring-2 ring-white z-30 scale-110 ";
    }

    if (isLevel1 && isVip) {
      if (isOccupied) return classes + "bg-white border-white text-black shadow-[0_0_10px_rgba(255,255,255,0.3)]";
      return classes + "bg-blue-600 border-blue-500 text-white shadow-[0_0_8px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:shadow-[0_0_12px_rgba(37,99,235,0.6)]";
    } else {
      if (isOccupied) return classes + "bg-red-600 border-red-500 text-white shadow-[0_0_8px_rgba(220,38,38,0.4)]";
      return classes + "bg-emerald-500 border-emerald-400 text-black font-black shadow-[0_0_8px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:shadow-[0_0_12px_rgba(16,185,129,0.6)]";
    }
};

const ParkingRow: React.FC<{
  slots: ParkingSlot[];
  rowIndex: number;
  wing: 'west' | 'east';
  selectedLevelId: number;
  selectedSlotId: string | null;
  onSlotClick: (slot: ParkingSlot) => void;
}> = ({ slots, rowIndex, wing, selectedLevelId, selectedSlotId, onSlotClick }) => (
  <div className="flex flex-col w-full">
    <div className="grid grid-cols-10 gap-3 px-2">
      {slots.map((slot) => (
        <div 
          key={slot.slotId}
          onClick={() => onSlotClick(slot)}
          className={`${getSlotColorClasses(slot, selectedLevelId, selectedSlotId)} aspect-[4/5] cursor-pointer group`}
        >
          {slot.status === 'OCCUPIED' && slot.occupant && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 bg-[#0e0e0e]/95 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 translate-y-2 group-hover:translate-y-0">
               <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0e0e0e] border-r border-b border-white/10 rotate-45 transform"></div>
               <div className="relative z-10 flex flex-col gap-1.5 text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                     <span className="text-[8px] font-black text-primary uppercase tracking-widest">Parked</span>
                     <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  </div>
                  <div>
                     <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Plate</span>
                     <span className="block text-xs font-mono font-black text-white">{slot.occupant.plateNumber}</span>
                  </div>
               </div>
            </div>
          )}
          <span className="relative z-10 text-[10px] font-black select-none tracking-tight">
            {slot.slotNumber}
          </span>
        </div>
      ))}
    </div>
    <DrivingLane direction={wing === 'west' ? (rowIndex % 2 === 0 ? 'right' : 'left') : (rowIndex % 2 === 0 ? 'left' : 'right')} />
  </div>
);

// Generator for next vehicle at gate
const generateNextVisitor = (): Vehicle => {
    const names = ['Liam Patel', 'Sophia Rodriguez', 'Noah Kim', 'Olivia Smith'];
    const plates = ['KA-01-HG-9988', 'MH-02-ZZ-1122', 'DL-03-XX-3344'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomPlate = plates[Math.floor(Math.random() * plates.length)];
    const roles: Role[] = ['STUDENT', 'FACULTY', 'VIP', 'VISITOR'];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    
    // Generate valid student type if role is student
    let studentType: StudentType | undefined;
    if (randomRole === 'STUDENT') {
        studentType = Math.random() > 0.5 ? 'LOCALITE' : 'HOSTEL';
    }

    return {
        ...MOCK_GATE_VISITOR,
        vehicleId: `VEH-${Date.now()}`,
        ownerName: randomName,
        plateNumber: randomPlate,
        role: randomRole,
        studentType: studentType,
        photoUrl: `https://ui-avatars.com/api/?name=${randomName.replace(' ', '+')}&background=random`,
        entryTime: new Date().toLocaleTimeString('en-US', {hour12: false}),
        vehicleType: '4-Wheeler',
    };
};

export const FloorMap: React.FC<FloorMapProps> = ({ 
  showScanSidebar = false, 
  slotsByLevel, 
  onAllocate,
  onRelease,
  onShowNotification
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState(2); 
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isScannerExpanded, setIsScannerExpanded] = useState(false);
  const [gateVisitor, setGateVisitor] = useState<Vehicle>(generateNextVisitor()); // Start with random
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  const [manualForm, setManualForm] = useState<{ plate: string, name: string, phone: string, role: Role, studentType: StudentType }>({ 
      plate: '', name: '', phone: '', role: 'VISITOR', studentType: 'LOCALITE' 
  });
  
  const [useLiveCamera, setUseLiveCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentLevelSlots = slotsByLevel[selectedLevelId] || [];
  const selectedSlot = currentLevelSlots.find(s => s.slotId === selectedSlotId);

  const displayOccupant = useMemo(() => {
    if (selectedSlot && selectedSlot.occupant) {
        return selectedSlot.occupant;
    }
    return gateVisitor;
  }, [selectedSlot, gateVisitor]);

  const { westWingRows, eastWingRows } = useMemo(() => {
    const chunk = (arr: ParkingSlot[], size: number) => 
      Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
      );
    const midpoint = Math.ceil(currentLevelSlots.length / 2);
    return {
      westWingRows: chunk(currentLevelSlots.slice(0, midpoint), 10),
      eastWingRows: chunk(currentLevelSlots.slice(midpoint), 10)
    };
  }, [currentLevelSlots]);

  const handleConfirmAllocation = () => {
      if (!selectedSlot) return;
      onAllocate(selectedSlot.slotId, gateVisitor);
      setSelectedSlotId(null);
      setTimeout(() => {
          setGateVisitor(generateNextVisitor());
      }, 1500);
  };

  const handleConfirmExit = () => {
      if (!selectedSlot) return;
      onRelease(selectedSlot.slotId);
      setSelectedSlotId(null);
  };

  const handleManualSubmit = () => {
      if (!manualForm.plate || !manualForm.phone) {
          onShowNotification("Plate & Phone required.", 'info');
          return;
      }
      
      // Auto-find slot in appropriate level
      let targetLevel = 2;
      if (manualForm.role === 'VISITOR') targetLevel = 5;
      else if (manualForm.role === 'VIP') targetLevel = 1;
      
      const levelSlots = slotsByLevel[targetLevel] || [];
      const freeSlot = levelSlots.find(s => s.status === 'AVAILABLE');
      
      if (freeSlot) {
          const newVehicle: Vehicle = {
              vehicleId: `MAN-${Date.now()}`,
              plateNumber: manualForm.plate,
              ownerName: manualForm.name || 'Unknown',
              phoneNumber: manualForm.phone,
              role: manualForm.role,
              studentType: manualForm.role === 'STUDENT' ? manualForm.studentType : undefined,
              photoUrl: 'https://ui-avatars.com/api/?name=Manual+Entry',
              vehicleType: 'Manual',
              entryTime: new Date().toLocaleTimeString('en-US', {hour12: false})
          };
          
          onAllocate(freeSlot.slotId, newVehicle);
          setShowManualEntry(false);
          setManualForm({ plate: '', name: '', phone: '', role: 'VISITOR', studentType: 'LOCALITE' });
          if (selectedLevelId !== targetLevel) setSelectedLevelId(targetLevel);
      } else {
          onShowNotification(`No slots on Level ${targetLevel}`, 'info');
      }
  };

  return (
    <div className="flex h-full w-full bg-[#0b0c10] overflow-hidden">
      {/* Scanner Sidebar */}
      {showScanSidebar && (
        <aside className="w-[420px] bg-[#0f0f0f] border-r border-white/5 flex flex-col z-50 shadow-2xl relative shrink-0 transition-all duration-300">
           <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {/* Header & Camera Controls (Simplified for Brevity) */}
              <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gate Terminal A1</span>
                  <button onClick={() => setShowManualEntry(true)} className="text-[9px] bg-primary/10 text-primary px-3 py-1 rounded border border-primary/20 hover:bg-primary/20 font-bold uppercase">Manual Entry</button>
              </div>

              {/* Scanner Feed */}
              <div className="relative bg-black rounded-2xl overflow-hidden border border-white/10 shadow-lg h-48 mb-6 group cursor-pointer" onClick={() => setIsScannerExpanded(!isScannerExpanded)}>
                   <img src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60" />
                   <div className="absolute inset-0 flex items-center justify-center">
                       <div className="bg-black/80 backdrop-blur border border-primary/50 px-4 py-2 rounded text-primary font-mono text-lg tracking-widest shadow-[0_0_20px_rgba(242,204,13,0.3)]">
                           {displayOccupant.plateNumber}
                       </div>
                   </div>
                   <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/50 animate-[scan_3s_linear_infinite]"></div>
              </div>

              {/* Vehicle Card */}
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-start gap-4 mb-4">
                      <img src={displayOccupant.photoUrl} className="w-12 h-12 rounded bg-slate-800 object-cover" />
                      <div>
                          <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold ${displayOccupant.role === 'VIP' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' : 'text-primary border-primary/20 bg-primary/10'}`}>{displayOccupant.role}</span>
                          <h3 className="text-lg font-black text-white">{displayOccupant.ownerName}</h3>
                          <div className="flex flex-col">
                              <p className="text-[10px] text-slate-500">{displayOccupant.vehicleType}</p>
                              {displayOccupant.role === 'STUDENT' && (
                                  <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-wider">{displayOccupant.studentType}</p>
                              )}
                          </div>
                      </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {!selectedSlot || selectedSlot.status === 'AVAILABLE' ? (
                      <button onClick={() => selectedSlot ? handleConfirmAllocation() : onShowNotification('Select a slot on the map first', 'info')} className="w-full py-3 bg-primary text-black rounded-lg font-black uppercase text-xs hover:brightness-110 transition-all">
                          {selectedSlot ? 'Allocate to Selected Slot' : 'Select Slot on Map'}
                      </button>
                  ) : (
                      <div className="p-3 bg-white/5 rounded text-center text-xs text-slate-400 font-bold uppercase">Slot Occupied</div>
                  )}
              </div>
           </div>
        </aside>
      )}

      {/* Map Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
         <header className="h-20 bg-[#0e0e0e] border-b border-white/5 flex items-center justify-between px-8 z-40 shadow-xl shrink-0">
             <div className="flex items-center gap-6">
                 <select value={selectedLevelId} onChange={(e) => setSelectedLevelId(parseInt(e.target.value))} className="bg-[#151515] text-white text-sm font-bold pl-4 pr-8 py-2 rounded-lg border border-white/10 outline-none">
                     {LEVELS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                 </select>
                 <div className="flex gap-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                     <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Open</span>
                     <span className="flex items-center gap-2"><span className="w-2 h-2 bg-red-600 rounded-full"></span> Occupied</span>
                 </div>
             </div>
             <div className="px-4 py-2 bg-[#151515] rounded border border-white/5">
                 <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block">Available</span>
                 <span className="text-xl font-mono font-black text-primary">{currentLevelSlots.filter(s => s.status === 'AVAILABLE').length}</span>
             </div>
         </header>

         <div className="flex-1 overflow-auto custom-scrollbar bg-[#0b0c10] p-8">
             <div className="min-w-[1200px] mx-auto flex gap-6 justify-center">
                 <div className="flex flex-col gap-32 py-20 sticky left-0 z-10"><LiftBlock label="Lift A" /></div>
                 <div className="flex-1 flex gap-12 max-w-[1600px]">
                     <div className="flex-1 bg-[#0f0f0f] border border-white/5 rounded-3xl p-6 relative">
                         <div className="absolute -top-3 left-8 bg-[#1a1a1a] px-4 py-1 text-[9px] font-black text-slate-400 uppercase rounded border border-white/5">Zone A</div>
                         {westWingRows.map((row, idx) => <ParkingRow key={`w-${idx}`} slots={row} rowIndex={idx} wing="west" selectedLevelId={selectedLevelId} selectedSlotId={selectedSlotId} onSlotClick={(s) => setSelectedSlotId(s.slotId === selectedSlotId ? null : s.slotId)} />)}
                     </div>
                     <div className="flex-1 bg-[#0f0f0f] border border-white/5 rounded-3xl p-6 relative">
                         <div className="absolute -top-3 right-8 bg-[#1a1a1a] px-4 py-1 text-[9px] font-black text-slate-400 uppercase rounded border border-white/5">Zone B</div>
                         {eastWingRows.map((row, idx) => <ParkingRow key={`e-${idx}`} slots={row} rowIndex={idx} wing="east" selectedLevelId={selectedLevelId} selectedSlotId={selectedSlotId} onSlotClick={(s) => setSelectedSlotId(s.slotId === selectedSlotId ? null : s.slotId)} />)}
                     </div>
                 </div>
                 <div className="flex flex-col gap-32 py-20 sticky right-0 z-10"><LiftBlock label="Lift B" /></div>
             </div>
         </div>

         {/* Allocation Modal */}
         {selectedSlot && selectedSlot.status === 'AVAILABLE' && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
                 <div className="w-[480px] bg-[#141414] border border-white/10 rounded-3xl p-8 relative shadow-2xl">
                     <button onClick={() => setSelectedSlotId(null)} className="absolute top-5 right-5 text-slate-500 hover:text-white"><span className="material-icons-round">close</span></button>
                     <h2 className="text-2xl font-black text-white uppercase mb-6">Confirm Allocation</h2>
                     <div className="bg-black/40 p-5 rounded-2xl border border-white/5 mb-6">
                         <p className="text-sm text-slate-300">Assign <strong>{gateVisitor.plateNumber}</strong> to <strong className="text-primary">Slot {selectedSlot.slotNumber}</strong>?</p>
                     </div>
                     <button onClick={handleConfirmAllocation} className="w-full py-4 bg-primary text-black rounded-xl font-black uppercase text-xs hover:brightness-110 shadow-[0_0_20px_rgba(242,204,13,0.4)]">Confirm & Assign</button>
                 </div>
             </div>
         )}

         {/* Exit Modal */}
         {selectedSlot && selectedSlot.status === 'OCCUPIED' && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
                 <div className="w-[480px] bg-[#141414] border border-white/10 rounded-3xl p-8 relative shadow-2xl">
                     <button onClick={() => setSelectedSlotId(null)} className="absolute top-5 right-5 text-slate-500 hover:text-white"><span className="material-icons-round">close</span></button>
                     <h2 className="text-2xl font-black text-white uppercase mb-6">Process Exit</h2>
                     <div className="bg-black/40 p-5 rounded-2xl border border-white/5 mb-6">
                         <p className="text-sm text-slate-300">Release vehicle <strong>{selectedSlot.occupant?.plateNumber}</strong> from <strong className="text-red-500">Slot {selectedSlot.slotNumber}</strong>?</p>
                     </div>
                     <button onClick={handleConfirmExit} className="w-full py-4 bg-red-600 text-white rounded-xl font-black uppercase text-xs hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]">Confirm Exit</button>
                 </div>
             </div>
         )}

         {/* Manual Entry Modal */}
         {showManualEntry && (
             <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in">
                 <div className="w-[400px] bg-[#141414] border border-white/10 rounded-2xl p-8 relative">
                     <button onClick={() => setShowManualEntry(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><span className="material-icons-round">close</span></button>
                     <h2 className="text-xl font-black text-white uppercase mb-6">Manual Entry</h2>
                     <div className="space-y-4">
                         <input type="text" placeholder="PLATE NUMBER" value={manualForm.plate} onChange={e => setManualForm({...manualForm, plate: e.target.value})} className="w-full bg-black border border-white/10 rounded p-3 text-white font-mono font-bold outline-none focus:border-primary" />
                         <input type="text" placeholder="PHONE" value={manualForm.phone} onChange={e => setManualForm({...manualForm, phone: e.target.value})} className="w-full bg-black border border-white/10 rounded p-3 text-white font-mono font-bold outline-none focus:border-primary" />
                         
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Category</p>
                            <div className="flex gap-2">
                                {['VISITOR', 'VIP', 'STUDENT'].map(r => (
                                    <button key={r} onClick={() => setManualForm({...manualForm, role: r as Role})} className={`flex-1 py-2 text-[9px] font-black uppercase border rounded ${manualForm.role === r ? 'bg-primary text-black border-primary' : 'border-white/10 text-slate-500'}`}>{r}</button>
                                ))}
                            </div>
                         </div>
                         
                         {manualForm.role === 'STUDENT' && (
                             <div className="animate-in fade-in slide-in-from-top-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Student Type</p>
                                <div className="flex gap-2">
                                    {['LOCALITE', 'HOSTEL'].map(t => (
                                        <button key={t} onClick={() => setManualForm({...manualForm, studentType: t as StudentType})} className={`flex-1 py-2 text-[9px] font-black uppercase border rounded ${manualForm.studentType === t ? 'bg-blue-500 text-white border-blue-500' : 'border-white/10 text-slate-500'}`}>{t}</button>
                                    ))}
                                </div>
                             </div>
                         )}
                         
                         <button onClick={handleManualSubmit} className="w-full py-3 bg-primary text-black rounded font-black uppercase text-xs mt-4">Submit Entry</button>
                     </div>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};
