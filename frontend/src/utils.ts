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

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Jakarta',
});

export const formatTime = (iso: string) =>
  `${timeFormatter.format(new Date(iso))} WIB`;

// Menerima 'YYYY-MM-DD'
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(`${date.slice(0, 10)}T00:00:00+07:00`));