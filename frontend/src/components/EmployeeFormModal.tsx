import { useState, type ChangeEvent, type FormEvent } from 'react';
import { authApi, getErrorMessage } from '../api/client';
import type { Employee } from '../types';
import Modal from './Modal';

interface Props {
  employee: Employee | null;
  currentUserId: number;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  position: string;
  department: string;
  phone: string;
  role: string;
}

export default function EmployeeFormModal({
  employee,
  currentUserId,
  onClose,
  onSaved,
}: Props) {
  const isEdit = employee !== null;
  const isSelf = employee?.id === currentUserId;

  const [form, setForm] = useState<FormState>({
    name: employee?.name ?? '',
    email: employee?.email ?? '',
    password: '',
    position: employee?.position ?? '',
    department: employee?.department ?? '',
    phone: employee?.phone ?? '',
    role: employee?.role ?? 'EMPLOYEE',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set =
    (key: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const body: Record<string, string> = {
      name: form.name.trim(),
      email: form.email.trim(),
      position: form.position.trim(),
      department: form.department.trim(),
      phone: form.phone.trim(),
      role: form.role,
    };
    // Password hanya dikirim bila diisi (saat ubah, kosong = tidak diganti)
    if (form.password) body.password = form.password;

    try {
      if (isEdit) await authApi.patch(`/employees/${employee.id}`, body);
      else await authApi.post('/employees', body);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Ubah Karyawan' : 'Tambah Karyawan'}
      onClose={onClose}
      closeOnBackdrop={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="field">
          Nama
          <input
            className="input"
            value={form.name}
            onChange={set('name')}
            maxLength={100}
            required
            autoFocus
          />
        </label>

        <label className="field">
          Email
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={set('email')}
            required
          />
        </label>

        <label className="field">
          {isEdit ? 'Password baru (kosongkan bila tidak diganti)' : 'Password'}
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={set('password')}
            minLength={8}
            required={!isEdit}
            autoComplete="new-password"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field">
            Jabatan
            <input
              className="input"
              value={form.position}
              onChange={set('position')}
              maxLength={100}
            />
          </label>
          <label className="field">
            Departemen
            <input
              className="input"
              value={form.department}
              onChange={set('department')}
              maxLength={100}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field">
            Telepon
            <input
              className="input"
              value={form.phone}
              onChange={set('phone')}
              maxLength={20}
            />
          </label>
          <label className="field">
            Role
            <select
              className="input"
              value={form.role}
              onChange={set('role')}
              disabled={isSelf}
            >
              <option value="EMPLOYEE">Karyawan</option>
              <option value="ADMIN_HRD">Admin HRD</option>
            </select>
          </label>
        </div>
        {isSelf && (
          <p className="text-xs text-muted">
            Role akunmu sendiri tidak bisa diubah supaya tidak terkunci.
          </p>
        )}

        {error && <p className="text-sm font-medium text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-soft" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}