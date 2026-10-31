import React, { useState } from 'react';
import { User, UserRole, NotificationItem } from '../types';
import { Bell, ShieldCheck, UserCheck, Utensils, Building2, HeartHandshake, CheckCircle2, RefreshCw, X } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onSwitchRole: (role: UserRole) => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: number) => void;
  onMarkAllNotificationsAsRead: () => void;
  onOpenAuthModal: () => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchRole,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onOpenAuthModal,
  onResetDemo
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const rolePills: { role: UserRole; label: string; icon: any }[] = [
    { role: 'student', label: 'Student', icon: UserCheck },
    { role: 'canteen', label: 'Canteen Staff', icon: Utensils },
    { role: 'hostel', label: 'Hostel Mess', icon: Building2 },
    { role: 'ngo', label: 'NGO Volunteer', icon: HeartHandshake },
    { role: 'admin', label: 'Administrator', icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-emerald-100/80 shadow-xs">
      {/* Top Banner with Quick Role Testing Switcher */}
      <div className="bg-[#14532d] text-emerald-100 text-xs py-2 px-4 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-300">Active Test Mode:</span>
            <span className="hidden sm:inline text-emerald-100">Switch roles seamlessly to evaluate end-to-end workflows:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {rolePills.map(({ role, label, icon: Icon }) => {
              const isActive = currentUser?.role === role;
              return (
                <button
                  key={role}
                  onClick={() => onSwitchRole(role)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white font-bold shadow-xs'
                      : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
            <button
              onClick={onResetDemo}
              title="Reset Sample Data"
              className="ml-2 flex items-center gap-1 px-2 py-1 rounded text-emerald-300 hover:text-white hover:bg-emerald-800/80 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <span className="text-xl">🌱</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-extrabold tracking-tight text-[#14532d]">
                    FOOD<span className="text-emerald-600">LOOP</span>
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-200">
                    College Hub
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                  Waste Less. Share More.
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Icons & User Info */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={onMarkAllNotificationsAsRead}
                          className="text-xs text-emerald-600 hover:underline font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifMenu(false)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 py-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No notifications right now
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.notification_id}
                          onClick={() => onMarkNotificationAsRead(n.notification_id)}
                          className={`p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                            n.is_read ? 'opacity-70 hover:bg-slate-50' : 'bg-emerald-50/60 hover:bg-emerald-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800">{n.title}</span>
                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current User Pill */}
            {currentUser ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-end gap-1">
                    <span>{currentUser.name}</span>
                    {currentUser.is_verified && (
                      <span title="Verified Member">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold capitalize">
                    {currentUser.role === 'canteen' ? 'Canteen Staff' : currentUser.role} • {currentUser.phone}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-100 border-2 border-emerald-600/30 flex items-center justify-center font-bold text-emerald-800 text-sm">
                  {currentUser.name.charAt(0)}
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
