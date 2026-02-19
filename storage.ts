
import { Visitor, StaffEntry, AppSettings } from './types';

const KEYS = {
  VISITORS: 'gatepass_visitors',
  STAFF: 'gatepass_staff',
  SETTINGS: 'gatepass_settings',
  LOGS: 'gatepass_logs'
};

export const getVisitors = (): Visitor[] => {
  const data = localStorage.getItem(KEYS.VISITORS);
  return data ? JSON.parse(data) : [];
};

export const saveVisitors = (visitors: Visitor[]) => {
  localStorage.setItem(KEYS.VISITORS, JSON.stringify(visitors));
};

export const getStaffEntries = (): StaffEntry[] => {
  const data = localStorage.getItem(KEYS.STAFF);
  return data ? JSON.parse(data) : [];
};

export const saveStaffEntries = (entries: StaffEntry[]) => {
  localStorage.setItem(KEYS.STAFF, JSON.stringify(entries));
};

export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(KEYS.SETTINGS);
  return data ? JSON.parse(data) : {
    departments: ['Production', 'HR', 'IT', 'Finance', 'Logistics', 'Quality'],
    notificationsEnabled: true,
    theme: 'light'
  };
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

export const addLog = (log: any) => {
  const logs = getLogs();
  logs.unshift({ ...log, timestamp: new Date().toISOString() });
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs.slice(0, 500))); // Keep last 500
};

export const getLogs = () => {
  const data = localStorage.getItem(KEYS.LOGS);
  return data ? JSON.parse(data) : [];
};
