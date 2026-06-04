import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { Bell, MapPin, Home, Building2 } from 'lucide-react';
import { getMyToday, clockOut } from '../../api/attendance.api';
import type { Attendance } from '../../types/attendance.types';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Avatar } from '../../components/ui/Avatar';
import toast from 'react-hot-toast';

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}


function formatWorkedDuration(clockInAt: string, now: Date) {
  const mins = differenceInMinutes(now, parseISO(clockInAt));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const DashboardPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const now = useNow();
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [clockingOut, setClockingOut] = useState(false);

  useEffect(() => {
    let mounted = true;
    getMyToday().then((rec) => {
      if (!mounted) return;
      setTodayRecord(rec);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleClockOut = useCallback(async () => {
    setClockingOut(true);
    try {
      const updated = await clockOut();
      setTodayRecord(updated);
      toast.success('Clocked out successfully!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Clock-out failed');
    } finally {
      setClockingOut(false);
    }
  }, []);

  const hasClockedIn = !!todayRecord?.clockInAt;
  const hasClockedOut = !!todayRecord?.clockOutAt;
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const greeting = getGreeting(now.getHours());

  const timeStr = format(now, 'hh:mm:ss');
  const amPm = format(now, 'a');
  const dayDate = format(now, 'EEEE, MMM d');

  return (
    <div className="flex flex-col gap-[18px] px-5 py-6">

      {/* Greeting row */}
      <div className="animate-fade-up stagger-1 flex items-center gap-3">
        <Avatar name={user?.name ?? 'U'} size={48} ring />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">{greeting},</p>
          <p className="truncate text-sm font-bold text-foreground">{firstName} 👋</p>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-sm bg-white text-muted-foreground shadow-1 hover:bg-muted transition-colors"
        >
          <Bell size={18} />
        </button>
      </div>

      {/* ClockHero "Spotlight" card */}
      <div className="animate-fade-up stagger-2 clock-hero-gradient rounded-lg p-5 text-white">
        <div className="clock-hero-orb" />
        <p className="relative text-xs font-semibold uppercase tracking-widest text-white/50">{dayDate}</p>

        {/* Live clock */}
        <div className="relative mt-1 flex items-end gap-2">
          <span className="tnum text-[58px] font-extrabold leading-none tracking-tight text-white">{timeStr}</span>
          <span className="mb-1.5 rounded-sm bg-white/15 px-2 py-0.5 text-sm font-bold text-white/90">{amPm}</span>
        </div>

        {loading ? (
          <div className="relative mt-4 flex justify-center"><Spinner size="sm" /></div>
        ) : !hasClockedIn ? (
          <>
            <p className="relative mt-3 text-sm text-white/70">You haven't clocked in yet</p>
            <Link to="/clock-in" className="relative mt-4 block">
              <Button variant="accent" size="lg" className="breathe w-full font-bold">
                Clock in now
              </Button>
            </Link>
          </>
        ) : (
          <>
            <div className="relative mt-3 flex items-center gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                Clocked in · {format(parseISO(todayRecord!.clockInAt), 'HH:mm')}
              </span>
              {!hasClockedOut && (
                <span className="text-sm font-semibold text-accent-soft">
                  {formatWorkedDuration(todayRecord!.clockInAt, now)}
                </span>
              )}
            </div>
            {!hasClockedOut ? (
              <Button
                variant="outline"
                size="md"
                loading={clockingOut}
                onClick={handleClockOut}
                className="relative mt-4 w-full border-white/30 text-white hover:bg-white/10"
              >
                Clock out
              </Button>
            ) : (
              <p className="relative mt-3 text-sm text-white/70">
                Clocked out at {format(parseISO(todayRecord!.clockOutAt!), 'HH:mm')} ·{' '}
                {formatWorkedDuration(todayRecord!.clockInAt, parseISO(todayRecord!.clockOutAt!))}
              </p>
            )}
          </>
        )}
      </div>

      {/* Today's record card (when clocked in) */}
      {hasClockedIn && !loading && (
        <div className="animate-fade-up stagger-3 rounded-lg bg-white p-4 shadow-1 border border-border">
          <div className="flex items-center gap-3">
            {todayRecord!.photoUrl ? (
              <img
                src={todayRecord!.photoUrl}
                alt="WFH proof"
                className="h-14 w-14 rounded-sm object-cover border border-border"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-muted border border-border text-muted-foreground text-xs">
                No photo
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-bold text-foreground">
                  {format(parseISO(todayRecord!.clockInAt), 'HH:mm')}
                </span>
                {todayRecord!.latitude ? (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <MapPin size={11} /> Location captured
                  </span>
                ) : null}
                <span className="flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {todayRecord.mode === 'OFFICE' ? <Building2 size={10} /> : <Home size={10} />}
                  {todayRecord.mode === 'OFFICE' ? 'Office' : 'Home'}
                </span>
              </div>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#E7F6EC] px-2 py-0.5 text-[11px] font-semibold text-[#0A7A3C]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#12A150]" />
                Verified
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick stats row */}
      <div className="animate-fade-up stagger-4 grid grid-cols-3 gap-2">
        {[
          { label: 'This week', value: '—h', sub: 'hours' },
          { label: 'On-time', value: '—', sub: 'streak' },
          { label: 'Team in', value: '—', sub: 'today' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-sm bg-white p-3 text-center shadow-1 border border-border">
            <p className="tnum text-lg font-extrabold text-foreground">{value}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{sub}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
