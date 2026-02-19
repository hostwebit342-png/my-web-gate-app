
import React, { useState } from 'react';
import { AppSettings } from '../types';
import { saveSettings } from '../storage';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const [newDept, setNewDept] = useState('');

  const toggleNotifications = () => {
    const updated = { ...settings, notificationsEnabled: !settings.notificationsEnabled };
    saveSettings(updated);
    onUpdate();
  };

  const addDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDept && !settings.departments.includes(newDept)) {
      const updated = { ...settings, departments: [...settings.departments, newDept] };
      saveSettings(updated);
      setNewDept('');
      onUpdate();
    }
  };

  const removeDept = (dept: string) => {
    if (settings.departments.length <= 1) return;
    const updated = { ...settings, departments: settings.departments.filter(d => d !== dept) };
    saveSettings(updated);
    onUpdate();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-2xl font-black text-slate-900">System Settings</h2>
          <p className="text-slate-500 font-medium">Configure factory parameters and global options</p>
        </div>

        <div className="p-8 space-y-12">
          {/* Notification Settings */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-lg">
                <i className="fas fa-bell"></i>
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Notification Engine</h3>
            </div>
            
            <div className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
              <div>
                <div className="font-black text-slate-900">Global Notifications</div>
                <div className="text-sm text-slate-500">Enable or disable automatic SMS/Email alerts for gate passes</div>
              </div>
              <button 
                onClick={toggleNotifications}
                className={`w-14 h-8 rounded-full transition-all relative ${settings.notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.notificationsEnabled ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </section>

          {/* Department Management */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-lg">
                <i className="fas fa-building"></i>
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Department Management</h3>
            </div>

            <form onSubmit={addDept} className="flex gap-4">
              <input
                type="text"
                value={newDept}
                onChange={e => setNewDept(e.target.value)}
                placeholder="New Department Name"
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <button 
                type="submit"
                className="bg-slate-900 text-white font-black text-xs uppercase tracking-widest px-8 rounded-xl shadow-lg hover:bg-black transition-all"
              >
                Add Dept
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {settings.departments.map(dept => (
                <div key={dept} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl group hover:border-blue-300 transition-colors">
                  <span className="font-bold text-slate-700">{dept}</span>
                  <button 
                    onClick={() => removeDept(dept)}
                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* System Info */}
          <section className="pt-8 border-t border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">App Version</div>
                <div className="font-black text-slate-900">v2.4.0 PRO</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Storage Mode</div>
                <div className="font-black text-blue-600">LocalPersistence</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Status</div>
                <div className="font-black text-emerald-600">Connected</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Update</div>
                <div className="font-black text-slate-900">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
