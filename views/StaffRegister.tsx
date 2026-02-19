
import React, { useState } from 'react';
import { StaffEntry, AppSettings, UserSession } from '../types';
import { getStaffEntries, saveStaffEntries, addLog } from '../storage';

interface StaffRegisterProps {
  onUpdate: () => void;
  settings: AppSettings;
  session: UserSession;
}

const StaffRegister: React.FC<StaffRegisterProps> = ({ onUpdate, settings, session }) => {
  const [formData, setFormData] = useState({
    name: '',
    employeeCode: '',
    department: session.department || settings.departments[0],
    purpose: 'Office Work' as StaffEntry['purpose'],
    reason: '',
    allowedDuration: 60,
    notifications: {
      sms: false,
      email: true
    }
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entries = getStaffEntries();
    const newEntry: StaffEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      ...formData,
      status: 'PENDING',
      submittedAt: new Date().toLocaleTimeString()
    };

    saveStaffEntries([newEntry, ...entries]);
    addLog({
      name: newEntry.name,
      employeeCode: newEntry.employeeCode,
      type: 'Staff',
      action: 'Registered',
      details: `Purpose: ${newEntry.purpose}, Duration: ${newEntry.allowedDuration}m`
    });

    onUpdate();
    setSubmitted(true);
    
    // Reset after delay
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        employeeCode: '',
        department: session.department || settings.departments[0],
        purpose: 'Office Work',
        reason: '',
        allowedDuration: 60,
        notifications: { sms: false, email: true }
      });
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl">
              <i className="fas fa-clock"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Staff Attendance / Gate Pass</h2>
              <p className="text-slate-400 font-medium">Register your entry for HR approval</p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="p-20 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              <i className="fas fa-check"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900">Request Submitted!</h3>
            <p className="text-slate-500 mt-2">Your gate pass request has been sent to HR for approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Full Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee Code</label>
                <input
                  required
                  type="text"
                  value={formData.employeeCode}
                  onChange={e => setFormData({...formData, employeeCode: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="ID Number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Department</label>
                <select
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  {settings.departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Purpose</label>
                <select
                  value={formData.purpose}
                  onChange={e => setFormData({...formData, purpose: e.target.value as any})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="Office Work">Office Work</option>
                  <option value="Home">Home</option>
                  <option value="Half Day">Half Day</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Allowed (Mins)</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={formData.allowedDuration}
                  onChange={e => setFormData({...formData, allowedDuration: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reason / Details</label>
              <textarea
                required
                rows={2}
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                placeholder="Briefly explain the reason"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">Send Notifications via</label>
              <div className="flex gap-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.notifications.sms}
                    onChange={e => setFormData({...formData, notifications: {...formData.notifications, sms: e.target.checked}})}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">SMS</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.notifications.email}
                    onChange={e => setFormData({...formData, notifications: {...formData.notifications, email: e.target.checked}})}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Email</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              Submit Gate Pass Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StaffRegister;
