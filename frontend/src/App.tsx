import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { RoleGuard } from './components/shared/RoleGuard';
import { AppShell } from './components/layout/AppShell';
import { Spinner } from './components/ui/Spinner';
import { Role } from './types/user.types';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/employee/DashboardPage'));
const ClockInPage = lazy(() => import('./pages/employee/ClockInPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const EmployeesPage = lazy(() => import('./pages/admin/EmployeesPage'));
const AttendancePage = lazy(() => import('./pages/admin/AttendancePage'));

const Loading = () => (
  <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>
);

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<RoleGuard allowedRoles={[Role.EMPLOYEE]} redirectTo="/admin"><DashboardPage /></RoleGuard>} />
            <Route path="/clock-in" element={<RoleGuard allowedRoles={[Role.EMPLOYEE]} redirectTo="/admin"><ClockInPage /></RoleGuard>} />
            <Route path="/admin" element={<RoleGuard allowedRoles={[Role.ADMIN]} redirectTo="/dashboard"><AdminDashboardPage /></RoleGuard>} />
            <Route path="/admin/employees" element={<RoleGuard allowedRoles={[Role.ADMIN]} redirectTo="/dashboard"><EmployeesPage /></RoleGuard>} />
            <Route path="/admin/attendance" element={<RoleGuard allowedRoles={[Role.ADMIN]} redirectTo="/dashboard"><AttendancePage /></RoleGuard>} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
