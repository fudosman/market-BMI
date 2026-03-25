export interface User {
  id: string;
  phoneNumber: string;
  createdAt: string;
}

export interface Profile {
  userId: string;
  ageRange?: string;
  gender?: string;
  updatedAt: string;
}

export interface Measurement {
  id: string;
  userId: string;
  deviceId: string;
  weight: number;
  height: number;
  bmi: number;
  timestamp: string;
}

export interface Device {
  id: string;
  locationId: string;
  status: 'online' | 'offline' | 'maintenance';
  lastPing: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  contactInfo: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  paymentType: 'cash' | 'mobile_money' | 'card';
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

export interface QRSession {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
}
