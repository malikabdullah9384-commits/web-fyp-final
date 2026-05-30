const PERMISSIONS = {
  VIEW_USERS:          'users:view',
  CREATE_USERS:        'users:create',
  EDIT_USERS:          'users:edit',
  DELETE_USERS:        'users:delete',

  VIEW_SUPERVISORS:    'supervisors:view',
  CREATE_SUPERVISORS:  'supervisors:create',
  EDIT_SUPERVISORS:    'supervisors:edit',
  DELETE_SUPERVISORS:  'supervisors:delete',

  VIEW_STUDENTS:       'students:view',
  CREATE_STUDENTS:     'students:create',
  EDIT_STUDENTS:       'students:edit',
  DELETE_STUDENTS:     'students:delete',
  ASSIGN_SUPERVISOR:   'students:assign',

  VIEW_PROJECTS:       'projects:view',
  CREATE_PROJECTS:     'projects:create',
  EDIT_PROJECTS:       'projects:edit',
  DELETE_PROJECTS:     'projects:delete',
  APPROVE_PROJECTS:    'projects:approve',

  VIEW_PROGRESS:       'progress:view',
  CREATE_PROGRESS:     'progress:create',
  REVIEW_PROGRESS:     'progress:review',

  MANAGE_ADMINS:       'system:admins',
  MANAGE_PERMISSIONS:  'system:permissions',
  VIEW_AUDIT_LOGS:     'system:audit',
  SYSTEM_SETTINGS:     'system:settings',
};

const ROLE_DEFAULTS = {
  superadmin: Object.values(PERMISSIONS),

  admin: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_SUPERVISORS,
    PERMISSIONS.CREATE_SUPERVISORS,
    PERMISSIONS.EDIT_SUPERVISORS,
    PERMISSIONS.DELETE_SUPERVISORS,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.CREATE_STUDENTS,
    PERMISSIONS.EDIT_STUDENTS,
    PERMISSIONS.DELETE_STUDENTS,
    PERMISSIONS.ASSIGN_SUPERVISOR,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.EDIT_PROJECTS,
    PERMISSIONS.VIEW_PROGRESS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],

  supervisor: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.APPROVE_PROJECTS,
    PERMISSIONS.VIEW_PROGRESS,
    PERMISSIONS.REVIEW_PROGRESS,
  ],

  student: [
    PERMISSIONS.CREATE_PROJECTS,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.CREATE_PROGRESS,
    PERMISSIONS.VIEW_PROGRESS,
  ],
};

module.exports = { PERMISSIONS, ROLE_DEFAULTS };
