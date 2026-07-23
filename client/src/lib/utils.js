import { clsx } from 'clsx';

export function cn(...classes) {
  return clsx(...classes);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(date));
}

export function truncate(str, len = 100) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
}
