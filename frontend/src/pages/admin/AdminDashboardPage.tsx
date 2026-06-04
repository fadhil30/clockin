import React from 'react';
import { format, parseISO } from 'date-fns';
import { Users, Clock, AlertTriangle, CalendarOff, Home, Building2 } from 'lucide-react';
import useSWR from 'swr';
import { getAdminDashboard } from '../../api/attendance.api';
import type { AdminDashboard } from '../../types/attendance.types';
import { Avatar } from '../../components/ui/Avatar';
import { Spinner } from '../../components/ui/Spinner';
import { useAuthStore } from '../../store/authStore';

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, sub, accent }) => (
  <div className={`rounded-lg p-5 shadow-1 border ${accent ? 'bg-primary border-primary-100' : 'bg-white border-border'}`}>
    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-sm ${accent ? 'bg-white/15' : 'bg-primary-50'}`}>
      <span className={accent ? 'text-white' : 'text-primary'}>{icon}</span>
    </div>
    <p className={`tnum text-3xl font-extrabold ${accent ? 'text-white' : 'text-foreground'}`}>{value}</p>
    <p className={`mt-1 text-sm font-semibold ${accent ? 'text-white/70' : 'text-muted-foreground'}`}>{label}</p>
    {sub ? <p className={`text-xs ${accent ? 'text-white/50' : 'text-muted-foreground'}`}>{sub}</p> : null}
  </div>
);

const DONUT_COLORS: Record<string, string> = {
  in: '#12A150',
  done: '#2D7FF9',
  leave: '#F59E0B',
  not_in: '#E9E2F1',
};

const DONUT_DOT_CLASS: Record<string, string> = {
  in: 'bg-success',
  done: 'bg-info',
  leave: 'bg-warning',
  not_in: 'bg-border',
};

const DONUT_LABELS: Record<string, string> = {
  in: 'Clocked In',
  done: 'Done',
  leave: 'On Leave',
  not_in: 'Not In',
};

interface DonutProps {
  counts: Record<string, number>;
}

const PresenceDonut: React.FC<DonutProps> = ({ counts }) => {
  const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
  const r = 52;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = Object.entries(counts).map(([key, val]) => {
    const dash = (val / total) * circ;
    const seg = { key, dash, offset, color: DONUT_COLORS[key] ?? '#ccc' };
    offset += dash;
    return seg;
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width="120" height="120" viewBox="0 0 120 120">
          {segments.map(({ key, dash, offset: off, color }) => (
            <circle
              key={key}
              cx="60" cy="60" r={r}
              fill="none"
              stroke={color}
              strokeWidth="16"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-off + circ * 0.25}
              strokeLinecap="butt"
            />
          ))}
          <text x="60" y="55" textAnchor="middle" className="fill-foreground" fontSize="20" fontWeight="800" fontFamily="Space Grotesk, monospace">
            {total}
          </text>
          <text x="60" y="70" textAnchor="middle" className="fill-muted-foreground" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">
            total
          </text>
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        {Object.entries(counts).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${DONUT_DOT_CLASS[key] ?? 'bg-muted-foreground'}`} />
            <span className="text-xs font-semibold text-foreground">{val}</span>
            <span className="text-xs text-muted-foreground">{DONUT_LABELS[key] ?? key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboardPage: React.FC = () => {
  const { data, isLoading: loading } = useSWR('/attendance/dashboard', () => getAdminDashboard());
  const user = useAuthStore((s) => s.user);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  const presentPct = data && data.totalEmployees
    ? Math.round((data.presentToday / data.totalEmployees) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">{greeting}, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMM d yyyy')}</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard icon={<Users size={20} />} label="Present Today" value={data?.presentToday ?? 0}
          sub={`${presentPct}% of ${data?.totalEmployees ?? 0}`} accent />
        <KpiCard icon={<Clock size={20} />} label="Avg Clock-in" value={data?.avgClockIn ?? '—'} />
        <KpiCard icon={<AlertTriangle size={20} />} label="Late Arrivals" value={data?.lateArrivals ?? 0} />
        <KpiCard icon={<CalendarOff size={20} />} label="On Leave" value={data?.onLeave ?? 0} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Presence donut */}
        <div className="rounded-lg bg-white shadow-1 border border-border p-5">
          <h3 className="mb-4 text-sm font-bold text-foreground">Team Presence</h3>
          {data?.presence ? <PresenceDonut counts={data.presence} /> : <p className="text-sm text-muted-foreground">No data</p>}
        </div>

        {/* Today's submissions */}
        <div className="rounded-lg bg-white shadow-1 border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Today's Submissions</h3>
          </div>
          <div className="divide-y divide-border">
            {data?.recentSubmissions?.length ? data.recentSubmissions.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                {r.photoUrl ? (
                  <img src={r.photoUrl} alt={r.name ?? ''} className="h-9 w-9 rounded-sm object-cover border border-border shrink-0" />
                ) : (
                  <Avatar name={r.name ?? 'U'} size={36} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{r.name ?? '—'}</p>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    {r.department ?? '—'}
                    <span className="mx-1">·</span>
                    {r.mode === 'OFFICE' ? <Building2 size={10} /> : <Home size={10} />}
                    {r.mode === 'OFFICE' ? 'Office' : 'Home'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-foreground">
                    {format(parseISO(r.clockInAt), 'HH:mm')}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    r.status === 'LATE'
                      ? 'bg-[#FEF3DD] text-[#9A6700]'
                      : 'bg-[#E7F6EC] text-[#0A7A3C]'
                  }`}>
                    {r.status === 'LATE' ? 'Late' : 'On time'}
                  </span>
                </div>
              </div>
            )) : (
              <p className="px-5 py-6 text-sm text-muted-foreground">No submissions today</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
