import type { Role } from './types';

export const homeFor = (role: Role) =>
  role === 'ADMIN_HRD' ? '/admin' : '/employee';

// Tanggal hari ini dgn format YYYY-MM-DD
export const todayJakarta = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(iso));