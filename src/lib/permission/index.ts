export type PermissionCategory = Record<string, string>;

export const PERMISSION_CATEGORIES = {
  patients: {
    'patients.read': 'View and list patients',
    'patients.create': 'Register new patients',
    'patients.update': 'Update patient details',
    'patients.delete': 'Remove patients',
  },

  tests: {
    'tests.read': 'View and list all test orders in the lab',
    'tests.read_own': 'View only test orders assigned to me',
    'tests.create': 'Create test orders',
    'tests.assign': 'Assign tests to scientists',
    'tests.process': 'Start and process assigned tests',
    'tests.update_status': 'Update test status (in progress / completed)',
    'tests.approve': 'Approve or reject tests',
  },

  results: {
    'results.read': 'View and list all results in the lab',
    'results.read_own': 'View only results submitted by me',
    'results.create': 'Submit test results',
    'results.return': 'Return results for rework',
    'results.approve': 'Approve results',
    'results.release': 'Release results to patients',
  },

  appointments: {
    'appointments.read': 'View and list appointments',
    'appointments.create': 'Book appointments',
    'appointments.update': 'Update appointment details',
    'appointments.update_status': 'Confirm, cancel, or complete appointments',
  },

  doctors: {
    'doctors.read': 'View and list doctors',
    'doctors.create': 'Add referring doctors',
    'doctors.update': 'Update doctor details',
    'doctors.delete': 'Remove doctors',
  },

  inventory: {
    'inventory.read': 'View inventory items',
    'inventory.create': 'Add inventory items',
    'inventory.update': 'Update inventory details',
    'inventory.restock': 'Log restock events',
    'inventory.delete': 'Remove inventory items',
  },

  staff: {
    'staff.read': 'View staff members',
    'staff.create': 'Invite new staff',
    'staff.update': 'Update staff details',
    'staff.update_status': 'Activate or deactivate staff',
    'staff.permissions': 'Include or exclude permissions for staff members',
    'staff.delete': 'Remove staff members',
  },

  branches: {
    'branches.read': 'View branches',
    'branches.create': 'Create new branches',
    'branches.update': 'Update branch details',
    'branches.update_status': 'Activate or deactivate branches',
    'branches.delete': 'Remove branches',
  },

  test_catalog: {
    'test_catalog.read': 'View test catalog',
    'test_catalog.create': 'Add tests to catalog',
    'test_catalog.update': 'Update catalog entries',
    'test_catalog.delete': 'Remove tests from catalog',
  },

  finance: {
    'finance.read': 'View transactions and reports',
    'finance.create': 'Record manual transactions',
    'finance.update': 'Edit transactions',
    'finance.delete': 'Delete transactions',
  },

  activity: {
    'activity.read': 'View audit activity log',
  },

  lab: {
    'lab.update': 'Update lab details (name, email, phone, address)',
    'lab.settings': 'Manage lab settings',
    "lab.manage_access": "Grant or revoke portal access to patients and doctors",
  },
} satisfies Record<string, PermissionCategory>;

/**
 * Flat typed map of every permission key → its description.
 * Single source of truth — add/rename here and everything updates.
 */
export const PERMISSIONS = Object.values(PERMISSION_CATEGORIES).reduce(
  (acc, cat) => Object.assign(acc, cat),
  {} as Record<string, string>
);

export type Permission = keyof typeof PERMISSIONS;

/**
 * Flat list of all valid permission strings (for enum validation in models/DTOs)
 */
export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];