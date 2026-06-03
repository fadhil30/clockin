import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { getAllAttendance, getAttendanceById } from '../../api/attendance.api';
import { getUsers } from '../../api/users.api';
import { Attendance } from '../../types/attendance.types';
import { User } from '../../types/user.types';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

const AttendancePage: React.FC = () => {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ date: '', department: '', userId: '' });
  const [detail, setDetail] = useState<Attendance | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _employeeMap = useMemo(
    () => new Map(employees.map((e) => [e.id, e])),
    [employees],
  );

  useEffect(() => {
    getUsers({ limit: 200 }).then((r) => setEmployees(r.data));
  }, []);

  const fetchRecords = useCallback(() => {
    setLoading(true);
    getAllAttendance({
      page,
      limit: 20,
      date: filters.date || undefined,
      department: filters.department || undefined,
      userId: filters.userId ? Number(filters.userId) : undefined,
    })
      .then((r) => { setRecords(r.data); setTotal(r.total); })
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleViewDetail = useCallback((id: number) => {
    getAttendanceById(id).then(setDetail);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ date: '', department: '', userId: '' });
    setPage(1);
  }, []);

  const columns = useMemo(() => [
    { key: 'employee', header: 'Employee', render: (r: Attendance) => r.user?.name ?? '-' },
    { key: 'department', header: 'Department', render: (r: Attendance) => r.user?.department ?? '-' },
    { key: 'date', header: 'Date', render: (r: Attendance) => r.date },
    { key: 'clockIn', header: 'Clock In', render: (r: Attendance) => format(new Date(r.clockInAt), 'HH:mm') },
    { key: 'clockOut', header: 'Clock Out', render: (r: Attendance) => (
      r.clockOutAt ? format(new Date(r.clockOutAt), 'HH:mm') : <span className="text-gray-400">—</span>
    )},
    { key: 'photo', header: 'Photo', render: (r: Attendance) => (
      r.photoUrl ? <Badge variant="blue">Uploaded</Badge> : <Badge variant="gray">None</Badge>
    )},
    { key: 'actions', header: '', render: (r: Attendance) => (
      <Button size="sm" variant="ghost" onClick={() => handleViewDetail(r.id)}>View</Button>
    )},
  ], [handleViewDetail]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Attendance Logs</h2>
        <span className="text-sm text-gray-400">{total} records</span>
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input type="date" value={filters.date} onChange={(e) => setFilters(f => ({ ...f, date: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input type="text" placeholder="Department" value={filters.department} onChange={(e) => setFilters(f => ({ ...f, department: e.target.value }))} className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <select value={filters.userId} onChange={(e) => setFilters(f => ({ ...f, userId: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Employees</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <Button size="sm" variant="secondary" onClick={clearFilters}>Clear</Button>
      </div>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <>
          <Table columns={columns} data={records} keyExtractor={(r) => r.id} emptyMessage="No records found" />
          <div className="mt-4 flex justify-end gap-2">
            <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <span className="px-2 py-1 text-sm">Page {page}</span>
            <Button size="sm" variant="secondary" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </>
      )}
      {detail ? (
        <Modal isOpen onClose={() => setDetail(null)} title="Attendance Detail">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Employee</span><span className="font-medium">{detail.user?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Department</span><span>{detail.user?.department ?? '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{detail.date}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Clock In</span><span>{format(new Date(detail.clockInAt), 'HH:mm:ss')}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Clock Out</span><span>{detail.clockOutAt ? format(new Date(detail.clockOutAt), 'HH:mm:ss') : '—'}</span></div>
            {detail.latitude ? (
              <div className="flex justify-between">
                <span className="text-gray-500">Location</span>
                <a href={`https://maps.google.com/?q=${detail.latitude},${detail.longitude}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View on Maps</a>
              </div>
            ) : null}
            {detail.photoUrl ? (
              <div>
                <p className="mb-2 text-gray-500">WFH Photo</p>
                <img src={detail.photoUrl} alt="WFH proof" className="w-full rounded-lg object-cover" />
              </div>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  );
};

export default AttendancePage;
