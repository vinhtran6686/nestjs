export const TRANSFORM_MESSAGES = {
  SUCCESS: 'Success',
  ERROR: 'Error',
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  FETCHED: 'Fetched successfully',
} as const;

export const RESPONSE_TYPES = {
  STANDARD: 'standard',
  PAGINATED: 'paginated',
  AUTH: 'auth',
  CUSTOM: 'custom',
} as const;

export const SKIP_TRANSFORM_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/health',
  '/webhooks',
] as const;
