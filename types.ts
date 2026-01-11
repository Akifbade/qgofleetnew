
export enum UserRole {
  ADMIN = 'admin',
  DRIVER = 'driver'
}

export enum PODStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered'
}

export enum MoveType {
  LOCAL = 'local',
  INTERNATIONAL = 'international'
}

export interface UserProfile {
  $id: string;
  name: string;
  email: string;
  role: UserRole;
  batteryLevel?: number;
  signalStrength?: string;
  isOnline: boolean;
  dutyStart: string; // e.g., "08:00"
  dutyEnd: string;   // e.g., "17:00"
  currentLat?: number;
  currentLng?: number;
  lastUpdated?: string;
}

export interface PODEntry {
  $id: string;
  awbNumber: string;
  moveType: MoveType;
  pieces: number;
  weight: number;
  origin: string;
  destination: string;
  description: string;
  driverId: string;
  driverName: string;
  status: PODStatus;
  recipientName?: string;
  signatureUrl?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface LocationHistory {
  $id: string;
  driverId: string;
  lat: number;
  lng: number;
  timestamp: string;
  speed?: number; // km/h
  distanceFromPrev?: number; // km
}
