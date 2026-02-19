
export enum UserRole {
  SECURITY = 'SECURITY',
  HR = 'HR',
  STAFF_USER = 'STAFF_USER',
  ADMIN = 'ADMIN'
}

export type VisitorStatus = 'IN' | 'OUT';

export interface Visitor {
  id: string;
  date: string;
  name: string;
  mobile: string;
  meetingWith: string;
  department: string;
  purpose: 'Meeting' | 'Material Delivery' | 'Just Visit';
  inTime: string;
  outTime?: string;
  otp: string;
  photo?: string;
  status: VisitorStatus;
}

export type StaffStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'OUT' | 'COMPLETED';

export interface StaffEntry {
  id: string;
  date: string;
  name: string;
  employeeCode: string;
  department: string;
  purpose: 'Office Work' | 'Home' | 'Half Day';
  reason: string;
  allowedDuration: number; // in minutes
  approvedAt?: string; // ISO string
  notifications: {
    sms: boolean;
    email: boolean;
  };
  outTime?: string;
  inTime?: string;
  status: StaffStatus;
  submittedAt: string;
}

export interface AppSettings {
  departments: string[];
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
}

export interface UserSession {
  username: string;
  role: UserRole;
  department: string;
}
