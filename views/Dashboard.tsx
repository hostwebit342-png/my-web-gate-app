
import React, { useState, useEffect } from 'react';
import { Visitor, StaffEntry } from '../types';
import { getSecurityInsights } from '../geminiService';

interface DashboardProps {
  visitors: Visitor[];
  staff: StaffEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ visitors, staff }) => {
  const [insights, setInsights] = useState<string>('Analyzing security data...');
  const [loadingInsights, setLoadingInsights] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const visitorsToday = visitors.filter(v => v.date === today);
  const visitorsIn = visitorsToday.filter(v => v.status === 'IN').length;
  const staffActive = staff.filter(s => s.status === 'IN').length;
  const totalEntriesToday = visitorsToday.length + staff.filter(s => s.date === today).length;

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      const res = await getSecurityInsights(visitorsToday, staff);
      setInsights(res || "No insights available.");
      setLoadingInsights(false);
    };
    fetchInsights();
  }, [visitors, staff]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-users"></i>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Visitors Currently IN</div>
              <div className="text-3xl font-black text-slate-900">{visitorsIn}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-user-tie"></i>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Staff (IN)</div>
              <div className="text-3xl font-black text-slate-900">{staffActive}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-door-open"></i>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Entries Today</div>
              <div className="text-3xl font-black text-slate-900">{totalEntriesToday}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Recent Entry Activity</h2>
            <span className="text-xs font-bold text-slate-400 uppercase">Last 12 Hours</span>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {[...visitors, ...staff]
                .sort((a, b) => new Date(b.date + ' ' + (a.inTime || '00:00')).getTime() - new Date(a.date + ' ' + (b.inTime || '00:00')).getTime())
                .slice(0, 5)
                .map((entry, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${'status' in entry ? (entry.status === 'IN' ? 'bg-emerald-500' : 'bg-slate-300') : 'bg-blue-500'}`}></div>
                      {idx !== 4 && <div className="absolute top-4 left-[5.5px] w-[1px] h-10 bg-slate-100"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-bold text-slate-800">{entry.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{entry.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {('employeeCode' in entry) ? 'Staff Entry' : 'Visitor Entry'} • {entry.department}
                      </p>
                    </div>
                  </div>
                ))}
              {visitorsToday.length === 0 && staff.length === 0 && (
                <div className="text-center py-10 text-slate-400 italic text-sm">No activity recorded today</div>
              )}
            </div>
          </div>
        </div>

        {/* AI Security Insights */}
        <div className="bg-slate-900 rounded-2xl text-white overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <i className="fas fa-microchip text-sm"></i>
            </div>
            <h2 className="font-bold tracking-tight">AI Security Insights</h2>
          </div>
          <div className="p-6 flex-1 overflow-auto">
            {loadingInsights ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs animate-pulse">Scanning patterns...</p>
              </div>
            ) : (
              <div className="prose prose-invert prose-sm">
                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-medium">
                  {insights}
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-950/50 text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center">
            Powered by Gemini AI Engine
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
