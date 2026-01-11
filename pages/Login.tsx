
import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types';
import { Truck, Mail, Lock, ShieldCheck, AlertCircle, RefreshCw, HelpCircle, User, Shield } from 'lucide-react';
import { account, databases, DATABASE_ID, COLLECTIONS } from '../services/appwrite';

interface LoginProps {
  onLogin: (profile: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Create session (Using Mock account in LocalStorage mode)
      await account.createEmailPasswordSession(email, password);
      
      const user = await account.get();
      
      try {
        const profileDoc = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.PROFILES,
          user.$id
        );
        onLogin(profileDoc as unknown as UserProfile);
      } catch (dbErr: any) {
        console.error('DB Fetch failed:', dbErr);
        await account.deleteSession('current');
        setError(`Auth successful, but no Profile found in LocalStorage.`);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-500/20 mb-4 animate-bounce">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">CargoTrack</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2 italic">Local Storage Engine</p>
        </div>
        
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden p-8 md:p-10 border border-white">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-sm text-slate-400 font-medium">Sign in to manage your fleet and PODs.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex gap-3 leading-relaxed animate-in fade-in slide-in-from-top duration-300">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all outline-none text-sm font-semibold"
                  placeholder="name@company.com"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all outline-none text-sm font-semibold"
                  placeholder="••••••••"
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-2 text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Helper */}
          <div className="mt-8 p-5 bg-blue-50/50 rounded-3xl border border-blue-100">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <HelpCircle size={14} /> Demo Credentials (Click to fill)
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => fillDemo('admin@cargo.com')}
                className="flex items-center justify-between p-3 bg-white border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white group transition-all"
              >
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-blue-500 group-hover:text-white" />
                  <span className="text-xs font-bold">Admin Portal</span>
                </div>
                <span className="text-[10px] font-mono opacity-60">admin@cargo.com</span>
              </button>
              
              <button 
                onClick={() => fillDemo('rajesh@cargo.com')}
                className="flex items-center justify-between p-3 bg-white border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white group transition-all"
              >
                <div className="flex items-center gap-2">
                  <User size={14} className="text-blue-500 group-hover:text-white" />
                  <span className="text-xs font-bold">Driver App</span>
                </div>
                <span className="text-[10px] font-mono opacity-60">rajesh@cargo.com</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">
              Secure Cloud Access • QGO Cargo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
