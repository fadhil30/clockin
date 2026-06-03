import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getMyToday, clockOut } from '../../api/attendance.api';
import { Attendance } from '../../types/attendance.types';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const { date, time } = useCurrentTime();
  const user = useAuthStore((s) => s.user);
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [clockingOut, setClockingOut] = useState(false);

  const fetchToday = useCallback(() => {
    setLoading(true);
    getMyToday().then(setTodayRecord).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchToday(); }, [fetchToday]);

  const handleClockOut = useCallback(async () => {
    setClockingOut(true);
    try {
      const updated = await clockOut();
      setTodayRecord(updated);
      toast.success('Clocked out successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Clock-out failed');
    } finally {
      setClockingOut(false);
    }
  }, []);

  const hasClockedIn = todayRecord !== null;
  const hasClockedOut = todayRecord?.clockOutAt != null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h2>
        <p className="text-gray-500">{date}</p>
      </div>
      <div className="mb-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <p className="font-mono text-5xl font-bold tracking-wide text-blue-600">{time}</p>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h3 className="mb-3 text-base font-semibold text-gray-700">Today's Attendance</h3>
        {loading ? (
          <Spinner size="sm" />
        ) : !hasClockedIn ? (
          <div className="flex items-center gap-4">
            <Badge variant="gray">Not clocked in</Badge>
            <Link to="/clock-in"><Button size="sm">Clock In Now</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="green">Clocked In</Badge>
              <span className="text-sm text-gray-500">at {format(new Date(todayRecord!.clockInAt), 'HH:mm')}</span>
              {todayRecord!.photoUrl ? <span className="text-sm text-gray-400">· Photo submitted</span> : null}
            </div>
            {hasClockedOut ? (
              <div className="flex items-center gap-3">
                <Badge variant="blue">Clocked Out</Badge>
                <span className="text-sm text-gray-500">at {format(new Date(todayRecord!.clockOutAt!), 'HH:mm')}</span>
              </div>
            ) : (
              <Button size="sm" variant="secondary" loading={clockingOut} onClick={handleClockOut}>
                Clock Out
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
