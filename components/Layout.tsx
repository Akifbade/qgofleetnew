
import React from 'react';
import { UserRole, UserProfile } from '../types';
import { 
  LayoutDashboard, Map, Package, Users, Settings, LogOut, 
  Monitor, History, Bell, Search, Zap, Command, ChevronRight
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Liquid Glass Sidebar */}
      <aside className="hidden md:flex flex-col w-28 lg:w-80 h-screen sticky top-0 px-6 py-10 items-center lg:items-stretch z-[100]">
        <div className="flex items-center gap-4 px-4 mb-14">
          <div className="w-14 h-14 bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <Command className="text-blue-400 w-8 h-8" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Cargo<span className="text-blue-500">Pro</span></h1>
            <p className="text-[8px] font-black text-slate-500 tracking-[0.4em] uppercase">Liquid Dynamics</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          <NavItem icon={<LayoutDashboard />} label="Intelligence" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          {user.role === UserRole.ADMIN ? (
            <>
              <NavItem icon={<Monitor />} label="Mission Control" active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} />
              <NavItem icon={<Map />} label="Fleet Geofence" active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
              <NavItem icon={<Package />} label="Dispatch Core" active={activeTab === 'pods'} onClick={() => setActiveTab('pods')} />
              <NavItem icon={<Users />} label="Fleet Units" active={activeTab === 'drivers'} onClick={() => setActiveTab('drivers')} />
            </>
          ) : (
            <>
              <NavItem icon={<Zap />} label="Active Stream" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <NavItem icon={<History />} label="Registry" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
            </>
          )}
          <div className="pt-6 mt-6 border-t border-white/5">
            <NavItem icon={<Settings />} label="Terminal Config" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </div>
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
           <div className="glass-panel p-4 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-blue-400 border border-white/10">{user.name.charAt(0)}</div>
              <div className="hidden lg:block overflow-hidden">
                <p className="text-xs font-black text-white truncate">{user.name}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{user.role}</p>
              </div>
           </div>
           <button onClick={onLogout} className="flex items-center gap-4 w-full p-4 text-slate-500 hover:text-red-400 transition-all group">
             <LogOut size={20} />
             <span className="hidden lg:block font-black text-[10px] uppercase tracking-widest">Terminate Session</span>
           </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col min-w-0 pb-28 md:pb-0 z-10">
        <header className="h-24 flex items-center justify-between px-6 md:px-12 sticky top-0 z-[100] bg-transparent">
          <div className="flex items-center gap-6">
            <div className="md:hidden w-12 h-12 glass-panel flex items-center justify-center">
              <Command size={24} className="text-blue-500" />
            </div>
            <div className="relative hidden md:block group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
              <input type="text" placeholder="Scan System..." className="pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold w-72 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-white outline-none" />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden lg:flex items-center gap-3 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
               <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Link v5.0 Active</span>
            </div>
            <button className="relative p-3 glass-panel !rounded-2xl text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-12 overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Liquid Glass Mobile Bottom Dock */}
      <nav className="md:hidden fixed bottom-8 left-8 right-8 h-20 glass-panel !rounded-[2.5rem] !bg-black/60 z-[2000] flex items-center justify-around px-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10">
        <MobileTab icon={<LayoutDashboard />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileTab icon={user.role === UserRole.ADMIN ? <Monitor /> : <History />} active={activeTab === 'monitor' || activeTab === 'history'} onClick={() => setActiveTab(user.role === UserRole.ADMIN ? 'monitor' : 'history')} />
        <MobileTab icon={<Map />} active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
        <MobileTab icon={<Settings />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-5 px-6 py-4.5 rounded-[2rem] transition-all w-full text-left group relative ${active ? 'glass-panel !bg-white/10 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-500 rounded-r-full shadow-[0_0_15px_#3b82f6]"></div>}
    <span className={`${active ? 'text-blue-400' : 'group-hover:text-blue-500'} transition-colors`}>{React.cloneElement(icon, { size: 24 })}</span>
    <span className="hidden lg:block font-black text-sm tracking-tight">{label}</span>
  </button>
);

const MobileTab = ({ icon, active, onClick }: any) => (
  <button onClick={onClick} className={`p-4 rounded-full transition-all duration-500 ${active ? 'bg-blue-600 text-white -translate-y-8 shadow-[0_15px_30px_rgba(37,99,235,0.4)] scale-110' : 'text-slate-600'}`}>
    {React.cloneElement(icon, { size: 28 })}
  </button>
);
