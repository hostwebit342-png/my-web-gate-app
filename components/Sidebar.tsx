
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', roles: [UserRole.SECURITY, UserRole.HR, UserRole.ADMIN] },
    { id: 'visitor-entry', label: 'Visitor Entry', icon: 'fa-id-card', roles: [UserRole.SECURITY, UserRole.ADMIN] },
    { id: 'staff-register', label: 'Register Staff', icon: 'fa-user-clock', roles: [UserRole.STAFF_USER, UserRole.ADMIN] },
    { id: 'hr-approval', label: 'HR Approvals', icon: 'fa-user-check', roles: [UserRole.HR, UserRole.ADMIN] },
    { id: 'security-gate', label: 'Staff Directory', icon: 'fa-door-open', roles: [UserRole.SECURITY, UserRole.ADMIN] },
    { id: 'logs', label: 'System Logs', icon: 'fa-file-invoice', roles: [UserRole.SECURITY, UserRole.HR, UserRole.ADMIN] },
    { id: 'settings', label: 'Settings', icon: 'fa-cog', roles: [UserRole.ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 h-full bg-slate-900 text-slate-300 flex flex-col shadow-xl">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white">
          <i className="fas fa-industry"></i>
        </div>
        <span className="text-lg font-bold text-white tracking-tight">GateMaster Pro</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {filteredMenu.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === item.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
              : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
        >
          <i className="fas fa-sign-out-alt w-5"></i>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
