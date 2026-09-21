/**
 * Global permission catalogue + default system-role matrices.
 * Seeded into Permission / Role / RolePermission. Names are stable
 * API strings: "{module}:{action}" (lowercase).
 */

export type PermissionDef = {
  name: string;
  module: string;
  action: string;
  description: string;
};

const crud = (
  module: string,
  label: string,
): PermissionDef[] => [
  {
    name: `${module.toLowerCase()}:create`,
    module,
    action: 'CREATE',
    description: `Create ${label}`,
  },
  {
    name: `${module.toLowerCase()}:read`,
    module,
    action: 'READ',
    description: `View ${label}`,
  },
  {
    name: `${module.toLowerCase()}:update`,
    module,
    action: 'UPDATE',
    description: `Update ${label}`,
  },
  {
    name: `${module.toLowerCase()}:delete`,
    module,
    action: 'DELETE',
    description: `Delete ${label}`,
  },
];

export const PERMISSION_CATALOGUE: PermissionDef[] = [
  ...crud('GUARD', 'guards'),
  ...crud('SITE', 'sites'),
  ...crud('CLIENT', 'clients'),
  ...crud('SUBSCRIPTION', 'client subscriptions / service packages'),
  ...crud('DEPLOYMENT', 'guard deployments'),
  ...crud('SHIFT', 'shifts'),
  ...crud('INVOICE', 'invoices'),
  {
    name: 'invoice:approve',
    module: 'INVOICE',
    action: 'APPROVE',
    description: 'Approve invoices',
  },
  ...crud('EQUIPMENT', 'equipment'),
  ...crud('INCIDENT', 'incidents'),
  {
    name: 'incident:assign',
    module: 'INCIDENT',
    action: 'ASSIGN',
    description: 'Assign incidents',
  },
  ...crud('CONMMAND_CENTER', 'command center / cameras / alerts / reports'),
  ...crud('VEHICLE', 'vehicles'),
  ...crud('PATROL', 'patrols'),
  ...crud('VISITOR', 'visitors'),
  {
    name: 'auditlog:read',
    module: 'AUDITLOG',
    action: 'READ',
    description: 'View audit logs',
  },
  ...crud('NOTIFICATION', 'notifications'),
  ...crud('STAFF', 'company staff'),
  {
    name: 'staff:assign_role',
    module: 'STAFF',
    action: 'ASSIGN_ROLE',
    description: 'Assign roles and permission overrides to staff',
  },
  ...crud('ROLE', 'roles'),
  {
    name: 'role:manage',
    module: 'ROLE',
    action: 'MANAGE',
    description: 'Manage role permission sets',
  },
  ...crud('PAYROLL', 'payroll'),
  {
    name: 'payroll:run',
    module: 'PAYROLL',
    action: 'RUN',
    description: 'Generate payroll runs',
  },
  {
    name: 'payroll:approve',
    module: 'PAYROLL',
    action: 'APPROVE',
    description: 'Approve payroll runs',
  },
  ...crud('COMPANY', 'company settings'),
];

/** All permission names — used for SUPER_ADMIN. */
export const ALL_PERMISSION_NAMES = PERMISSION_CATALOGUE.map((p) => p.name);

export type SystemRoleSeed = {
  name: string;
  description: string;
  permissions: string[];
};

const only = (names: string[], keep: string[]) =>
  names.filter((n) => keep.some((prefix) => n === prefix || n.startsWith(prefix)));

/**
 * System roles — names match StaffRole enum values.
 * companyPk stays null; isSystem = true.
 */
export const SYSTEM_ROLE_SEEDS: SystemRoleSeed[] = [
  {
    name: 'SUPER_ADMIN',
    description: 'Full access within the company tenant',
    permissions: ALL_PERMISSION_NAMES,
  },
  {
    name: 'HR_MANAGER',
    description: 'Staff, guards, leave/payroll HR operations',
    permissions: only(ALL_PERMISSION_NAMES, [
      'staff:',
      'guard:',
      'payroll:',
      'notification:',
      'auditlog:read',
    ]),
  },
  {
    name: 'OPERATIONS_MANAGER',
    description: 'Deployments, sites, shifts, patrol, equipment',
    permissions: only(ALL_PERMISSION_NAMES, [
      'deployment:',
      'site:',
      'shift:',
      'patrol:',
      'equipment:',
      'guard:read',
      'guard:update',
      'client:read',
      'notification:',
    ]),
  },
  {
    name: 'SECURITY_SUPERVISOR',
    description: 'Incidents, patrol, visitors, on-ground oversight',
    permissions: only(ALL_PERMISSION_NAMES, [
      'incident:',
      'patrol:',
      'visitor:',
      'guard:read',
      'site:read',
      'shift:read',
      'deployment:read',
      'notification:',
    ]),
  },
  {
    name: 'CONTROL_ROOM_OPERATOR',
    description: 'Command center, cameras, alerts, incident intake',
    permissions: only(ALL_PERMISSION_NAMES, [
      'conmmand_center:',
      'incident:create',
      'incident:read',
      'incident:update',
      'notification:',
      'visitor:read',
      'patrol:read',
    ]),
  },
  {
    name: 'FINANCE_OFFICER',
    description: 'Invoices, subscriptions, payroll finance',
    permissions: only(ALL_PERMISSION_NAMES, [
      'invoice:',
      'subscription:',
      'payroll:',
      'client:read',
      'company:read',
    ]),
  },
  {
    name: 'ACCOUNT_MANAGER',
    description: 'Client relationships and related read access',
    permissions: only(ALL_PERMISSION_NAMES, [
      'client:',
      'site:',
      'deployment:read',
      'subscription:',
      'invoice:read',
      'invoice:create',
      'guard:read',
      'notification:',
    ]),
  },
];
