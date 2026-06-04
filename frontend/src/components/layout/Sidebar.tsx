import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Role } from '../../types/user.types';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-sm px-3 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-primary-50 text-primary' : 'text-muted-foreground hover:bg-muted'}`;

  return (
    <aside className="flex h-full w-56 flex-col border-r border-gray-200 bg-white px-3 py-4">
      <div className="mb-6 px-3">
        <h1 className="text-lg font-bold text-primary">ClockIn</h1>
        <p className="truncate text-xs text-gray-500">{user?.name}</p>
      </div>
      <nav className="flex-1 space-y-1">
        {user?.role === Role.EMPLOYEE ? (
          <>
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/clock-in" className={linkClass}>Clock In</NavLink>
          </>
        ) : null}
        {user?.role === Role.ADMIN ? (
          <>
            <NavLink to="/admin" end className={linkClass}>Overview</NavLink>
            <NavLink to="/admin/employees" className={linkClass}>Employees</NavLink>
            <NavLink to="/admin/attendance" className={linkClass}>Attendance Logs</NavLink>
          </>
        ) : null}
      </nav>
      <button
        onClick={() => { logout(); navigate('/login'); }}
        className="mt-auto rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
      >
        Sign Out
      </button>
    </aside>
  );
};
