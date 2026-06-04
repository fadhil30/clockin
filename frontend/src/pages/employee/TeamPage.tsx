import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Home, Building2 } from 'lucide-react';
import { getPresenceToday } from '../../api/attendance.api';
import type { PresencePerson, PresenceStatus } from '../../types/attendance.types';
import { Avatar } from '../../components/ui/Avatar';
import { Spinner } from '../../components/ui/Spinner';

const GROUP_CONFIG: { status: PresenceStatus; label: string; dot: string }[] = [
  { status: 'in', label: 'Clocked In', dot: 'bg-success' },
  { status: 'done', label: 'Done for Today', dot: 'bg-info' },
  { status: 'leave', label: 'On Leave', dot: 'bg-warning' },
  { status: 'not_in', label: 'Not In Yet', dot: 'bg-muted-foreground' },
];

const TeamPage: React.FC = () => {
  const [people, setPeople] = useState<PresencePerson[]>([]);
  const [counts, setCounts] = useState<Record<PresenceStatus, number>>({ in: 0, done: 0, leave: 0, not_in: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPresenceToday()
      .then((r) => { setPeople(r.people); setCounts(r.counts); })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const CHIP_COLORS: Record<PresenceStatus, string> = {
    in: 'bg-[#E7F6EC] text-[#0A7A3C]',
    done: 'bg-[#E8F0FF] text-[#1D5FD0]',
    leave: 'bg-[#FEF3DD] text-[#9A6700]',
    not_in: 'bg-[#F1EEF6] text-[#6B6480]',
  };

  return (
    <div className="flex flex-col gap-4 px-5 py-6">
      <h2 className="text-lg font-extrabold text-foreground">Team</h2>

      {/* Rollup chips */}
      <div className="flex flex-wrap gap-2">
        {GROUP_CONFIG.map(({ status, label, dot }) => (
          <span key={status} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${CHIP_COLORS[status]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {counts[status]} {label}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="flex flex-col gap-4">
          {GROUP_CONFIG.map(({ status, label, dot }) => {
            const group = people.filter((p) => p.status === status);
            if (group.length === 0) return null;
            return (
              <div key={status} className="rounded-sm bg-white shadow-1 border border-border overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  <p className="text-xs font-bold text-foreground">{label}</p>
                  <span className="ml-auto text-xs font-semibold text-muted-foreground">{group.length}</span>
                </div>
                {group.map((person) => (
                  <div key={person.employeeId} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
                    <div className="relative">
                      <Avatar name={person.name} size={36} />
                      <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${dot}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{person.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{person.role ?? person.department ?? '—'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {person.mode && (
                        <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {person.mode === 'OFFICE' ? <Building2 size={9} /> : <Home size={9} />}
                          {person.mode === 'OFFICE' ? 'Office' : 'Home'}
                        </span>
                      )}
                      {person.since && (
                        <span className="text-[10px] text-muted-foreground">
                          since {format(parseISO(person.since), 'HH:mm')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {people.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No team data available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamPage;
