import React, { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/users.api';
import { User, Role, CreateUserPayload } from '../../types/user.types';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Min 8 characters').optional().or(z.literal('')),
  role: z.nativeEnum(Role),
  department: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const EmployeesPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fetchUsers = useCallback(() => {
    setLoading(true);
    getUsers({ page, limit: 10 })
      .then((r) => { setUsers(r.data); setTotal(r.total); })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = useCallback(() => {
    setEditing(null);
    reset({ name: '', email: '', password: '', role: Role.EMPLOYEE, department: '' });
    setModalOpen(true);
  }, [reset]);

  const openEdit = useCallback((user: User) => {
    setEditing(user);
    reset({ name: user.name, email: user.email, password: '', role: user.role as Role, department: user.department || '' });
    setModalOpen(true);
  }, [reset]);

  const handleDelete = useCallback(async (user: User) => {
    if (!confirm(`Remove ${user.name}?`)) return;
    try {
      await deleteUser(user.id);
      toast.success('Employee removed');
      fetchUsers();
    } catch {
      toast.error('Failed to delete');
    }
  }, [fetchUsers]);

  const onSubmit = useCallback(async (data: FormData) => {
    try {
      if (editing) {
        const payload = { ...data };
        if (!payload.password) delete payload.password;
        await updateUser(editing.id, payload);
        toast.success('Employee updated');
      } else {
        await createUser(data as CreateUserPayload);
        toast.success('Employee created');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    }
  }, [editing, fetchUsers]);

  const columns = useMemo(() => [
    { key: 'name', header: 'Name', render: (u: User) => <span className="font-medium">{u.name}</span> },
    { key: 'email', header: 'Email', render: (u: User) => u.email },
    { key: 'department', header: 'Department', render: (u: User) => u.department ?? '-' },
    { key: 'role', header: 'Role', render: (u: User) => (
      <Badge variant={u.role === Role.ADMIN ? 'blue' : 'gray'}>{u.role}</Badge>
    )},
    { key: 'actions', header: '', render: (u: User) => (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => openEdit(u)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(u)}>Remove</Button>
      </div>
    )},
  ], [openEdit, handleDelete]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
        <Button onClick={openCreate}>Add Employee</Button>
      </div>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <>
          <Table columns={columns} data={users} keyExtractor={(u) => u.id} emptyMessage="No employees found" />
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>{total} total</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <span className="px-2 py-1">Page {page}</span>
              <Button size="sm" variant="secondary" disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Employee' : 'Add Employee'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input {...register('name')} id="name" label="Full Name" error={errors.name?.message} />
          <Input {...register('email')} id="email" label="Email" type="email" error={errors.email?.message} />
          <Input {...register('password')} id="password" label={editing ? 'New Password (blank = keep current)' : 'Password'} type="password" error={errors.password?.message} />
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select {...register('role')} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value={Role.EMPLOYEE}>Employee</option>
              <option value={Role.ADMIN}>Admin</option>
            </select>
          </div>
          <Input {...register('department')} id="department" label="Department" error={errors.department?.message} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editing ? 'Save Changes' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
