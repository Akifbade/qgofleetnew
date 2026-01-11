
import { UserRole, PODStatus, MoveType, UserProfile, PODEntry, LocationHistory } from '../types';

export const ID = {
  unique: () => Math.random().toString(36).substring(2, 12)
};

export const Query = {
  equal: (key: string, value: any) => ({ key, value, op: 'equal' }),
  orderDesc: (key: string) => ({ key, op: 'desc' }),
  limit: (val: number) => ({ val, op: 'limit' })
};

// Added password field to initial profiles
const INITIAL_PROFILES = [
  { $id: 'admin_1', name: 'Ops Manager', email: 'admin@cargo.com', password: 'demo123', role: UserRole.ADMIN, isOnline: true, dutyStart: '08:00', dutyEnd: '18:00' },
  { $id: 'driver_1', name: 'Rajesh Kumar', email: 'rajesh@cargo.com', password: 'demo123', role: UserRole.DRIVER, isOnline: true, batteryLevel: 88, signalStrength: 'Excellent', dutyStart: '09:00', dutyEnd: '17:00', currentLat: 28.6139, currentLng: 77.2090, lastUpdated: new Date().toISOString() },
  { $id: 'driver_2', name: 'Amit Singh', email: 'amit@cargo.com', password: 'demo123', role: UserRole.DRIVER, isOnline: false, batteryLevel: 45, signalStrength: 'Weak', dutyStart: '10:00', dutyEnd: '19:00', currentLat: 28.5355, currentLng: 77.3910, lastUpdated: new Date().toISOString() }
];

const generateHistory = (driverId: string) => {
  const points: LocationHistory[] = [];
  const startLat = 28.6139;
  const startLng = 77.2090;
  for (let i = 0; i < 12; i++) {
    points.push({
      $id: ID.unique(),
      driverId,
      lat: startLat + (i * 0.005) + (Math.random() * 0.002),
      lng: startLng + (i * 0.005) + (Math.random() * 0.002),
      timestamp: new Date(Date.now() - (i * 3600000)).toISOString(),
      speed: Math.floor(Math.random() * 45) + 15,
      distanceFromPrev: Math.random() * 2.5 + 0.5
    });
  }
  return points;
};

const INITIAL_HISTORY = [
  ...generateHistory('driver_1'),
  ...generateHistory('driver_2')
];

const INITIAL_PODS: PODEntry[] = [
  { $id: 'pod_1', awbNumber: 'AWB-882910', moveType: MoveType.LOCAL, pieces: 4, weight: 120.5, origin: 'Okhla Phase III, Delhi', destination: 'Sector 62, Noida', description: 'Fragile electronic parts', driverId: 'driver_1', driverName: 'Rajesh Kumar', status: PODStatus.IN_TRANSIT, createdAt: new Date(Date.now() - 3600000).toISOString() }
];

const getStorage = (key: string, initial: any) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

const setStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const account = {
  get: async () => {
    const session = localStorage.getItem('cargo_session');
    if (!session) throw { code: 401, message: 'No session' };
    return JSON.parse(session);
  },
  createEmailPasswordSession: async (email: string, pass: string) => {
    const profiles = getStorage('cargo_profiles', INITIAL_PROFILES);
    const user = profiles.find((p: any) => p.email === email && p.password === pass);
    if (!user) throw new Error('Invalid email or password.');
    localStorage.setItem('cargo_session', JSON.stringify(user));
    return user;
  },
  deleteSession: async (id: string) => { localStorage.removeItem('cargo_session'); }
};

export const databases = {
  listDocuments: async (db: string, col: string, queries: any[] = []) => {
    await new Promise(r => setTimeout(r, 200));
    let data = getStorage(`cargo_${col}`, col === 'profiles' ? INITIAL_PROFILES : (col === 'pods' ? INITIAL_PODS : (col === 'location_history' ? INITIAL_HISTORY : [])));
    const driverQuery = queries.find(q => q.key === 'driverId');
    if (driverQuery) data = data.filter((d: any) => d.driverId === driverQuery.value);
    const roleQuery = queries.find(q => q.key === 'role');
    if (roleQuery) data = data.filter((d: any) => d.role === roleQuery.value);
    return { documents: data, total: data.length };
  },
  getDocument: async (db: string, col: string, id: string) => {
    const data = getStorage(`cargo_${col}`, col === 'profiles' ? INITIAL_PROFILES : []);
    const doc = data.find((d: any) => d.$id === id);
    if (!doc) throw { code: 404 };
    return doc;
  },
  createDocument: async (db: string, col: string, id: string, data: any) => {
    const current = getStorage(`cargo_${col}`, []);
    const newDoc = { $id: id === 'unique' ? ID.unique() : id, ...data };
    setStorage(`cargo_${col}`, [newDoc, ...current]);
    return newDoc;
  },
  updateDocument: async (db: string, col: string, id: string, data: any) => {
    const current = getStorage(`cargo_${col}`, []);
    const index = current.findIndex((d: any) => d.$id === id);
    if (index === -1) throw new Error('Not found');
    current[index] = { ...current[index], ...data };
    setStorage(`cargo_${col}`, current);
    return current[index];
  }
};

export const storage = {
  createFile: async (bucketId: string, fileId: string, file: File) => ({ $id: ID.unique() }),
  getFileView: (bucketId: string, fileId: string) => ({ href: 'https://placehold.co/400x200?text=Signature' })
};

export const DATABASE_ID = 'main';
export const BUCKET_ID = 'signatures';
export const COLLECTIONS = { PROFILES: 'profiles', PODS: 'pods', LOCATION_HISTORY: 'location_history' };
export const base64ToFile = (b64: string, fn: string) => new File([], fn);
