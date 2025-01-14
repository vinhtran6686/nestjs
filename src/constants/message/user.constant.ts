export const USER_MESSAGES = {
  LIST: {
    FETCHED: 'Users fetched successfully',
    EMPTY: 'No users found',
  },
  DETAIL: {
    FETCHED: 'User detail fetched successfully',
    NOT_FOUND: 'User not found',
  },
  CREATE: {
    SUCCESS: 'User created successfully',
    DUPLICATE: 'User with this email already exists',
  },
  UPDATE: {
    SUCCESS: 'User updated successfully',
    NOT_FOUND: 'User to update not found',
  },
  DELETE: {
    SUCCESS: 'User deleted successfully',
    NOT_FOUND: 'User to delete not found',
  },
  RESTORE: {
    SUCCESS: 'User restored successfully',
    NOT_FOUND: 'User to restore not found',
  },
} as const;
