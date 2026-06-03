import React from 'react';
import { Navigate } from 'react-router-dom';
import { Role } from '../../types/user.types';
import { useAuthStore } from '../../store/authStore';

interface RoleGuardProps { allowedRoles: Role[]; children: React.ReactNode; redirectTo?: string; }

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, redirectTo = '/dashboard' }) => {
  const user = useAuthStore((s) => s.user);
  if (!user || !allowedRoles.includes(user.role as Role)) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
};
