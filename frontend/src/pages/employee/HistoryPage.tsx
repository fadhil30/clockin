import React, { useState, useMemo } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Home, Building2 } from 'lucide-react';
import useSWR from 'swr';
import { getMyHistory, getMySummary } from '../../api/attendance.api';
import type { Attendance, MySummary } from '../../types/attendance.types';
import { Spinner } from '../../components/ui/Spinner';

type ViewMode = 'list' | 'month';

const STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-success',
  LATE: 'bg-warning',
  LEAVE: 'bg-info',
};

const HistoryPage: React.FC = () => {
  const [view, setView] = useState<ViewMode>('list');
  const [page, setPage] = useState(1);
  const [calMonth, setCalMonth] = useState(() => new Date());

  const { data: histData, isLoading: loading } = useSWR(
    ['/attendance/my', page] as const,
    ([, p]) => getMyHistory({ page: p, limit: 20 }),
  );
  const { data: summary } = useSWR<MySummary | null>('/attendance/my/summary', () => getMySummary());

  const records: Attendance[] = histData?.data ?? [];
  const total = histData?.total ?? 0;

  // O(1) date lookup for calendar — build once per records change
  const recordByDate = useMemo(() => {
    const map = new Map<string, Attendance>();
    for (const r of records) {
      map.set(format(parseISO(r.date), 'yyyy-MM-dd'), r);
    }
    return map;
  }, [records]);

  // Calendar data
  const monthStart = startOfMonth(calMonth);
  const monthEnd = endOfMonth(calMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const getStatusForDay = (day: Date) => recordByDate.get(format(day, 'yyyy-MM-dd'));

  return (
    <div className="flex flex-col gap-4 px-5 py-6">
      <h2 className="text-lg font-extrabold text-foreground">Attendance</h2>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Days Present', value: summary?.daysPresent ?? '—' },
          { label: 'Avg Clock-in', value: summary?.avgClockIn ?? '—' },
          { label: 'Hours Logged', value: summary ? `${summary.hoursLogged}h` : '—' },
          { label: 'Leave Taken', value: summary?.leaveTaken ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-sm bg-white p-3 shadow-1 border border-border">
            <p className="tnum text-xl font-extrabold text-foreground">{value}</p>
            <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex rounded-[10px] bg-muted p-1">
        {(['list', 'month'] as ViewMode[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`flex-1 rounded-sm py-1.5 text-sm font-semibold transition-all capitalize ${
              view === v ? 'bg-white text-primary shadow-1' : 'text-muted-foreground'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* List view */}
      {view === 'list' ? (
        loading ? <div className="flex justify-center py-8"><Spinner /></div> : (
          <div className="flex flex-col gap-2">
            {records.map((r) => {
              const isLate = r.status === 'LATE';
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-sm bg-white p-3 shadow-1 border border-border">
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-sm bg-muted">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">{format(parseISO(r.date), 'MMM')}</span>
                    <span className="text-base font-extrabold text-foreground leading-none">{format(parseISO(r.date), 'd')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">
                        {format(parseISO(r.clockInAt), 'HH:mm')}
                        {r.clockOutAt ? ` – ${format(parseISO(r.clockOutAt), 'HH:mm')}` : ''}
                      </span>
                      <span className="flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {r.mode === 'OFFICE' ? <Building2 size={9} /> : <Home size={9} />}
                        {r.mode === 'OFFICE' ? 'Office' : 'Home'}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{format(parseISO(r.date), 'EEEE')}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    isLate ? 'bg-[#FEF3DD] text-[#9A6700]' : 'bg-[#E7F6EC] text-[#0A7A3C]'
                  }`}>
                    {isLate ? 'Late' : 'On time'}
                  </span>
                </div>
              );
            })}
            {records.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No records yet</p>
            ) : null}
            {total > 20 ? (
              <div className="flex justify-center gap-3 pt-2">
                <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="text-sm font-semibold text-primary disabled:opacity-40">← Prev</button>
                <span className="text-sm text-muted-foreground">Page {page}</span>
                <button type="button" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)} className="text-sm font-semibold text-primary disabled:opacity-40">Next →</button>
              </div>
            ) : null}
          </div>
        )
      ) : null}

      {/* Month calendar */}
      {view === 'month' ? (
        <div className="rounded-sm bg-white shadow-1 border border-border p-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" aria-label="Previous month" onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="p-1 rounded-sm hover:bg-muted transition-colors">
              <ChevronLeft size={18} className="text-muted-foreground" />
            </button>
            <p className="text-sm font-bold text-foreground">{format(calMonth, 'MMMM yyyy')}</p>
            <button type="button" aria-label="Next month" onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="p-1 rounded-sm hover:bg-muted transition-colors">
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map((day) => {
              const rec = getStatusForDay(day);
              const today = isToday(day);
              const dotColor = rec
                ? STATUS_COLORS[rec.status] ?? 'bg-muted-foreground'
                : null;
              return (
                <div key={day.toISOString()} className={`flex flex-col items-center py-1 rounded-sm ${today ? 'bg-primary-50' : ''}`}>
                  <span className={`text-xs font-semibold ${today ? 'text-primary' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </span>
                  {dotColor ? (
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${dotColor}`} />
                  ) : <span className="mt-0.5 h-1.5 w-1.5" />}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="mt-3 flex items-center gap-4 text-[11px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> On time</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Late</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-info" /> Leave</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HistoryPage;
