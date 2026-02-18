
import React, { useState } from 'react';
import { AuthUser } from '../types';

interface ProfileProps {
  user: AuthUser;
  onLogout: () => void;
  onShowNotification: (message: string, type: 'success' | 'info') => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout, onShowNotification }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for edits, initialized with real user data
  const [profileData, setProfileData] = useState({
      phone: '+1 (555) 091-2233', // Extended data not in AuthUser for now
      shift: 'Night Watch (22:00 - 06:00)',
      clearance: 'Level 4 (High Security)'
  });

  const handleToggleEdit = () => {
    if (isEditing) {
        onShowNotification("Profile changes saved locally.", 'success');
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (field: string, value: string) => {
      setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityAction = (action: string) => {
      onShowNotification(`Module Loaded: ${action}`, 'info');
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 bg-[#0a0a0a]">
       {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-[10px] text-slate-500 mb-1 flex items-center gap-2 uppercase tracking-widest font-black">
            <span>Identity</span>
            <span className="material-icons-round text-[12px]">chevron_right</span>
            <span className="text-primary">Profile</span>
          </nav>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Officer Profile</h1>
        </div>
        <button 
            onClick={onLogout}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] flex items-center gap-2"
        >
          <span className="material-icons-round text-sm">logout</span>
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Identity Card */}
          <div className="lg:col-span-1 bg-[#111] border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
              
              <div className="w-32 h-32 rounded-2xl bg-[#0a0a0a] border-2 border-primary/30 p-1 mb-6 shadow-[0_0_30px_rgba(242,204,13,0.15)] group relative cursor-pointer overflow-hidden">
                  <img src={user.avatarUrl} alt="Officer" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="material-icons-round text-white">camera_alt</span>
                  </div>
              </div>
              
              <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">{user.name}</h2>
              
              <div className="flex items-center gap-2 mb-6">
                  <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded text-[10px] font-black text-primary uppercase tracking-widest">
                      {user.role}
                  </span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {user.stationId}
                  </span>
              </div>

              <div className="w-full pt-6 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Status</span>
                      <span className="flex items-center gap-2 text-green-500 font-black uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          Active
                      </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Session ID</span>
                      <span className="text-white font-mono opacity-50">#{user.id.split('-').pop()}</span>
                  </div>
              </div>
          </div>

          {/* Details & Actions */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Personal Info */}
              <div className="bg-[#111] border border-white/5 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">Personal Information</h3>
                      <button 
                        onClick={handleToggleEdit}
                        className={`text-xs font-black uppercase tracking-widest transition-colors ${isEditing ? 'text-green-500 hover:text-green-400' : 'text-primary hover:text-white'}`}
                      >
                          {isEditing ? 'Save Details' : 'Edit Details'}
                      </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                      {/* Read Only Auth Fields */}
                      <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Full Name</p>
                          <p className="text-sm font-bold text-white">{user.name}</p>
                      </div>
                      <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">System ID</p>
                          <p className="text-sm font-bold text-white font-mono">{user.id}</p>
                      </div>
                      <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Email Address</p>
                          <p className="text-sm font-bold text-white">{user.email}</p>
                      </div>

                      {/* Editable Fields */}
                      {[
                        { label: 'Phone Contact', val: profileData.phone, key: 'phone' },
                        { label: 'Assigned Shift', val: profileData.shift, key: 'shift' },
                        { label: 'Clearance Level', val: profileData.clearance, key: 'clearance' },
                      ].map((item) => (
                          <div key={item.key}>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{item.label}</p>
                              {isEditing ? (
                                  <input 
                                    type="text" 
                                    value={item.val}
                                    onChange={(e) => handleChange(item.key, e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                  />
                              ) : (
                                  <p className="text-sm font-bold text-white">{item.val}</p>
                              )}
                          </div>
                      ))}
                  </div>
              </div>

              {/* Security Actions */}
              <div className="bg-[#111] border border-white/5 rounded-2xl p-8 shadow-xl">
                   <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6">Security & Access</h3>
                   
                   <div className="flex items-center gap-4">
                       <button 
                        onClick={() => handleSecurityAction("Password Management")}
                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all hover:border-primary/50 active:scale-95"
                       >
                           Change Password
                       </button>
                       <button 
                        onClick={() => handleSecurityAction("Access Audit Logs")}
                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all hover:border-primary/50 active:scale-95"
                       >
                           View Access Logs
                       </button>
                       <button 
                        onClick={() => handleSecurityAction("Two-Factor Authentication")}
                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all hover:border-primary/50 active:scale-95"
                       >
                           2FA Settings
                       </button>
                   </div>
              </div>

          </div>
      </div>
    </div>
  );
};
