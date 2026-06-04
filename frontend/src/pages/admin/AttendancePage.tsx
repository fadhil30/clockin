import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Download, X, Home, Building2, MapPin, Lock } from 'lucide-react';
import useSWR from 'swr';
import { getAllAttendance, getAttendanceById } from '../../api/attendance.api';
import type { Attendance } from '../../types/attendance.types';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

type Range = 'today' | 'week' | 'month';

function getRangeDates(range: Range): { date?: string; startDate?: string; endDate?: string } {
  const today = new Date();
  const fmt = (d: Date) => format(d, 'yyyy-MM-dd');
  if (range === 'today') return { date: fmt(today) };
  if (range === 'week') return { startDate: fmt(startOfWeek(today, { weekStartsOn: 1 })), endDate: fmt(endOfWeek(today, { weekStartsOn: 1 })) };
  return { startDate: fmt(startOfMonth(today)), endDate: fmt(endOfMonth(today)) };
}

function exportCsv(records: Attendance[]) {
  const header = ['ID', 'Employee', 'Department', 'Date', 'Clock In', 'Clock Out', 'Mode', 'Status', 'Photo'];
  const rows = records.map((r) => [
    r.id,
    r.user?.name ?? '',
    r.user?.department ?? '',
    r.date,
    format(parseISO(r.clockInAt), 'HH:mm'),
    r.clockOutAt ? format(parseISO(r.clockOutAt), 'HH:mm') : '',
    r.mode ?? '',
    r.status,
    r.photoUrl ?? '',
  ]);
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const AttendancePage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [range, setRange] = useState<Range>('today');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<Attendance | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setPage(1); }, [range]);

  const { data: attendanceData, isLoading: loading } = useSWR(
    ['/attendance', page, range] as const,
    ([, p, r]) => getAllAttendance({ page: p, limit: 20, ...getRangeDates(r) }),
  );

  const records: Attendance[] = attendanceData?.data ?? [];
  const total = attendanceData?.total ?? 0;

  const handleViewDetail = useCallback(async (id: number) => {
    const rec = await getAttendanceById(id);
    setDetail(rec);
    setDrawerOpen(true);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return records;
    const q = search.toLowerCase();
    return records.filter((r) =>
      (r.user?.name ?? '').toLowerCase().includes(q) ||
      (r.user?.department ?? '').toLowerCase().includes(q),
    );
  }, [records, search]);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Attendance Logs</h1>
          <p className="text-sm text-muted-foreground">{total} records</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCsv(filtered)}>
          <Download size={15} /> Export CSV
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Range segmented */}
        <div className="flex rounded-[10px] bg-muted p-1">
          {(['today', 'week', 'month'] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-sm px-3 py-1.5 text-sm font-semibold capitalize transition-all ${
                range === r ? 'bg-white text-primary shadow-1' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r === 'today' ? 'Today' : r === 'week' ? 'This week' : 'This month'}
            </button>
          ))}
        </div>
        <input
          type="text"
          aria-label="Search attendance records"
          placeholder="Search employee…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 rounded-sm border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow-1 border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['Employee', 'Proof', 'Clock In', 'Mode', 'Location', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => handleViewDetail(r.id)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.user?.name ?? 'U'} size={32} />
                      <div>
                        <p className="font-semibold text-foreground">{r.user?.name ?? '—'}</p>
                        <p className="text-[11px] text-muted-foreground">{r.user?.department ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {r.photoUrl ? (
                      <img src={r.photoUrl} alt="proof" className="h-9 w-9 rounded-sm object-cover border border-border" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-muted text-[10px] text-muted-foreground">—</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{format(parseISO(r.clockInAt), 'HH:mm')}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {r.mode === 'OFFICE' ? <Building2 size={13} /> : <Home size={13} />}
                      {r.mode === 'OFFICE' ? 'Office' : 'Home'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {r.latitude !== null && r.latitude !== undefined ? `${Number(r.latitude).toFixed(3)}, ${Number(r.longitude).toFixed(3)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      r.status === 'LATE' ? 'bg-[#FEF3DD] text-[#9A6700]' : 'bg-[#E7F6EC] text-[#0A7A3C]'
                    }`}>
                      {r.status === 'LATE' ? 'Late' : 'On time'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-xs font-semibold text-primary hover:text-primary-600 transition-colors"
                      onClick={(e) => { e.stopPropagation(); handleViewDetail(r.id); }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No records found</td></tr>
              ) : null}
            </tbody>
          </table>
          {total > 20 ? (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <span className="text-xs text-muted-foreground">Page {page}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                <Button size="sm" variant="secondary" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Right drawer */}
      {drawerOpen && detail ? (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-white shadow-3 border-l border-border overflow-y-auto">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={detail.user?.name ?? 'U'} size={36} />
                <div>
                  <p className="text-sm font-bold text-foreground">{detail.user?.name ?? '—'}</p>
                  <p className="text-[11px] text-muted-foreground">{detail.user?.department ?? '—'}</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setDrawerOpen(false)}
                className="rounded-sm p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4 p-5">
              {/* Locked note */}
              <div className="flex items-center gap-2 rounded-sm bg-[#FEF3DD] border border-[#FBE3AE] px-3 py-2.5">
                <Lock size={13} className="shrink-0 text-[#9A6700]" />
                <p className="text-xs font-semibold text-[#9A6700]">
                  View-only record — timestamp and photo can't be altered
                </p>
              </div>

              {/* Large proof photo */}
              {detail.photoUrl ? (
                <img src={detail.photoUrl} alt="WFH proof" className="w-full rounded-lg object-cover border border-border aspect-[4/3]" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-muted border border-border text-sm text-muted-foreground">
                  No photo submitted
                </div>
              )}

              {/* Details card */}
              <div className="rounded-sm bg-muted border border-border divide-y divide-border text-sm overflow-hidden">
                {[
                  { label: 'Clock In', value: format(parseISO(detail.clockInAt), 'HH:mm:ss') },
                  { label: 'Clock Out', value: detail.clockOutAt ? format(parseISO(detail.clockOutAt), 'HH:mm:ss') : '—' },
                  { label: 'Date', value: detail.date },
                  { label: 'Work Mode', value: detail.mode === 'OFFICE' ? 'Office' : 'Home' },
                  { label: 'Status', value: detail.status },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between px-4 py-2.5">
                    <span className="font-semibold text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              {/* Map link — safe null check (latitude 0 is a valid coordinate) */}
              {detail.latitude !== null && detail.latitude !== undefined ? (
                <a
                  href={`https://maps.google.com/?q=${detail.latitude},${detail.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-sm border border-border bg-white px-4 py-3 text-sm font-semibold text-primary hover:bg-primary-50 transition-colors"
                >
                  <MapPin size={15} />
                  View location on Google Maps
                </a>
              ) : null}

              {/* Late flag */}
              {detail.status === 'LATE' ? (
                <div className="rounded-sm bg-[#FEF3DD] border border-[#FBE3AE] px-3 py-2.5">
                  <p className="text-xs font-semibold text-[#9A6700]">⚠ This record was flagged as late (after 09:15)</p>
                </div>
              ) : null}
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
};

export default AttendancePage;
