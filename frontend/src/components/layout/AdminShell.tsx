import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LayoutDashboard, Users, ClipboardList, Lock, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/employees', icon: Users, label: 'Employees', end: false },
  { to: '/admin/attendance', icon: ClipboardList, label: 'Attendance', end: false },
];

export const AdminShell: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-appbg">
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Plus Jakarta Sans, sans-serif' } }} />

      {/* Sidebar */}
      <aside className="flex h-full w-[248px] shrink-0 flex-col border-r border-border bg-white px-3 py-5">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary">
            <span className="font-mono text-sm font-bold text-white">CI</span>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none">ClockIn</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">HR Console</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-primary-50 text-primary' : 'text-muted-foreground hover:bg-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Records locked reassurance */}
        <div className="mb-3 rounded-sm bg-primary-50 border border-primary-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={14} className="text-primary" />
            <p className="text-xs font-bold text-primary">Records are locked</p>
          </div>
          <p className="text-[11px] text-primary/70 leading-snug">
            Attendance timestamps and photos are immutable once submitted. View-only access.
          </p>
        </div>

        {/* User row */}
        <div className="flex items-center gap-2.5 rounded-sm p-2 hover:bg-muted transition-colors">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
            {user?.name?.slice(0, 2).toUpperCase() ?? 'AD'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">{user?.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">Administrator</p>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={handleLogout}
            className="rounded-sm p-1 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
