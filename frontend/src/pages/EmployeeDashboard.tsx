import { useEffect, useState, type FormEvent } from 'react';
import {
  ATTENDANCE_URL,
  attendanceApi,
  getErrorMessage,
} from '../api/client';
import PhotoUpload from '../components/PhotoUpload';
import { useAuth } from '../context/useAuth';
import type { Attendance, Paginated } from '../types';
import { formatDateTime, todayJakarta } from '../utils';

const LIMIT = 10;

const dateFormat = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'full',
  timeZone: 'Asia/Jakarta',
});

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Jakarta',
});

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const firstName = user?.name.split(' ')[0] ?? '';

  const [now, setNow] = useState(() => new Date());
  const [photo, setPhoto] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [hasToday, setHasToday] = useState<boolean | null>(null);
  const [history, setHistory] = useState<Paginated<Attendance> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // Jam berjalan
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sudah absen hari ini?
  useEffect(() => {
    let cancelled = false;
    const today = todayJakarta();
    attendanceApi
      .get<Paginated<Attendance>>('/attendances/me', {
        params: { from: today, to: today, limit: 1 },
      })
      .then((res) => !cancelled && setHasToday(res.data.total > 0))
      .catch(() => !cancelled && setHasToday(false));
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Riwayat absen
  useEffect(() => {
    let cancelled = false;
    attendanceApi
      .get<Paginated<Attendance>>('/attendances/me', {
        params: { page, limit: LIMIT },
      })
      .then((res) => {
        if (cancelled) return;
        setHistory(res.data);
        setLoadError(null);
      })
      .catch((err) => !cancelled && setLoadError(getErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [page, refreshKey]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!photo) {
      setError('Pilih foto bukti WFH terlebih dahulu');
      return;
    }
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const form = new FormData();
    form.append('photo', photo);
    if (notes.trim()) form.append('notes', notes.trim());

    try {
      await attendanceApi.post('/attendances', form);
      setPhoto(null);
      setNotes('');
      setSuccess('Absen berhasil dicatat. Sampai jumpa besok.');
      setPage(1);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = history ? Math.max(1, Math.ceil(history.total / LIMIT)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-300 pb-8">
        <h1 className="text-4xl sm:text-5xl">Hi, {firstName}!</h1>
        <p className="text-sm font-medium text-muted">{dateFormat.format(now)}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 flex flex-col justify-between">
          <div className="flex mt-2 md:mt-4 justify-center lg:justify-start items-center">
            {hasToday === null && (
              <span className="badge bg-soft text-muted text-6xl lg:text-2xl">Memeriksa...</span>
            )}
            {hasToday === true && (
              <span className="badge badge-mint text-6xl lg:text-2xl">Sudah absen hari ini</span>
            )}
            {hasToday === false && (
              <span className="badge badge-sun text-6xl lg:text-2xl">Belum absen</span>
            )}
          </div>

          <section>
            <p className="mt-2 md:mt-8 text-8xl font-medium tracking-tighter tabular-nums">
              {timeFormat.format(now)}
            </p>
            <p className="text-xl font-medium text-center md:text-left">Waktu sekarang (WIB)</p>
          </section>

          <section className="mt-2 md:mt-8 rounded-card bg-sun p-6">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-medium">Aktivitas</span>
              <span className="badge badge-iris font-light">Statistik</span>
            </div>
            <p className="mt-4 text-5xl font-semibold tracking-tighter">
              {history?.total ?? 0} hari
            </p>
            <p className="text-md text-muted font-medium">Total kehadiran</p>
          </section>
        </div>

        <section className="card lg:col-span-2 mt-2 md:mt-4">
          <h2 className="text-2xl">Absen WFH</h2>
          <p className="mb-5 mt-1 text-sm text-muted border-b border-stone-300 pb-4">
            Unggah foto sebagai bukti kamu sedang bekerja dari rumah.
          </p>

          {hasToday === null && (
            <p className="text-sm text-muted">Memeriksa status absen...</p>
          )}

          {hasToday && (
            <p className="notice">
              {success ?? 'Kamu sudah absen hari ini. Sampai jumpa besok.'}
            </p>
          )}

          {hasToday === false && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <PhotoUpload file={photo} onChange={setPhoto} disabled={submitting} />

              <label className="field">
                Catatan (opsional)
                <textarea
                  className="input resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={255}
                  rows={2}
                  disabled={submitting}
                />
              </label>

              {error && (
                <p className="text-sm font-medium text-danger">{error}</p>
              )}

              <button
                className="btn btn-primary w-full sm:w-auto"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Mengirim...' : 'Kirim Absen'}
              </button>
            </form>
          )}
        </section>
      </div>

      <section className="card">
        <h2 className="mb-4 text-2xl border-b border-stone-300 pb-4">Riwayat Absen</h2>

        {loadError && (
          <p className="text-sm font-medium text-danger">{loadError}</p>
        )}
        {!history && !loadError && (
          <p className="text-sm text-muted">Memuat...</p>
        )}
        {history && history.data.length === 0 && (
          <p className="text-sm text-muted">Belum ada riwayat absen.</p>
        )}

        {history && history.data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="pb-3 pr-4">Waktu</th>
                    <th className="pb-3 pr-4">Catatan</th>
                    <th className="pb-3">Foto</th>
                  </tr>
                </thead>
                <tbody>
                  {history.data.map((a) => (
                    <tr key={a.id} className="border-t border-line">
                      <td className="py-3 pr-4">{formatDateTime(a.checkedInAt)}</td>
                      <td className="py-3 pr-4 text-muted">{a.notes ?? '-'}</td>
                      <td className="py-3">
                        <a
                          href={`${ATTENDANCE_URL}${a.photoPath}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            className="size-14 rounded-xl object-cover"
                            src={`${ATTENDANCE_URL}${a.photoPath}`}
                            alt={`Foto absen ${a.attendanceDate}`}
                          />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm">
              <button
                className="btn btn-soft"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </button>
              <span className="text-muted">
                Halaman {page} dari {totalPages}
              </span>
              <button
                className="btn btn-soft"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}