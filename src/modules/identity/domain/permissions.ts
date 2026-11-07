import type { RoleName } from '../../../common/enums';

export const ROLE_PERMISSIONS: Record<RoleName, readonly string[]> = {
  owner: ['*'],
  admin: ['*'],
  sales: ['catalog', 'crm', 'quotes', 'bookings', 'portal'],
  operations: [
    'catalog',
    'resources',
    'dispatch',
    'permits',
    'field',
    'safety',
    'fleet',
    'bookings',
  ],
  accountant: ['bookings', 'payments', 'reports', 'suppliers'],
  guide: ['field', 'safety', 'dispatch'],
  driver: ['field', 'fleet', 'dispatch'],
};
