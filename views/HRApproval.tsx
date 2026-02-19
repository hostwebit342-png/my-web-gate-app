
import React from 'react';
import { StaffEntry, StaffStatus } from '../types';
import { saveStaffEntries, addLog } from '../storage';

interface HRApprovalProps {
  entries: StaffEntry[];
  onUpdate: () => void;
}

const HRApproval: React.FC<HRApprovalProps> = ({ entries, onUpdate }) => {
  const pendingRequests = entries.filter(e => e.status === 'PENDING');

  const handleAction = (id: string, status: StaffStatus) => {
    const updated = entries.map(e => {
      if (e.id === id) {
        addLog({
          name: e.name,
          employeeCode: e.employeeCode,
          type: 'Staff',
          action: status,
          details: `HR processed request at ${new Date().toLocaleTimeString()}`
        });
        
        return { 
          ...e, 
          status, 
          approvedAt: status === 'APPROVED' ? new Date().toISOString() : undefined 
        };
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
          <h2 className="text-2xl font-black text-slate-900">HR Approval Queue</h2>
          <p className="text-slate-500 font-medium">Review and process staff gate pass requests</p>
        </div>
        <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-black uppercase text-xs">
          {pendingRequests.length} Pending Actions
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingRequests.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              <i className="fas fa-inbox"></i>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest">No pending requests</p>
          </div>
        )}
        
        {pendingRequests.map(request => (
          <div key={request.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-300 transition-colors">
            <div className="p-6 border-b border-slate-50">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {request.department}
                </div>
                <div className="text-[10px] font-bold text-slate-400">{request.submittedAt}</div>
              </div>
              <h3 className="text-lg font-black text-slate-900">{request.name}</h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Code: {request.employeeCode}</p>
            </div>
            
            <div className="p-6 flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Purpose</label>
                  <div className="text-sm font-bold text-slate-800">{request.purpose}</div>
                </div>
                <div className="text-right">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Duration</label>
                  <div className="text-sm font-bold text-blue-600">{request.allowedDuration} Mins</div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reason</label>
                <p className="text-xs text-slate-600 leading-relaxed italic">"{request.reason}"</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleAction(request.id, 'REJECTED')}
                className="py-3 px-4 bg-white border border-red-200 text-red-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-50 transition-colors"
              >
                Reject
              </button>
              <button 
                onClick={() => handleAction(request.id, 'APPROVED')}
                className="py-3 px-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
              >
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HRApproval;
