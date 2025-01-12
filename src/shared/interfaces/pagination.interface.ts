export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
  sort?: string;
  fields?: string;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: string[];
  validatedData?: T;
}
