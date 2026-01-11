
import React, { useState, useEffect } from 'react';
import { UserProfile, PODEntry, PODStatus } from '../types';
import { SignaturePad } from '../components/SignaturePad';
import { databases, storage, DATABASE_ID, COLLECTIONS, BUCKET_ID, ID, base64ToFile, Query } from '../services/appwrite';
import { 
  Zap, Package, MapPin, CheckCircle, Navigation2, Phone, 
  QrCode, X, Settings as SettingsIcon, History, ShieldCheck, 
  Battery, Wifi, Gauge, ChevronRight, Power, Signal
} from 'lucide-react';

export const DriverDashboard: React.FC<{user: UserProfile, activeTab: string}> = ({ user, activeTab }) => {
  const [pods, setPods] = useState<PODEntry[]>([]);
  const [isDutyOn, setIsDutyOn] = useState(user.isOnline);
  const [selectedPOD, setSelectedPOD] = useState<PODEntry | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [showReceipt, setShowReceipt] = useState<PODEntry | null>(null);

  const fetchPods = async () => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PODS, [Query.equal('driverId', user.$id), Query.orderDesc('createdAt')]);
      setPods(response.documents as unknown as PODEntry[]);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchPods();
  }, []);

  const toggleDuty = async () => {
    const next = !isDutyOn;
    setIsDutyOn(next);
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, user.$id, { isOnline: next });
  };

  const handleDeliveryConfirm = async (sig: string, recipient: string) => {
    if (!selectedPOD) return;
    try {
      const file = base64ToFile(sig, `sig_${selectedPOD.$id}.png`);
      const up = await storage.createFile(BUCKET_ID, ID.unique(), file);
      const url = storage.getFileView(BUCKET_ID, up.$id).href;
      const updated = { status: PODStatus.DELIVERED, signatureUrl: url, recipientName: recipient, deliveredAt: new Date().toISOString() };
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.PODS, selectedPOD.$id, updated);
      await fetchPods();
      setShowSignature(false);
      setSelectedPOD(null);
      setShowReceipt({...selectedPOD, ...updated} as PODEntry);
    } catch (e) { alert('Sync Error. Check Registry.'); }
  };

  if (activeTab === 'settings') {
    return (
      <div className="space-y-10 py-6 animate-in slide-in-from-right duration-500">
        <div className="glass-panel !bg-black/40 p-12 text-white relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-8">
            <div className="w-24 h-24 bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-[2.5rem] flex items-center justify-center text-5xl font-black shadow-[0_0_30px_rgba(37,99,235,0.2)] uppercase">{user.name.charAt(0)}</div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase">{user.name}</h2>
              <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mt-2">Active Unit Core v1.2</p>
            </div>
          </div>
          <Zap className="absolute -right-16 -bottom-16 w-64 h-64 text-white/5 -rotate-12" />
        </div>

        <div className="grid grid-cols-1 gap-6">
           <SettingRow icon={<Wifi className="text-blue-500"/>} label="Telemetry Signal" val="Quantum (99ms)" />
           <SettingRow icon={<Battery className="text-green-500"/>} label="Internal Energy" val="88%" />
           <SettingRow icon={<ShieldCheck className="text-purple-500"/>} label="Security Link" val="ENCRYPTED" />
           <SettingRow icon={<Gauge className="text-orange-500"/>} label="Operational Shift" val={`${user.dutyStart} - ${user.dutyEnd}`} />
        </div>
      </div>
    );
  }

  if (activeTab === 'history') {
    return (
      <div className="space-y-10 py-6">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Registry Logs</h2>
        <div className="space-y-6">
          {pods.filter(p => p.status === PODStatus.DELIVERED).map(p => (
            <div key={p.$id} className="glass-panel p-8 flex items-center justify-between group active:scale-95 transition-all">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-green-500/10 text-green-500 border border-green-500/20 rounded-3xl"><CheckCircle size={28}/></div>
                <div><p className="font-black text-white uppercase text-base tracking-widest">{p.awbNumber}</p><p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">{new Date(p.deliveredAt || '').toLocaleDateString()}</p></div>
              </div>
              <button onClick={() => setShowReceipt(p)} className="p-4 glass-panel !rounded-2xl !bg-white/5 text-blue-500"><QrCode size={24}/></button>
            </div>
          ))}
          {pods.filter(p => p.status === PODStatus.DELIVERED).length === 0 && <p className="text-center py-20 text-slate-700 font-black uppercase text-[10px] tracking-[0.4em]">Empty Registry</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-6 pb-32">
      <div className="flex items-center justify-between glass-panel p-8 !bg-white/5">
         <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-slate-900 border border-white/5 rounded-[2rem] flex items-center justify-center font-black text-blue-500 text-3xl uppercase">{user.name.charAt(0)}</div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[#020617] ${isDutyOn ? 'bg-blue-500 shadow-[0_0_15px_#3b82f6]' : 'bg-red-500 shadow-[0_0_15px_#ef4444]'}`}></div>
            </div>
            <div><h3 className="font-black text-white text-2xl tracking-tight uppercase">{user.name}</h3><p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Module 0{user.$id.slice(-2)}</p></div>
         </div>
         <button onClick={toggleDuty} className={`w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all ${isDutyOn ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' : 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40'}`}>
            <Power size={32} />
         </button>
      </div>

      {!isDutyOn ? (
        <div className="flex flex-col items-center justify-center py-28 text-center space-y-10">
           <div className="w-40 h-40 glass-panel !bg-white/5 flex items-center justify-center animate-pulse"><Power size={64} className="text-slate-800" /></div>
           <div className="space-y-3">
             <h3 className="text-3xl font-black text-white uppercase tracking-tighter">System Offline</h3>
             <p className="text-slate-600 font-black text-[10px] uppercase tracking-[0.4em] px-14">Initiate power for telemetry sequence</p>
           </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in duration-700">
           <div className="flex items-center justify-between px-4">
             <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Mission Stream ({pods.filter(p => p.status !== PODStatus.DELIVERED).length})</h3>
             <Signal size={20} className="text-blue-500 animate-pulse"/>
           </div>
           
           <div className="space-y-8">
             {pods.filter(p => p.status !== PODStatus.DELIVERED).map(pod => (
               <div key={pod.$id} onClick={() => setSelectedPOD(pod)} className="glass-panel p-10 relative overflow-hidden active:scale-95 transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-blue-500/10">{pod.moveType}</span>
                      <h4 className="text-3xl font-black text-white mt-6 tracking-tighter uppercase">{pod.awbNumber}</h4>
                    </div>
                    <div className="w-14 h-14 glass-panel !bg-white/5 !rounded-2xl flex items-center justify-center text-slate-700 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all"><ChevronRight size={24}/></div>
                  </div>
                  <div className="space-y-10 relative pl-10">
                     <div className="absolute left-[8px] top-2 bottom-2 w-[1px] border-l border-dashed border-white/10"></div>
                     <div className="space-y-2"><p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">Origin Node</p><p className="text-xs font-bold text-slate-500 truncate">{pod.origin}</p></div>
                     <div className="space-y-2"><p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">Arrival Terminal</p><p className="text-sm font-black text-white truncate">{pod.destination}</p></div>
                  </div>
                  <Package className="absolute -right-10 -bottom-10 w-44 h-44 text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
               </div>
             ))}
             {pods.filter(p => p.status !== PODStatus.DELIVERED).length === 0 && (
               <div className="text-center py-28 glass-panel !bg-white/5 border-dashed border-white/10"><p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">Waiting for Dispatcher</p></div>
             )}
           </div>
        </div>
      )}

      {selectedPOD && (
        <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-2xl flex items-end">
           <div className="glass-panel !bg-black/60 w-full !rounded-t-[3.5rem] p-12 pb-20 space-y-12 sheet-up border-white/10">
              <div className="flex justify-between items-start">
                 <div><h2 className="text-4xl font-black text-white tracking-tighter uppercase">{selectedPOD.awbNumber}</h2><p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mt-3 ml-1">Secure Mission Command</p></div>
                 <button onClick={() => setSelectedPOD(null)} className="w-14 h-14 glass-panel !rounded-full flex items-center justify-center text-slate-400"><X/></button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedPOD.destination)}`, '_blank')} className="flex flex-col items-center gap-6 p-10 glass-panel !bg-blue-600/10 !border-blue-500/20 group"><Navigation2 className="text-blue-500 group-hover:scale-110 transition-transform shadow-[0_0_15px_#3b82f6]" size={40}/><span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400">Navigate</span></button>
                 <button className="flex flex-col items-center gap-6 p-10 glass-panel !bg-white/5 group"><Phone className="text-white group-hover:scale-110 transition-transform" size={40}/><span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Support</span></button>
              </div>
              <button onClick={() => setShowSignature(true)} className="w-full bg-blue-600 text-white font-black py-7 rounded-[2rem] shadow-[0_20px_40px_rgba(37,99,235,0.3)] flex items-center justify-center gap-4 uppercase text-sm tracking-[0.3em] active:scale-95 transition-all">Authenticate Delivery <ChevronRight size={20}/></button>
           </div>
        </div>
      )}

      {showSignature && <SignaturePad onCancel={() => setShowSignature(false)} onConfirm={handleDeliveryConfirm} />}
      {showReceipt && (
        <div className="fixed inset-0 z-[4000] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8">
           <div className="glass-panel !bg-black/40 w-full max-w-sm p-12 space-y-12 shadow-2xl sheet-up border-white/10">
              <div className="text-center space-y-6">
                 <div className="w-28 h-28 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.2)]"><CheckCircle size={60} /></div>
                 <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Dispatch Sync</h2>
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Registry Updated Successfully</p>
              </div>
              <div className="p-10 glass-panel !bg-white/5 border-dashed border-white/20 flex flex-col items-center gap-8">
                 <QrCode size={140} className="text-blue-500 shadow-[0_0_20px_#3b82f6]" />
                 {showReceipt.signatureUrl && <img src={showReceipt.signatureUrl} alt="sig" className="h-16 invert opacity-40 blur-[0.5px]" />}
              </div>
              <button onClick={() => setShowReceipt(null)} className="w-full py-6 glass-panel !bg-white/10 text-white font-black uppercase text-[11px] tracking-[0.3em]">Return to Stream</button>
           </div>
        </div>
      )}
    </div>
  );
};

const SettingRow = ({ icon, label, val }: any) => (
  <div className="glass-panel p-8 flex items-center justify-between group shadow-lg !bg-white/5">
     <div className="flex items-center gap-6">
        <div className="w-12 h-12 glass-panel !rounded-2xl flex items-center justify-center group-hover:!bg-blue-600/20 transition-all border-white/5">{icon}</div>
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">{label}</p>
     </div>
     <p className="text-xs font-black text-white tracking-widest">{val}</p>
  </div>
);

export default DriverDashboard;
