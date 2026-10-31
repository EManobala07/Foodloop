import React, { useState } from 'react';
import { UserRole } from '../types';
import { X, Lock, Mail, User as UserIcon, Phone, Building, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (data: any) => Promise<boolean>;
  onQuickSwitch: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onQuickSwitch
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [org, setOrg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const ok = await onLogin(email, password);
    setLoading(false);
    if (ok) {
      onClose();
    } else {
      setError('Invalid email or password. You can also pick a demo user below.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const ok = await onRegister({
      name,
      email,
      password,
      role,
      phone,
      organization_name: org
    });
    setLoading(false);
    if (ok) {
      onClose();
    } else {
      setError('Registration failed. Please verify that this email is not already in use.');
    }
  };

  const demoAccounts: { role: UserRole; name: string; email: string; label: string }[] = [
    { role: 'student', name: 'Aarav Sharma', email: 'student@college.edu', label: 'Student' },
    { role: 'canteen', name: 'Chef Sundaram Pillai', email: 'canteen@college.edu', label: 'Canteen Staff' },
    { role: 'hostel', name: 'Warden Rajesh Nair', email: 'hostel@college.edu', label: 'Hostel Mess' },
    { role: 'ngo', name: 'Priya Menon', email: 'ngo@robinhoodarmy.org', label: 'NGO Volunteer' },
    { role: 'admin', name: 'Dr. Meenakshi Raman', email: 'admin@college.edu', label: 'Dean / Administrator' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center text-2xl mx-auto shadow-md">
            🌱
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-2">
            FOOD<span className="text-emerald-600">LOOP</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Waste Less. Share More.</p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl my-4 text-xs font-bold">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@college.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>

            {/* Quick Demo Logins */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
                One-Click Role Demonstration Access
              </span>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map(acc => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => {
                      onQuickSwitch(acc.role);
                      onClose();
                    }}
                    className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-slate-800">{acc.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{acc.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="name@college.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 capitalize"
                >
                  <option value="student">Student</option>
                  <option value="canteen">Canteen Staff</option>
                  <option value="hostel">Hostel Staff</option>
                  <option value="ngo">NGO Volunteer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department / Canteen / NGO Org Name
              </label>
              <input
                type="text"
                placeholder="e.g. B.Tech CS / North Mess / Robin Hood Army"
                value={org}
                onChange={e => setOrg(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all mt-3"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
