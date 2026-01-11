
import React, { useState, useEffect } from 'react';
import { UserProfile, PODEntry, PODStatus, LocationHistory, UserRole } from '../types';
import TrackingMap from '../components/TrackingMap';
import { PODModal } from '../components/PODModal';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '../services/appwrite';
import { 
  Plus, Truck, Clock, CheckCircle, Activity, Signal, Battery, 
  MapPin, History, X, Smartphone, Wifi, Gauge, MoreVertical,
  Navigation, Timer, Building2, Globe, Shield, Zap, ChevronRight
} from 'lucide-react';

export const AdminDashboard: React.FC<{user: UserProfile, activeTab: string, setActiveTab: any}> = ({ activeTab, setActiveTab }) => {
  const [drivers, setDrivers] = useState<UserProfile[]>([]);
  const [pods, setPods] = useState<PODEntry[]>([]);
  const [history, setHistory] = useState<LocationHistory[]>([]);
  const [isPODModalOpen, setIsPODModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<UserProfile | null>(null);

  const fetchData = async () => {
    try {
      const driverRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [Query.equal('role', UserRole.DRIVER)]);
      setDrivers(driverRes.documents as unknown as UserProfile[]);
      
      const podRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PODS, [Query.orderDesc('createdAt')]);
      setPods(podRes.documents as unknown as PODEntry[]);

      if (selectedDriver) {
        const histRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LOCATION_HISTORY, [
          Query.equal('driverId', selectedDriver.$id), 
          Query.orderDesc('timestamp'), 
          Query.limit(50)
        ]);
        setHistory(histRes.documents as unknown as LocationHistory[]);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
    const inv = setInterval(fetchData, 5000);
    return () => clearInterval(inv);
  }, [selectedDriver]);

  const handleOpenPath = (driver: UserProfile) => {
    setHistory([]); // Clear previous to prevent flicker
    setSelectedDriver(driver);
  };

  if (activeTab === 'dashboard') {
    return (
      <div className="space-y-12 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Command <span className="text-blue-500">Center</span></h2>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3 ml-1">Quantum Telemetry Node 04</p>
          </div>
          <button onClick={() => setIsPODModalOpen(true)} className="group relative px-10 py-5 glass-panel !bg-blue-600/20 !rounded-[2rem] font-black text-blue-400 hover:!bg-blue-600 hover:text-white transition-all overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              <Plus size={20}/> <span className="uppercase text-[11px] tracking-widest">Initiate Dispatch</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-purple-600/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          <MetricCard icon={<Truck />} label="Active Units" value={drivers.filter(d => d.isOnline).length} color="blue" />
          <MetricCard icon={<Clock />} label="Mission In-Flight" value={pods.filter(p => p.status === PODStatus.IN_TRANSIT).length} color="orange" />
          <MetricCard icon={<CheckCircle />} label="Successful Links" value={pods.filter(p => p.status === PODStatus.DELIVERED).length} color="green" />
          <MetricCard icon={<Activity />} label="Link Signal" value="99.9%" color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 h-[500px] md:h-[650px] glass-panel overflow-hidden relative border-white/5 shadow-2xl">
            <TrackingMap drivers={drivers} />
          </div>
          <div className="space-y-8">
            <div className="glass-panel p-10 relative overflow-hidden group">
               <div className="relative z-10">
                 <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8">Anomaly Alerts</h3>
                 <div className="space-y-6">
                   {drivers.filter(d => d.batteryLevel && d.batteryLevel < 30).map(d => (
                     <div key={d.$id} className="flex items-center justify-between p-5 bg-red-500/5 border border-red-500/20 rounded-[1.5rem] animate-pulse">
                        <div className="flex items-center gap-4"><Smartphone size={18} className="text-red-500"/><span className="text-xs font-black text-white">{d.name}</span></div>
                        <span className="text-[10px] font-black text-red-500 uppercase">{d.batteryLevel}% CRT</span>
                     </div>
                   ))}
                   {drivers.filter(d => d.batteryLevel && d.batteryLevel < 30).length === 0 && (
                     <p className="text-center py-14 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">All Units Stable</p>
                   )}
                 </div>
               </div>
               <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
            </div>

            <div className="glass-panel p-10">
               <div className="flex items-center justify-between mb-10">
                 <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Mission Log</h3>
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
               </div>
               <div className="space-y-8">
                  {pods.slice(0, 4).map(p => (
                    <div key={p.$id} className="flex items-start gap-6 group cursor-pointer">
                      <div className="w-2 h-10 bg-slate-800 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                      <div>
                        <p className="text-[11px] font-black text-white uppercase tracking-wider">{p.awbNumber}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase truncate max-w-[180px] mt-1">{p.destination}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
        {isPODModalOpen && <PODModal drivers={drivers} onClose={() => setIsPODModalOpen(false)} onSubmit={(d: any) => databases.createDocument(DATABASE_ID, COLLECTIONS.PODS, 'unique', d).then(fetchData).then(() => setIsPODModalOpen(false))} />}
      </div>
    );
  }

  if (activeTab === 'drivers') {
    return (
      <div className="space-y-12 pb-32">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Personnel Units</h2>
          <button className="glass-panel px-8 py-4 !bg-white/5 text-xs font-black uppercase tracking-widest hover:!bg-white/10 transition-all">Add Personnel</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {drivers.map(d => (
            <div key={d.$id} className="glass-panel p-10 group relative overflow-hidden hover:scale-[1.02] transition-transform">
              <div className="flex justify-between items-start mb-10">
                <div className="w-20 h-20 bg-slate-900 border border-white/5 rounded-3xl flex items-center justify-center text-4xl font-black text-slate-700 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all shadow-inner">{d.name.charAt(0)}</div>
                <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] ${d.isOnline ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-900 text-slate-600'}`}>{d.isOnline ? 'Connected' : 'Dormant'}</div>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">{d.name}</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-10">{d.email}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                <StatusPill label="Energy" val={`${d.batteryLevel || 100}%`} icon={<Battery size={14}/>}/>
                <StatusPill label="Bandwidth" val={d.signalStrength || 'Optimum'} icon={<Wifi size={14}/>}/>
                <StatusPill label="Window" val={`${d.dutyStart}-${d.dutyEnd}`} icon={<Clock size={14}/>}/>
                <StatusPill label="Vector" val={d.isOnline ? '32' : '0'} icon={<Gauge size={14}/>}/>
              </div>

              <div className="flex gap-4">
                 <button className="flex-1 py-4 glass-panel !bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Configure</button>
                 <button onClick={() => handleOpenPath(d)} className="flex-1 py-4 glass-panel !bg-blue-600/20 !border-blue-500/30 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:!bg-blue-600 hover:text-white transition-all">Mission Path</button>
              </div>
            </div>
          ))}
        </div>

        {/* Path Analysis Modal (Holographic Liquid Style) */}
        {selectedDriver && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10 bg-[#020617]/80 backdrop-blur-3xl animate-in fade-in duration-300">
            <div className="glass-panel !bg-black/40 w-full max-w-7xl h-full md:h-[85vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(37,99,235,0.1)] border-white/5">
               <div className="p-8 md:p-12 border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center font-black text-blue-500 text-3xl uppercase border border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.2)]">{selectedDriver.name.charAt(0)}</div>
                    <div>
                      <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{selectedDriver.name} <span className="text-blue-500">Telemetry</span></h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">24H Movement registry • Real-time stream</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedDriver(null)} className="p-4 glass-panel !rounded-full !bg-white/5 text-slate-400 hover:text-white transition-all hover:scale-110"><X size={24}/></button>
               </div>
               
               <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                 <div className="w-full lg:w-[400px] border-r border-white/5 overflow-y-auto p-8 md:p-10 custom-scrollbar space-y-12">
                    <div className="relative pl-12 space-y-12">
                      <div className="absolute left-[23px] top-4 bottom-4 w-[1px] border-l border-dashed border-white/10"></div>
                      
                      {history.length > 0 ? history.map((h, i) => (
                        <div key={h.$id} className="relative flex flex-col gap-2">
                          <div className={`absolute -left-[48px] top-1 w-10 h-10 rounded-2xl flex items-center justify-center z-10 border shadow-2xl transition-all ${i === 0 ? 'bg-blue-600 text-white border-blue-400 animate-pulse' : 'bg-slate-900 text-slate-600 border-white/5'}`}>
                            {i === 0 ? <Navigation size={18} /> : <div className="w-2 h-2 bg-slate-700 rounded-full"></div>}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</p>
                            <div className="flex items-center gap-4 mt-2">
                               <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Gauge size={10} className="inline mr-1" /> {h.speed || 0} km/h</div>
                               <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Activity size={10} className="inline mr-1" /> Vector-OK</div>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center opacity-20">
                          <History size={64} className="mb-6" />
                          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Querying Registry...</p>
                        </div>
                      )}
                    </div>
                 </div>
                 
                 <div className="flex-1 relative bg-black/40">
                    <TrackingMap drivers={[selectedDriver]} history={history} selectedDriverId={selectedDriver.$id} />
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Monitor Tab logic remains unchanged...
  if (activeTab === 'monitor') {
    return (
      <div className="h-[calc(100vh-140px)] w-full glass-panel !bg-black/20 p-8 flex gap-8 overflow-hidden">
        <div className="flex-1 rounded-[3rem] overflow-hidden border border-white/5 relative">
           <TrackingMap drivers={drivers} />
           <div className="absolute top-10 left-10 z-[1000] glass-dark p-10 rounded-[3rem] w-[360px] shadow-2xl border border-white/10">
              <div className="flex items-center gap-4 mb-10"><div className="w-3 h-3 bg-red-600 rounded-full animate-ping shadow-[0_0_15px_#ef4444]"></div><h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Global Surveillance</h2></div>
              <div className="space-y-8">
                 {drivers.map(d => (
                   <div key={d.$id} className="flex items-center justify-between">
                     <div>
                       <p className="text-xs font-black text-white uppercase tracking-wider">{d.name}</p>
                       <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${d.isOnline ? 'text-blue-500' : 'text-slate-600'}`}>{d.isOnline ? 'Active Stream' : 'Unit Offline'}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-xs font-black text-white/20 mono">{d.isOnline ? '34' : '00'} KM/H</p>
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // Other tabs remain as defined in previous changes...
  if (activeTab === 'settings') {
    return (
      <div className="max-w-4xl mx-auto space-y-16 py-10">
        <div className="text-center space-y-4">
           <h2 className="text-5xl font-black text-white tracking-tighter uppercase">System <span className="text-blue-500">Root</span></h2>
           <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.4em]">Core Protocols & Matrix Management</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <SettingBox title="Link Intelligence" icon={<Globe className="text-blue-500"/>} desc="GPS polling frequency and quantum data retention." />
           <SettingBox title="Terminal Brand" icon={<Building2 className="text-orange-500"/>} desc="Interface cosmetics and legal entity metadata." />
           <SettingBox title="Access Matrix" icon={<Shield className="text-purple-500"/>} desc="Multi-factor rules and personnel role definition." />
           <SettingBox title="Health Protocols" icon={<Activity className="text-green-500"/>} desc="Energy alert thresholds and signal buffering." />
        </div>
      </div>
    );
  }

  if (activeTab === 'pods') {
    return (
      <div className="space-y-10 animate-in slide-in-from-bottom duration-500">
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Dispatch Dashboard</h2>
        <div className="glass-panel overflow-hidden border-white/5">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
              <tr><th className="px-10 py-8">Mission Code</th><th className="px-10 py-8">Unit assigned</th><th className="px-10 py-8">Link Status</th><th className="px-10 py-8">Destination</th><th className="px-10 py-8"></th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pods.map(p => (
                <tr key={p.$id} className="hover:bg-white/5 transition-colors">
                  <td className="px-10 py-8 font-black text-white text-sm tracking-widest">{p.awbNumber}</td>
                  <td className="px-10 py-8 font-bold text-sm text-slate-400">{p.driverName}</td>
                  <td className="px-10 py-8"><span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${p.status === PODStatus.DELIVERED ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>{p.status.replace('_', ' ')}</span></td>
                  <td className="px-10 py-8 text-[10px] font-bold text-slate-500 uppercase truncate max-w-[250px]">{p.destination}</td>
                  <td className="px-10 py-8 text-right"><MoreVertical size={20} className="text-slate-700 ml-auto cursor-pointer hover:text-white transition-colors"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === 'map') {
    return <div className="h-[calc(100vh-140px)] w-full glass-panel overflow-hidden"><TrackingMap drivers={drivers} /></div>;
  }

  return null;
};

const MetricCard = ({ icon, label, value, color }: any) => {
  const colors: any = {
    blue: "text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]",
    orange: "text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]",
    green: "text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]",
    purple: "text-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
  };
  return (
    <div className="glass-panel p-8 md:p-10 group relative overflow-hidden hover:scale-105 transition-transform cursor-pointer">
      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 bg-white/5 border border-white/5 ${colors[color]}`}>
        {React.cloneElement(icon, { size: 32 })}
      </div>
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">{label}</p>
      <h3 className="text-4xl font-black text-white tracking-tighter">{value}</h3>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none"></div>
    </div>
  );
};

const StatusPill = ({ label, val, icon }: any) => (
  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
    <div className="flex items-center gap-2 mb-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">{icon} {label}</div>
    <div className="text-xs font-black text-white">{val}</div>
  </div>
);

const SettingBox = ({ title, icon, desc }: any) => (
  <div className="glass-panel p-12 group cursor-pointer hover:!bg-white/5 transition-all">
    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600/10 transition-all border border-white/5">{icon}</div>
    <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{title}</h3>
    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">{desc}</p>
  </div>
);

export default AdminDashboard;
