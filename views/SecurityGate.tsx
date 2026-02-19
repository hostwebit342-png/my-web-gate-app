
import React, { useState, useEffect } from 'react';
import { StaffEntry, StaffStatus } from '../types';
import { saveStaffEntries, addLog } from '../storage';

interface SecurityGateProps {
  entries: StaffEntry[];
  onUpdate: () => void;
}

const Timer: React.FC<{ entry: StaffEntry }> = ({ entry }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!entry.approvedAt || entry.status === 'COMPLETED') return;

    const interval = setInterval(() => {
      const start = new Date(entry.approvedAt!).getTime();
      const now = Date.now();
      const diffMinutes = Math.floor((now - start) / (60 * 1000));
      setElapsed(diffMinutes);
    }, 1000);

    return () => clearInterval(interval);
  }, [entry.approvedAt, entry.status]);

  if (!entry.approvedAt || entry.status === 'COMPLETED') {
    if (entry.status === 'COMPLETED') {
      return <span className="text-slate-400 font-bold text-xs">Cycle Finished</span>;
    }
    return <span className="text-slate-300 italic text-xs">Waiting...</span>;
  }

  const isOverdue = elapsed > entry.allowedDuration;
  const extraTime = elapsed - entry.allowedDuration;

  return (
    <div className={`flex flex-col ${isOverdue ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
      <div className="text-xs font-black uppercase tracking-widest">
        {elapsed}m Elapsed
      </div>
      {isOverdue && (
        <div className="text-[10px] font-black uppercase tracking-tighter bg-red-50 px-1 rounded inline-block w-fit">
          OVERDUE: {extraTime}m Extra
        </div>
      )}
    </div>
  );
};

const SecurityGate: React.FC<SecurityGateProps> = ({ entries, onUpdate }) => {
  const visibleStaff = entries.filter(e => e.status !== 'PENDING' && e.status !== 'REJECTED');

  const updateStatus = (id: string, newStatus: StaffStatus) => {
    const updated = entries.map(e => {
      if (e.id === id) {
        const time = new Date().toLocaleTimeString();
        const details = `Recorded at ${time}`;
        
        addLog({
          name: e.name,
          employeeCode: e.employeeCode,
          type: 'Staff',
          action: `Security ${newStatus}`,
          details: details
        });

        if (newStatus === 'OUT') {
          return { ...e, status: newStatus, outTime: time };
        } else if (newStatus === 'COMPLETED') {
          return { ...e, status: newStatus, inTime: time };
        }
      }
      return e;
    });
    saveStaffEntries(updated);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Staff Gate Management</h2>
          <p className="text-slate-500 font-medium">Verify HR approvals and record movement</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-black uppercase text-xs">
            {entries.filter(e => e.status === 'APPROVED').length} Approved by HR
          </div>
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-black uppercase text-xs">
            {entries.filter(e => e.status === 'OUT').length} Currently OUT
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">HR Approval Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Validity Timer</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gate Movement</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleStaff.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic font-medium">
                  No approved staff entries found
                </td>
              </tr>
            )}
            {visibleStaff.map(staff => {
              const isOverdue = staff.approvedAt && (Math.floor((Date.now() - new Date(staff.approvedAt).getTime()) / 60000) > staff.allowedDuration);
              
              return (
                <tr key={staff.id} className={`transition-colors ${isOverdue && staff.status !== 'COMPLETED' ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-900">{staff.name}</div>
                    <div className="text-xs font-bold text-blue-600 mt-0.5">#{staff.employeeCode}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <i className="fas fa-check-circle"></i> Approval to HR
                      </span>
                      <div className="text-[10px] font-bold text-slate-400">At: {staff.approvedAt ? new Date(staff.approvedAt).toLocaleTimeString() : 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Timer entry={staff} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {staff.outTime && (
                        <div className="text-[10px] font-bold text-red-500 uppercase">OUT: {staff.outTime}</div>
                      )}
                      {staff.inTime && (
                        <div className="text-[10px] font-bold text-emerald-600 uppercase">IN: {staff.inTime}</div>
                      )}
                      {!staff.outTime && !staff.inTime && (
                        <div className="text-[10px] font-bold text-slate-300 uppercase italic">Awaiting movement</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {staff.status === 'APPROVED' && (
                        <button 
                          onClick={() => updateStatus(staff.id, 'OUT')}
                          className="bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg shadow-lg shadow-red-100 transition-all active:scale-95"
                        >
                          Mark OUT
                        </button>
                      )}
                      {staff.status === 'OUT' && (
                        <button 
                          onClick={() => updateStatus(staff.id, 'COMPLETED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg shadow-lg shadow-emerald-100 transition-all active:scale-95"
                        >
                          Mark IN
                        </button>
                      )}
                      {staff.status === 'COMPLETED' && (
                        <button 
                          disabled
                          className="bg-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg cursor-not-allowed"
                        >
                          Finished
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SecurityGate;
