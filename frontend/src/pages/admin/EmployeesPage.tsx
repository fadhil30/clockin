import React, { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, UserPlus } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/users.api';
import { type User, Role, type CreateUserPayload, type EmploymentType, type UserStatus } from '../../types/user.types';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Min 8 chars').optional().or(z.literal('')),
  role: z.nativeEnum(Role),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INVITED', 'SUSPENDED']).optional().or(z.literal('')),
  defaultLocation: z.string().optional(),
  joinedAt: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const EMP_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full-time', PART_TIME: 'Part-time', CONTRACT: 'Contract',
};
const STATUS_PILL: Record<string, string> = {
  ACTIVE: 'bg-[#E7F6EC] text-[#0A7A3C]',
  INVITED: 'bg-[#E8F0FF] text-[#1D5FD0]',
  SUSPENDED: 'bg-[#FCE9EA] text-[#B81722]',
};
const TYPE_PILL = 'bg-[#F1EEF6] text-[#6B6480]';

const EmployeesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const { data: usersData, isLoading: loading, mutate: mutateUsers } = useSWR(
    ['/users', page] as const,
    ([, p]) => getUsers({ page: p, limit: 10 }),
  );

  const users: User[] = usersData?.data ?? [];
  const total = usersData?.total ?? 0;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const departments = useMemo(() => [...new Set(users.map((u) => u.department).filter(Boolean))], [users]);

  const filtered = useMemo(() => users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchDept = !deptFilter || u.department === deptFilter;
    return matchSearch && matchDept;
  }), [users, search, deptFilter]);

  const openCreate = useCallback(() => {
    setEditing(null);
    reset({ name: '', email: '', password: '', role: Role.EMPLOYEE, department: '', jobTitle: '', phone: '', employmentType: '', status: 'ACTIVE', defaultLocation: '', joinedAt: '' });
    setDrawerOpen(true);
  }, [reset]);

  const openEdit = useCallback((user: User) => {
    setEditing(user);
    reset({
      name: user.name, email: user.email, password: '', role: user.role as Role,
      department: user.department ?? '', jobTitle: user.jobTitle ?? '', phone: user.phone ?? '',
      employmentType: (user.employmentType as EmploymentType) ?? '',
      status: (user.status as UserStatus) ?? '',
      defaultLocation: user.defaultLocation ?? '', joinedAt: user.joinedAt ?? '',
    });
    setDrawerOpen(true);
  }, [reset]);

  const handleDelete = useCallback(async (user: User) => {
    if (!confirm(`Remove ${user.name}?`)) return;
    try {
      await deleteUser(user.id);
      toast.success('Employee removed');
      mutateUsers();
    } catch {
      toast.error('Failed to delete');
    }
  }, [mutateUsers]);

  const onSubmit = useCallback(async (data: FormData) => {
    try {
      const clean = { ...data };
      if (!clean.password) delete clean.password;
      if (!clean.employmentType) delete clean.employmentType;
      if (!clean.status) delete clean.status;
      if (!clean.joinedAt) delete clean.joinedAt;
      if (!clean.department) delete clean.department;
      if (!clean.jobTitle) delete clean.jobTitle;
      if (!clean.phone) delete clean.phone;
      if (!clean.defaultLocation) delete clean.defaultLocation;
      if (editing) {
        await updateUser(editing.id, clean);
        toast.success('Employee updated');
      } else {
        await createUser(clean as CreateUserPayload);
        toast.success('Employee created');
      }
      setDrawerOpen(false);
      mutateUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Operation failed');
    }
  }, [editing, mutateUsers]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Employees</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <Button onClick={openCreate}>
          <UserPlus size={16} /> Add Employee
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          aria-label="Search employees"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 rounded-sm border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
        />
        <select
          aria-label="Filter by department"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-9 rounded-sm border border-border bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
        >
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d!}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow-1 border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['Employee', 'Department', 'Type', 'Status', 'Joined', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} size={32} />
                      <div>
                        <p className="font-semibold text-foreground">{u.name}</p>
                        <p className="text-[11px] text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.department ?? '—'}</td>
                  <td className="px-4 py-3">
                    {u.employmentType ? (
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${TYPE_PILL}`}>
                        {EMP_TYPE_LABELS[u.employmentType] ?? u.employmentType}
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {u.status ? (
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_PILL[u.status] ?? 'bg-muted text-muted-foreground'}`}>
                        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />
                        {u.status}
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{u.joinedAt ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEdit(u)} className="text-xs font-semibold text-primary hover:text-primary-600 transition-colors">Edit</button>
                      <button type="button" onClick={() => handleDelete(u)} className="text-xs font-semibold text-destructive hover:opacity-75 transition-opacity">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">No employees found</td></tr>
              ) : null}
            </tbody>
          </table>
          {total > 10 ? (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <span className="text-xs text-muted-foreground">Page {page} · {total} total</span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                <Button size="sm" variant="secondary" disabled={page * 10 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Right drawer */}
      {drawerOpen ? (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col bg-white shadow-3 border-l border-border overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-bold text-foreground">{editing ? 'Edit Employee' : 'Add Employee'}</h2>
              <button type="button" aria-label="Close" onClick={() => setDrawerOpen(false)} className="rounded-sm p-1.5 text-muted-foreground hover:bg-muted transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                <Input {...register('name')} id="name" label="Full Name *" error={errors.name?.message} className="col-span-2" />
                <Input {...register('email')} id="email" label="Email *" type="email" error={errors.email?.message} className="col-span-2" />
                <Input {...register('password')} id="password" label={editing ? 'New Password (blank = keep)' : 'Password *'} type="password" error={errors.password?.message} className="col-span-2" />
                <Input {...register('jobTitle')} id="jobTitle" label="Job Title" />
                <Input {...register('phone')} id="phone" label="Phone" type="tel" />
                <Input {...register('department')} id="department" label="Department" />
                <Input {...register('defaultLocation')} id="defaultLocation" label="Default Location" />

                <div className="flex flex-col gap-1">
                  <label htmlFor="role" className="text-[13px] font-semibold text-foreground">Role *</label>
                  <select {...register('role')} id="role" className="h-[46px] rounded-sm border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary">
                    <option value={Role.EMPLOYEE}>Employee</option>
                    <option value={Role.ADMIN}>Admin</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="employmentType" className="text-[13px] font-semibold text-foreground">Employment Type</label>
                  <select {...register('employmentType')} id="employmentType" className="h-[46px] rounded-sm border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary">
                    <option value="">— Select —</option>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="CONTRACT">Contract</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="status" className="text-[13px] font-semibold text-foreground">Status</label>
                  <select {...register('status')} id="status" className="h-[46px] rounded-sm border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary">
                    <option value="">— Select —</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INVITED">Invited</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <Input {...register('joinedAt')} id="joinedAt" label="Joined Date" type="date" />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                {editing ? (
                  <button type="button" onClick={() => handleDelete(editing)} className="text-sm font-semibold text-destructive hover:opacity-75 transition-opacity">
                    Remove employee
                  </button>
                ) : null}
                <div className="ml-auto flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</Button>
                  <Button type="submit" loading={isSubmitting}>{editing ? 'Save Changes' : 'Create'}</Button>
                </div>
              </div>
            </form>
          </aside>
        </>
      ) : null}
    </div>
  );
};

export default EmployeesPage;
