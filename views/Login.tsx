
import React, { useState } from 'react';
import { AuthUser } from '../types';
import { api } from '../api';

interface LoginProps {
  onLogin: (user: AuthUser) => void;
  onShowNotification: (message: string, type: 'success' | 'info') => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onShowNotification }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login State
  const [email, setEmail] = useState('admin@unipark.com');
  const [password, setPassword] = useState('password123');
  
  // Signup State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [stationId, setStationId] = useState('Main Gate 1');
  const [role, setRole] = useState('SECURITY');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
        const { token, user } = await api.login(email, password);
        localStorage.setItem('unipark_jwt', token);
        onLogin(user);
        onShowNotification(`Welcome back, ${user.name}`, 'success');
    } catch (err: any) {
        setError(err.message || "Authentication failed.");
        onShowNotification("Access Denied", 'info');
    } finally {
        setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
          const { token, user } = await api.signup({
              name: newName,
              email: newEmail,
              password: newPassword,
              role,
              stationId
          });
          localStorage.setItem('unipark_jwt', token);
          onLogin(user);
          onShowNotification("Account Created Successfully", 'success');
      } catch (err: any) {
          setError(err.message || "Signup failed");
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="h-screen w-screen bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans">
       {/* Ambient Background */}
       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
       <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
       <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

       <div className="w-[420px] bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-sm flex flex-col">
           <div className="flex flex-col items-center mb-8">
               <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mb-4 shadow-[0_0_20px_rgba(242,204,13,0.2)]">
                   <span className="material-icons-round text-2xl text-primary">local_parking</span>
               </div>
               <h1 className="text-xl font-black text-white uppercase tracking-tight">UniPark Console</h1>
           </div>

           {/* Tabs */}
           <div className="flex bg-black/50 p-1 rounded-xl mb-6">
               <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white/10 text-white shadow' : 'text-slate-600 hover:text-slate-400'}`}
               >
                   Sign In
               </button>
               <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white/10 text-white shadow' : 'text-slate-600 hover:text-slate-400'}`}
               >
                   Register
               </button>
           </div>

           {isLogin ? (
               <form onSubmit={handleLoginSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                   <div>
                       <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 pl-1">Email</label>
                       <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-700"
                            required
                       />
                   </div>
                   <div>
                       <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 pl-1">Password</label>
                       <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-700"
                            required
                       />
                   </div>

                   {error && <p className="text-red-500 text-xs font-bold bg-red-500/10 p-2 rounded">{error}</p>}

                   <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-4 bg-primary text-black rounded-xl font-black uppercase text-xs tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                   >
                       {isLoading ? 'Processing...' : 'Access Console'}
                   </button>
               </form>
           ) : (
               <form onSubmit={handleSignupSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div>
                       <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 pl-1">Full Name</label>
                       <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg py-2 px-3 text-sm font-bold text-white focus:border-primary outline-none" required />
                   </div>
                   <div>
                       <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 pl-1">Email</label>
                       <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg py-2 px-3 text-sm font-bold text-white focus:border-primary outline-none" required />
                   </div>
                   <div>
                       <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 pl-1">Password</label>
                       <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg py-2 px-3 text-sm font-bold text-white focus:border-primary outline-none" required />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 pl-1">Station ID</label>
                           <input type="text" value={stationId} onChange={(e) => setStationId(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg py-2 px-3 text-sm font-bold text-white focus:border-primary outline-none" />
                       </div>
                       <div>
                           <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 pl-1">Role</label>
                           <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg py-2 px-3 text-sm font-bold text-white focus:border-primary outline-none">
                               <option value="SECURITY">Security</option>
                               <option value="ADMIN">Admin</option>
                               <option value="OPERATOR">Operator</option>
                           </select>
                       </div>
                   </div>

                   {error && <p className="text-red-500 text-xs font-bold bg-red-500/10 p-2 rounded">{error}</p>}

                   <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3 bg-white/10 text-white border border-white/10 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white/20 active:scale-95 transition-all disabled:opacity-50"
                   >
                       {isLoading ? 'Creating...' : 'Create Account'}
                   </button>
               </form>
           )}

           <div className="mt-6 text-center">
               <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                   System v4.2.0 • Secured by UniGuard
               </p>
           </div>
       </div>
    </div>
  );
};
