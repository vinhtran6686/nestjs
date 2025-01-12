import {
  ERROR_MESSAGES,
  PAGINATION_CONSTANTS,
} from '@/constants/pagination.constant';
import {
  PaginationParams,
  ValidationResult,
} from '@/shared/interfaces/pagination.interface';

export function validatePaginationParams(
  params: PaginationParams,
): ValidationResult<{
  page: number;
  limit: number;
  sort?: string;
  fields?: string;
  search?: string;
}> {
  const errors: string[] = [];
  const validatedData: any = {};

  // Validate page
  if (params.page !== undefined) {
    const pageNum = Number(params.page);
    if (!Number.isInteger(pageNum) || pageNum < 1) {
      errors.push(ERROR_MESSAGES.PAGINATION.INVALID_PAGE);
    } else {
      validatedData.page = pageNum;
    }
  } else {
    validatedData.page = PAGINATION_CONSTANTS.DEFAULT_PAGE;
  }

  // Validate limit
  if (params.limit !== undefined) {
    const limitNum = Number(params.limit);
    if (!Number.isInteger(limitNum) || limitNum < 1) {
      errors.push(ERROR_MESSAGES.PAGINATION.INVALID_LIMIT);
    } else {
      validatedData.limit = Math.min(limitNum, PAGINATION_CONSTANTS.MAX_LIMIT);
    }
  } else {
    validatedData.limit = PAGINATION_CONSTANTS.DEFAULT_LIMIT;
  }

  // Validate sort
  if (params.sort) {
    const [field, order] = params.sort.split(':');
    if (
      !PAGINATION_CONSTANTS.ALLOWED_SORT_FIELDS.includes(field) ||
      !['asc', 'desc'].includes(order?.toLowerCase())
    ) {
      errors.push(
        ERROR_MESSAGES.PAGINATION.INVALID_SORT(
          PAGINATION_CONSTANTS.ALLOWED_SORT_FIELDS,
        ),
      );
    } else {
      validatedData.sort = params.sort;
    }
  } else {
    validatedData.sort = PAGINATION_CONSTANTS.DEFAULT_SORT;
  }

  // Validate fields
  if (params.fields) {
    if (!PAGINATION_CONSTANTS.ALLOWED_FIELD_PATTERNS.test(params.fields)) {
      errors.push(ERROR_MESSAGES.PAGINATION.INVALID_FIELDS);
    } else {
      validatedData.fields = params.fields;
    }
  }

  // Validate search
  if (params.search) {
    if (
      !PAGINATION_CONSTANTS.ALLOWED_SEARCH_PATTERN.test(params.search) ||
      params.search.length < PAGINATION_CONSTANTS.MIN_SEARCH_LENGTH ||
      params.search.length > PAGINATION_CONSTANTS.MAX_SEARCH_LENGTH
    ) {
      errors.push(ERROR_MESSAGES.PAGINATION.INVALID_SEARCH);
    } else {
      validatedData.search = params.search;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedData: errors.length === 0 ? validatedData : undefined,
  };
}
