import { useEffect, useState } from 'react';
import {
  ATTENDANCE_URL,
  attendanceApi,
  getErrorMessage,
} from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import type { Attendance, Column, Paginated } from '../types';
import { formatDate, formatTime } from '../utils';

const LIMIT = 10;

interface Filters {
  from: string;
  to: string;
  name: string;
}

const EMPTY: Filters = { from: '', to: '', name: '' };

interface Result {
  key: string;
  data: Paginated<Attendance> | null;
  error: string | null;
}

export default function AttendancesPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Result | null>(null);
  const [photo, setPhoto] = useState<Attendance | null>(null);

  const requestKey = JSON.stringify([applied, page]);
  const loading = result?.key !== requestKey;
  const invalidRange = !!filters.from && !!filters.to && filters.from > filters.to;
  const hasFilter = filters.from || filters.to || filters.name;

  // Terapkan filter setelah user berhenti mengetik
  useEffect(() => {
    const timer = setTimeout(() => setApplied(filters), 350);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    attendanceApi
      .get<Paginated<Attendance>>('/attendances', {
        params: {
          from: applied.from || undefined,
          to: applied.to || undefined,
          name: applied.name.trim() || undefined,
          page,
          limit: LIMIT,
        },
      })
      .then(
        (res) =>
          !cancelled &&
          setResult({ key: requestKey, data: res.data, error: null }),
      )
      .catch(
        (err) =>
          !cancelled &&
          setResult({ key: requestKey, data: null, error: getErrorMessage(err) }),
      );
    return () => {
      cancelled = true;
    };
  }, [applied, page, requestKey]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const reset = () => {
    setFilters(EMPTY);
    setApplied(EMPTY);
    setPage(1);
  };

  const columns: Column<Attendance>[] = [
    {
      key: 'date',
      header: 'Tanggal',
      render: (a) => formatDate(a.attendanceDate),
    },
    {
      key: 'employee',
      header: 'Karyawan',
      render: (a) => (
        <div>
          <p className="font-semibold">{a.employeeName}</p>
          <p className="text-xs text-muted">{a.employeeEmail}</p>
        </div>
      ),
    },
    {
      key: 'time',
      header: 'Waktu Absen',
      render: (a) => formatTime(a.checkedInAt),
    },
    {
      key: 'notes',
      header: 'Catatan',
      render: (a) => <span className="text-muted">{a.notes ?? '-'}</span>,
    },
    {
      key: 'photo',
      header: 'Foto',
      render: (a) => (
        <button type="button" onClick={() => setPhoto(a)}>
          <img
            className="size-14 rounded-xl object-cover"
            src={`${ATTENDANCE_URL}${a.photoPath}`}
            alt={`Foto absen ${a.employeeName}`}
          />
        </button>
      ),
    },
  ];

  return (
    <section className="card">
      <div className="mb-5 border-b border-stone-300 pb-4">
        <h2 className="text-2xl">Monitoring Absensi</h2>
        <p className="text-sm text-muted">
          Data absensi yang disubmit karyawan (hanya lihat).
        </p>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="field">
          Dari tanggal
          <input
            className="input"
            type="date"
            value={filters.from}
            onChange={(e) => updateFilter('from', e.target.value)}
          />
        </label>
        <label className="field">
          Sampai tanggal
          <input
            className="input"
            type="date"
            value={filters.to}
            onChange={(e) => updateFilter('to', e.target.value)}
          />
        </label>
        <label className="field">
          Nama karyawan
          <input
            className="input"
            type="search"
            placeholder="Cari nama"
            value={filters.name}
            onChange={(e) => updateFilter('name', e.target.value)}
          />
        </label>
        <div className="flex items-end">
          <button
            className="btn btn-soft w-full"
            onClick={reset}
            disabled={!hasFilter}
          >
            Reset filter
          </button>
        </div>
      </div>

      {invalidRange && (
        <p className="mb-3 text-sm font-medium text-danger">
          Tanggal awal tidak boleh setelah tanggal akhir.
        </p>
      )}
      {result?.error && (
        <p className="mb-3 text-sm font-medium text-danger">{result.error}</p>
      )}

      <DataTable
        columns={columns}
        rows={result?.data?.data ?? []}
        rowKey={(a) => a.id}
        loading={loading}
        emptyMessage="Tidak ada data absensi untuk filter ini."
        pagination={{
          page,
          limit: LIMIT,
          total: result?.data?.total ?? 0,
          onPageChange: setPage,
        }}
      />

      {photo && (
        <Modal
          title={`Foto absen: ${photo.employeeName}`}
          onClose={() => setPhoto(null)}
          wide
        >
          <img
            className="max-h-[70vh] w-full rounded-2xl object-contain"
            src={`${ATTENDANCE_URL}${photo.photoPath}`}
            alt={`Foto absen ${photo.employeeName}`}
          />
          <p className="mt-3 text-sm text-muted">
            {formatDate(photo.attendanceDate)} &middot;{' '}
            {formatTime(photo.checkedInAt)}
            {photo.notes ? ` · ${photo.notes}` : ''}
          </p>
        </Modal>
      )}
    </section>
  );
}