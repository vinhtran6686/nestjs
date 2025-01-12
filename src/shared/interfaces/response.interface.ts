export interface BaseResponse<T> {
  statusCode: number;
  message?: string;
  data: T;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export enum ResponseTypeEnum {
  STANDARD = 'standard',
  PAGINATED = 'paginated',
  AUTH = 'auth',
  CUSTOM = 'custom',
}
