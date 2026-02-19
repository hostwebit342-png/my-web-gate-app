
import React, { useState } from 'react';
import { UserRole, UserSession } from '../types';

interface LoginProps {
  onLogin: (session: UserSession) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Logic: Dept = Username = Password
    const lowerUser = username.toLowerCase();
    const lowerPass = password.toLowerCase();

    if (lowerUser === lowerPass && lowerUser !== '') {
      let role: UserRole;
      if (lowerUser === 'security') role = UserRole.SECURITY;
      else if (lowerUser === 'hr') role = UserRole.HR;
      else if (lowerUser === 'admin') role = UserRole.ADMIN;
      else role = UserRole.STAFF_USER;

      onLogin({
        username: username,
        role: role,
        department: username
      });
    } else {
      setError('Invalid credentials. Use Dept Name as both username and password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-y-auto">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative my-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-lg mb-6">
              <i className="fas fa-shield-alt text-3xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">GatePass & HR Access</h1>
            <p className="text-slate-500 mt-2">Enterprise Security Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Department Name
              </label>
              <div className="relative">
                <i className="fas fa-building absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Security, HR, Production"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Same as department name"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 font-medium">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
            >
              Sign In to System
            </button>
          </form>
        </div>
        
        <p className="text-center text-slate-500 text-xs mt-6 font-medium">
          GateMaster Pro v2.4.0 &bull; Secure Factory Management
        </p>
      </div>
    </div>
  );
};

export default Login;
