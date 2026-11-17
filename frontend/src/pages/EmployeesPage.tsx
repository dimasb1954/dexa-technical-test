import { useEffect, useState } from 'react';
import { authApi, getErrorMessage } from '../api/client';
import DataTable from '../components/DataTable';
import EmployeeFormModal from '../components/EmployeeFormModal';
import { useAuth } from '../context/useAuth';
import type { Column, Employee } from '../types';

interface Result {
  key: string;
  rows: Employee[];
  error: string | null;
}

export default function EmployeesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [modal, setModal] = useState<{ employee: Employee | null } | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const requestKey = `${query}|${refreshKey}`;
  const loading = result?.key !== requestKey;

  // Debounce pencarian
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    authApi
      .get<Employee[]>('/employees', {
        params: { search: query || undefined },
      })
      .then(
        (res) =>
          !cancelled &&
          setResult({ key: requestKey, rows: res.data, error: null }),
      )
      .catch(
        (err) =>
          !cancelled &&
          setResult({ key: requestKey, rows: [], error: getErrorMessage(err) }),
      );
    return () => {
      cancelled = true;
    };
  }, [query, requestKey]);

  const toggleActive = async (emp: Employee) => {
    setActionError(null);
    if (
      emp.isActive &&
      !window.confirm(`Nonaktifkan ${emp.name}? Karyawan tidak akan bisa login.`)
    ) {
      return;
    }
    try {
      if (emp.isActive) await authApi.delete(`/employees/${emp.id}`);
      else await authApi.patch(`/employees/${emp.id}`, { isActive: true });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Karyawan',
      render: (e) => (
        <div>
          <p className="font-semibold">{e.name}</p>
          <p className="text-xs text-muted">{e.email}</p>
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Jabatan',
      render: (e) => (
        <div>
          <p>{e.position || '-'}</p>
          <p className="text-xs text-muted">{e.department || '-'}</p>
        </div>
      ),
    },
    { key: 'phone', header: 'Telepon', render: (e) => e.phone || '-' },
    {
      key: 'role',
      header: 'Role',
      render: (e) =>
        e.role === 'ADMIN_HRD' ? (
          <span className="badge badge-iris">Admin HRD</span>
        ) : (
          <span className="badge bg-soft text-ink">Karyawan</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (e) =>
        e.isActive ? (
          <span className="badge badge-mint">Aktif</span>
        ) : (
          <span className="badge bg-soft text-muted">Nonaktif</span>
        ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (e) => (
        <div className="flex gap-2">
          <button
            className="btn btn-soft px-3 py-1.5 text-xs"
            onClick={() => setModal({ employee: e })}
          >
            Ubah
          </button>
          {e.id !== user?.id && (
            <button
              className={`btn btn-soft px-3 py-1.5 text-xs ${e.isActive ? 'text-danger' : ''}`}
              onClick={() => toggleActive(e)}
            >
              {e.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <section className="card">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-stone-300 pb-4">
        <div>
          <h2 className="text-2xl">Data Karyawan</h2>
          <p className="text-sm text-muted">
            {loading ? 'Memuat...' : `${result?.rows.length ?? 0} karyawan`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="input w-56"
            type="search"
            placeholder="Cari nama atau email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={() => setModal({ employee: null })}
          >
            + Tambah Karyawan
          </button>
        </div>
      </div>

      {(result?.error || actionError) && (
        <p className="mb-3 text-sm font-medium text-danger">
          {actionError ?? result?.error}
        </p>
      )}

      <DataTable
        columns={columns}
        rows={result?.rows ?? []}
        rowKey={(e) => e.id}
        loading={loading}
        emptyMessage="Belum ada karyawan yang cocok."
      />

      {modal && user && (
        <EmployeeFormModal
          key={modal.employee?.id ?? 'new'}
          employee={modal.employee}
          currentUserId={user.id}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </section>
  );
}