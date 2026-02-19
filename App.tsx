
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, UserSession, Visitor, StaffEntry, AppSettings } from './types';
import { getVisitors, getStaffEntries, getSettings, saveVisitors, saveStaffEntries, saveSettings, addLog, getLogs } from './storage';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import VisitorEntry from './views/VisitorEntry';
import StaffRegister from './views/StaffRegister';
import HRApproval from './views/HRApproval';
import SecurityGate from './views/SecurityGate';
import SystemLogs from './views/SystemLogs';
import Settings from './views/Settings';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [visitors, setVisitors] = useState<Visitor[]>(getVisitors());
  const [staffEntries, setStaffEntries] = useState<StaffEntry[]>(getStaffEntries());
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [time, setTime] = useState(new Date());

  // Clock effect
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (user: UserSession) => {
    setSession(user);
    if (user.role === UserRole.STAFF_USER) {
      setActiveTab('staff-register');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setSession(null);
    setActiveTab('dashboard');
  };

  const refreshData = useCallback(() => {
    setVisitors(getVisitors());
    setStaffEntries(getStaffEntries());
    setSettings(getSettings());
  }, []);

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard visitors={visitors} staff={staffEntries} />;
      case 'visitor-entry':
        return <VisitorEntry visitors={visitors} onUpdate={refreshData} settings={settings} />;
      case 'staff-register':
        return <StaffRegister onUpdate={refreshData} settings={settings} session={session} />;
      case 'hr-approval':
        return <HRApproval entries={staffEntries} onUpdate={refreshData} />;
      case 'security-gate':
        return <SecurityGate entries={staffEntries} onUpdate={refreshData} />;
      case 'logs':
        return <SystemLogs visitors={visitors} staff={staffEntries} />;
      case 'settings':
        return <Settings settings={settings} onUpdate={refreshData} />;
      default:
        return <Dashboard visitors={visitors} staff={staffEntries} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="no-print">
        <Sidebar 
          role={session.role} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout} 
        />
      </div>
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="no-print bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
              {activeTab.replace('-', ' ')}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-slate-900">{time.toLocaleTimeString()}</div>
              <div className="text-xs text-slate-500 font-semibold">{time.toDateString()}</div>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                {session.username[0].toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 leading-none">{session.username}</div>
                <div className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">{session.role}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 overflow-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
