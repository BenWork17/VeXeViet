import type { AdminRole, AdminSection } from './types';

const OPERATOR_ALLOWED: AdminSection[] = ['dashboard', 'bookings', 'payments', 'routes', 'operator-images'];

export function canAccessSection(role: AdminRole, section: AdminSection) {
  if (role === 'ADMIN') return true;
  return OPERATOR_ALLOWED.includes(section);
}

export function roleLabel(role: AdminRole) {
  return role === 'ADMIN' ? 'Quản trị hệ thống' : 'Nhà xe / đối tác';
}
