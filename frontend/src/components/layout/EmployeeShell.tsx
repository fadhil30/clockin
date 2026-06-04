import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Home, Clock, Users, User } from 'lucide-react';

const tabs = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export const EmployeeShell: React.FC = () => (
  <div className="employee-page-bg min-h-screen w-full flex items-center justify-center">
    <Toaster position="top-center" />
    <div className="employee-shell-card relative flex flex-col bg-white overflow-hidden">
      <div className="employee-shell-inner relative flex flex-col bg-white overflow-hidden w-full">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </div>

        {/* Bottom tab bar */}
        <nav className="absolute bottom-0 left-0 right-0 flex items-center bg-white border-t border-border px-2 py-1 z-10">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 min-h-[44px] rounded-sm transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  </div>
);
