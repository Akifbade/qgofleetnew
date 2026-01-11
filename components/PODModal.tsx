
import React, { useState } from 'react';
import { PODEntry, MoveType, PODStatus, UserProfile } from '../types';
import { X, Package, Truck, Globe, MapPin, Hash, Weight } from 'lucide-react';

interface PODModalProps {
  drivers: UserProfile[];
  onClose: () => void;
  onSubmit: (pod: Partial<PODEntry>) => void;
}

export const PODModal: React.FC<PODModalProps> = ({ drivers, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    awbNumber: `AWB-${Math.floor(Math.random() * 900000) + 100000}`,
    moveType: MoveType.LOCAL,
    pieces: 1,
    weight: 10,
    origin: '',
    destination: '',
    description: '',
    driverId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDriver = drivers.find(d => d.$id === formData.driverId);
    onSubmit({
      ...formData,
      driverName: selectedDriver?.name || 'Unassigned',
      status: PODStatus.PENDING,
      createdAt: new Date().toISOString(),
    } as any);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Package size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Create New POD</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Hash size={14} className="text-gray-400" /> Air Waybill Number
                </label>
                <input 
                  type="text" 
                  value={formData.awbNumber}
                  onChange={e => setFormData({...formData, awbNumber: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-100 border rounded-lg font-mono text-sm"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Globe size={14} className="text-gray-400" /> Move Type
                </label>
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                    <input 
                      type="radio" 
                      name="moveType" 
                      value={MoveType.LOCAL}
                      checked={formData.moveType === MoveType.LOCAL}
                      onChange={() => setFormData({...formData, moveType: MoveType.LOCAL})}
                    />
                    <span className="text-sm font-medium">Local</span>
                  </label>
                  <label className="flex-1 flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                    <input 
                      type="radio" 
                      name="moveType" 
                      value={MoveType.INTERNATIONAL}
                      checked={formData.moveType === MoveType.INTERNATIONAL}
                      onChange={() => setFormData({...formData, moveType: MoveType.INTERNATIONAL})}
                    />
                    <span className="text-sm font-medium">International</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Truck size={14} className="text-gray-400" /> Pieces
                  </label>
                  <input 
                    type="number" 
                    value={formData.pieces}
                    onChange={e => setFormData({...formData, pieces: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Weight size={14} className="text-gray-400" /> Weight (kg)
                  </label>
                  <input 
                    type="number" 
                    value={formData.weight}
                    onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Truck size={14} className="text-gray-400" /> Assign Driver
                </label>
                <select 
                  value={formData.driverId}
                  onChange={e => setFormData({...formData, driverId: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg text-sm"
                  required
                >
                  <option value="">Select a driver</option>
                  {drivers.map(d => (
                    <option key={d.$id} value={d.$id}>{d.name} ({d.isOnline ? 'Online' : 'Offline'})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" /> Origin Address
                </label>
                <textarea 
                  rows={2}
                  value={formData.origin}
                  onChange={e => setFormData({...formData, origin: e.target.value})}
                  placeholder="Street, City, Country"
                  className="w-full px-4 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" /> Destination Address
                </label>
                <textarea 
                  rows={2}
                  value={formData.destination}
                  onChange={e => setFormData({...formData, destination: e.target.value})}
                  placeholder="Street, City, Country"
                  className="w-full px-4 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg text-sm"
                  placeholder="Extra info for the driver..."
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3 justify-end">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-8 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
            >
              Create POD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
