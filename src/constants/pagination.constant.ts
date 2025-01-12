export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_SORT: 'createdAt:desc',
  ALLOWED_SORT_FIELDS: ['name', 'createdAt', 'updatedAt'],
  ALLOWED_FIELD_PATTERNS: /^[a-zA-Z0-9,_]+$/,
  ALLOWED_SEARCH_PATTERN: /^[a-zA-Z0-9\s-_]+$/,
  MIN_SEARCH_LENGTH: 1,
  MAX_SEARCH_LENGTH: 50,
  TIMEOUT_MS: 10000,
};

export const ERROR_MESSAGES = {
  PAGINATION: {
    INVALID_PAGE: 'Page must be a positive integer',
    INVALID_LIMIT: 'Limit must be a positive integer',
    INVALID_SORT: (fields: string[]) =>
      `Invalid sort parameter. Format should be field:asc|desc. Allowed fields: ${fields.join(
        ', ',
      )}`,
    INVALID_FIELDS: 'Fields parameter contains invalid characters',
    INVALID_SEARCH: 'Search parameter contains invalid characters or length',
  },
};
