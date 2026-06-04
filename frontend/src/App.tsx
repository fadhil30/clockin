import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { RoleGuard } from './components/shared/RoleGuard';
import { EmployeeShell } from './components/layout/EmployeeShell';
import { AdminShell } from './components/layout/AdminShell';
import { Spinner } from './components/ui/Spinner';
import { Role } from './types/user.types';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/employee/DashboardPage'));
const ClockInPage = lazy(() => import('./pages/employee/ClockInPage'));
const HistoryPage = lazy(() => import('./pages/employee/HistoryPage'));
const TeamPage = lazy(() => import('./pages/employee/TeamPage'));
const ProfilePage = lazy(() => import('./pages/employee/ProfilePage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const EmployeesPage = lazy(() => import('./pages/admin/EmployeesPage'));
const AttendancePage = lazy(() => import('./pages/admin/AttendancePage'));

const Loading = () => (
  <div className="flex h-full min-h-screen items-center justify-center bg-appbg">
    <Spinner size="lg" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Employee routes — phone shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allowedRoles={[Role.EMPLOYEE]} redirectTo="/admin"><EmployeeShell /></RoleGuard>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clock-in" element={<ClockInPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin routes — desktop shell */}
          <Route element={<RoleGuard allowedRoles={[Role.ADMIN]} redirectTo="/dashboard"><AdminShell /></RoleGuard>}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/employees" element={<EmployeesPage />} />
            <Route path="/admin/attendance" element={<AttendancePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
