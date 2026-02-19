
import React, { useState } from 'react';
import { Visitor, StaffEntry } from '../types';
import { getLogs } from '../storage';

interface SystemLogsProps {
  visitors: Visitor[];
  staff: StaffEntry[];
}

const SystemLogs: React.FC<SystemLogsProps> = ({ visitors, staff }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Visitor' | 'Staff'>('ALL');
  
  const rawLogs = getLogs();

  const filteredLogs = rawLogs.filter((log: any) => {
    const matchesSearch = 
      log.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || log.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const exportCSV = () => {
    const headers = ['Date', 'Time', 'Name', 'Code', 'Type', 'Action', 'Details'];
    const rows = filteredLogs.map((log: any) => [
      log.timestamp.split('T')[0],
      new Date(log.timestamp).toLocaleTimeString(),
      log.name,
      log.employeeCode || 'N/A',
      log.type,
      log.action,
      log.details.replace(/,/g, ';')
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `GateMaster_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">System Activity Logs</h2>
          <p className="text-slate-500 font-medium">Comprehensive audit trail of all gate movements</p>
        </div>
        <button 
          onClick={exportCSV}
          className="bg-slate-900 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-slate-200 transition-all hover:scale-105"
        >
          <i className="fas fa-file-export"></i> Export CSV
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Search by name, employee code, or details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {['ALL', 'Visitor', 'Staff'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type as any)}
              className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                typeFilter === type 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name / Code</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">No activity logs match your search</td>
              </tr>
            )}
            {filteredLogs.map((log: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-[10px] font-black text-slate-900">{log.timestamp.split('T')[0]}</div>
                  <div className="text-[10px] font-bold text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{log.name}</div>
                  {log.employeeCode && <div className="text-[10px] font-bold text-blue-600 uppercase">#{log.employeeCode}</div>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                    log.type === 'Visitor' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {log.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-black text-xs uppercase ${
                    log.action.includes('IN') ? 'text-emerald-600' : 
                    log.action.includes('OUT') ? 'text-red-500' : 
                    log.action.includes('Approved') ? 'text-blue-600' : 'text-slate-500'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-slate-500 font-medium max-w-xs truncate">{log.details}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemLogs;
