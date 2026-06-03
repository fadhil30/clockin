import React, { useEffect, useState } from 'react';
import { getAllAttendance } from '../../api/attendance.api';
import { getUsers } from '../../api/users.api';
import { Spinner } from '../../components/ui/Spinner';

const AdminDashboardPage: React.FC = () => {
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [totalEmployees, setTotalEmployees] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      getAllAttendance({ date: today, limit: 1 }),
      getUsers({ limit: 1 }),
    ]).then(([att, users]) => {
      setTodayCount(att.total);
      setTotalEmployees(users.total);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Spinner /></div>;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Admin Overview</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-3xl font-bold text-blue-600">{todayCount}</p>
          <p className="mt-1 text-sm text-gray-500">Clock-ins today</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-3xl font-bold text-gray-800">{totalEmployees}</p>
          <p className="mt-1 text-sm text-gray-500">Active employees</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
