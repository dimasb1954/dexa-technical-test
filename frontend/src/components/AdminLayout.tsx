import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-5 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-ink text-white' : 'text-ink hover:bg-line'
  }`;

export default function AdminLayout() {
  const { user } = useAuth();
  const firstName = user?.name.split(' ')[0] ?? '';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-300 pb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl">Hi, {firstName}!</h1>
        </div>
        <nav className="flex gap-1 rounded-full bg-surface p-1 shadow-card">
          <NavLink to="/admin/employees" className={tabClass}>
            Karyawan
          </NavLink>
          <NavLink to="/admin/attendances" className={tabClass}>
            Absensi
          </NavLink>
        </nav>
      </div>

      <Outlet />
    </div>
  );
}