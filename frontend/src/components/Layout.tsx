import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6">
      <header className="mb-8 flex items-center justify-between rounded-full bg-surface px-4 py-2.5 shadow-card sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-ink text-sm font-extrabold text-white">
            D
          </span>
          <span className="text-lg font-bold tracking-tight">
            Dexa Attendance
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted">
                {user.role === 'ADMIN_HRD' ? 'Admin HRD' : 'Karyawan'}
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Keluar
            </button>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}