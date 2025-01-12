export const COMPANY_MESSAGES = {
  LIST: {
    FETCHED: 'Companies fetched successfully',
    EMPTY: 'No companies found',
  },
  DETAIL: {
    FETCHED: 'Company detail fetched successfully',
    NOT_FOUND: 'Company not found',
  },
  CREATE: {
    SUCCESS: 'Company created successfully',
    DUPLICATE: 'Company with this name already exists',
  },
  UPDATE: {
    SUCCESS: 'Company updated successfully',
    NOT_FOUND: 'Company to update not found',
  },
  DELETE: {
    SUCCESS: 'Company deleted successfully',
    NOT_FOUND: 'Company to delete not found',
  },
  RESTORE: {
    SUCCESS: 'Company restored successfully',
    NOT_FOUND: 'Company to restore not found',
  },
} as const;
