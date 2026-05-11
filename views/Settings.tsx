
import React, { useState } from 'react';

interface SettingsProps {
  onShowNotification: (message: string, type: 'success' | 'info') => void;
}

export const Settings: React.FC<SettingsProps> = ({ onShowNotification }) => {
  // Mock State for settings
  const [systemName, setSystemName] = useState('UniPark Main Campus');
  const [timeZone, setTimeZone] = useState('UTC+05:30 (IST)');
  const [language, setLanguage] = useState('English (US)');
  const [allocationStrategy, setAllocationStrategy] = useState('Fill Closest to Exit');
  
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [strictEnforcement, setStrictEnforcement] = useState(true);
  const [autoGate, setAutoGate] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  
  const [ocrSensitivity, setOcrSensitivity] = useState(85);

  const handleSave = () => {
      // Simulate API call delay
      onShowNotification('Saving system configuration...', 'info');
      setTimeout(() => {
          onShowNotification('System settings updated successfully.', 'success');
      }, 800);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-[10px] text-slate-500 mb-1 flex items-center gap-2 uppercase tracking-widest font-black">
            <span>System</span>
            <span className="material-icons-round text-[12px]">chevron_right</span>
            <span className="text-primary">Configuration</span>
          </nav>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">System Settings</h1>
        </div>
        <button 
            onClick={handleSave}
            className="bg-primary hover:bg-yellow-400 text-black px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(242,204,13,0.3)] hover:shadow-[0_0_30px_rgba(242,204,13,0.5)] active:scale-95"
        >
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* General Settings */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <span className="material-icons-round text-slate-400">tune</span>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">General Configuration</h3>
            </div>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">System Name</label>
                    <input 
                        type="text" 
                        value={systemName}
                        onChange={(e) => setSystemName(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-3 px-4 text-sm font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Time Zone</label>
                        <select 
                            value={timeZone}
                            onChange={(e) => setTimeZone(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-3 px-4 text-sm font-bold text-white focus:border-primary outline-none appearance-none"
                        >
                            <option>UTC+05:30 (IST)</option>
                            <option>UTC-08:00 (PST)</option>
                            <option>UTC+00:00 (GMT)</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Language</label>
                        <select 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-3 px-4 text-sm font-bold text-white focus:border-primary outline-none appearance-none"
                        >
                            <option>English (US)</option>
                            <option>Hindi</option>
                            <option>Spanish</option>
                        </select>
                     </div>
                </div>
            </div>
        </div>

        {/* Parking System Preferences */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <span className="material-icons-round text-slate-400">local_parking</span>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Parking Logic</h3>
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div>
                        <p className="text-xs font-bold text-white mb-1">Maintenance Mode</p>
                        <p className="text-[10px] text-slate-500">Locks all slots from allocation.</p>
                    </div>
                    <button 
                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${maintenanceMode ? 'bg-red-500' : 'bg-slate-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div>
                        <p className="text-xs font-bold text-white mb-1">Strict Enforcement</p>
                        <p className="text-[10px] text-slate-500">Auto-flag unauthorized vehicles.</p>
                    </div>
                    <button 
                        onClick={() => setStrictEnforcement(!strictEnforcement)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${strictEnforcement ? 'bg-primary' : 'bg-slate-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${strictEnforcement ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>
                
                 <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Default Allocation Strategy</label>
                    <select 
                        value={allocationStrategy}
                        onChange={(e) => setAllocationStrategy(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-3 px-4 text-sm font-bold text-white focus:border-primary outline-none appearance-none"
                    >
                        <option>Fill Closest to Exit</option>
                        <option>Fill Level-by-Level</option>
                        <option>Distribute Evenly</option>
                    </select>
                 </div>
            </div>
        </div>

        {/* Scanner Settings */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <span className="material-icons-round text-slate-400">document_scanner</span>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Scanner & OCR</h3>
            </div>
            
            <div className="space-y-6">
                <div>
                     <label className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">
                        <span>OCR Sensitivity Threshold</span>
                        <span className="text-primary">{ocrSensitivity}%</span>
                     </label>
                     <input 
                        type="range" 
                        min="50" max="100" 
                        value={ocrSensitivity}
                        onChange={(e) => setOcrSensitivity(parseInt(e.target.value))}
                        className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                     />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div>
                        <p className="text-xs font-bold text-white mb-1">Auto-Open Gates</p>
                        <p className="text-[10px] text-slate-500">Open immediately on verified match.</p>
                    </div>
                    <button 
                        onClick={() => setAutoGate(!autoGate)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${autoGate ? 'bg-primary' : 'bg-slate-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${autoGate ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>
            </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <span className="material-icons-round text-slate-400">notifications_active</span>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Alerts & Notifications</h3>
            </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div>
                        <p className="text-xs font-bold text-white mb-1">Email Reports</p>
                        <p className="text-[10px] text-slate-500">Daily summary at 23:59.</p>
                    </div>
                    <button 
                        onClick={() => setEmailAlerts(!emailAlerts)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${emailAlerts ? 'bg-primary' : 'bg-slate-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${emailAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div>
                        <p className="text-xs font-bold text-white mb-1">SMS Critical Alerts</p>
                        <p className="text-[10px] text-slate-500">Instant text on security breach.</p>
                    </div>
                    <button 
                        onClick={() => setSmsAlerts(!smsAlerts)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${smsAlerts ? 'bg-primary' : 'bg-slate-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${smsAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
};
