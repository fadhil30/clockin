import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, Calendar, Briefcase, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-[#E7F6EC] text-[#0A7A3C]',
  INVITED: 'bg-[#E8F0FF] text-[#1D5FD0]',
  SUSPENDED: 'bg-[#FCE9EA] text-[#B81722]',
};

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = () => { logout(); navigate('/login'); };

  if (!user) return null;

  const infoRows = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone ?? '—' },
    { icon: Briefcase, label: 'Job Title', value: user.jobTitle ?? '—' },
    { icon: MapPin, label: 'Default Location', value: user.defaultLocation ?? '—' },
    { icon: Calendar, label: 'Joined', value: user.joinedAt ? format(new Date(user.joinedAt), 'MMM d, yyyy') : '—' },
  ];

  return (
    <div className="flex flex-col gap-4 px-5 py-6">
      {/* Profile card */}
      <div className="rounded-lg bg-white shadow-1 border border-border p-5 flex flex-col items-center gap-3">
        <Avatar name={user.name} size={76} ring />
        <div className="text-center">
          <h2 className="text-lg font-extrabold text-foreground">{user.name}</h2>
          <p className="text-sm text-muted-foreground">
            {user.jobTitle ?? user.role} {user.department ? `· ${user.department}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {user.employmentType && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
              {EMPLOYMENT_LABELS[user.employmentType] ?? user.employmentType}
            </span>
          )}
          {user.status && (
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[user.status] ?? 'bg-muted text-muted-foreground'}`}>
              {user.status}
            </span>
          )}
        </div>
      </div>

      {/* Info list */}
      <div className="rounded-sm bg-white shadow-1 border border-border overflow-hidden">
        {infoRows.map(({ icon: Icon, label, value }, i) => (
          <div
            key={label}
            className={`flex items-center gap-3 px-4 py-3.5 ${i < infoRows.length - 1 ? 'border-b border-border' : ''}`}
          >
            <Icon size={16} className="shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold text-foreground truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <Button variant="dangerGhost" size="lg" className="w-full" onClick={handleSignOut}>
        <LogOut size={16} /> Sign out
      </Button>
    </div>
  );
};

export default ProfilePage;
