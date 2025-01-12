import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { request, Response } from 'express';
import { TransformOptions } from './transform.interface';
import {
  BaseResponse,
  PaginatedResponse,
} from '../../interfaces/response.interface';
import {
  RESPONSE_TYPES,
  SKIP_TRANSFORM_ROUTES,
  TRANSFORM_MESSAGES,
} from '@/constants/message/transform.constant';
import { TRANSFORM_TYPE_KEY } from '@/shared/decorators/transform.decorator';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, BaseResponse<T> | PaginatedResponse<T>>
{
  private readonly logger = new Logger(TransformInterceptor.name);

  constructor(private readonly options: TransformOptions = {}) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<BaseResponse<T> | PaginatedResponse<T>> {
    const handler = context.getHandler();
    const request = context.switchToHttp().getRequest();
    const httpMethod = request.method; // Lấy HTTP method

    this.logger.debug(`HTTP Method: ${httpMethod}`); // Debug log

    if (this.shouldSkipTransform(request.path)) {
      return next.handle();
    }

    // Lấy transform options từ metadata (nếu có)
    const transformOptions = Reflect.getMetadata(TRANSFORM_TYPE_KEY, handler);

    // Merge với default options, ưu tiên message từ decorator nếu có
    const options = {
      responseType: RESPONSE_TYPES.STANDARD,
      message: this.getDefaultMessage(httpMethod),
      ...transformOptions, // Override defaults if provided in decorator
    };

    return this.handleTransform(context, next, options);
  }

  private handleTransform(
    context: ExecutionContext,
    next: CallHandler,
    options: TransformOptions,
  ): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        try {
          if (options.responseType === RESPONSE_TYPES.PAGINATED) {
            return this.transformPaginatedResponse(
              data,
              response.statusCode,
              options.message,
            );
          }
          return this.transformSingleResponse(
            data,
            response.statusCode,
            options.message,
          );
        } catch (error) {
          this.logger.error(
            `Transform response error: ${error.message}`,
            error.stack,
          );
          throw error;
        }
      }),
    );
  }

  private shouldSkipTransform(path: string): boolean {
    return SKIP_TRANSFORM_ROUTES.some((route) => path.startsWith(route));
  }

  private getDefaultMessage(method: string): string {
    // Thêm log để debug
    this.logger.debug(`Getting default message for method: ${method}`);

    // Đảm bảo method không undefined trước khi xử lý
    if (!method) {
      return TRANSFORM_MESSAGES.FETCHED; // Default fallback
    }

    switch (method.toUpperCase()) {
      case 'POST':
        return TRANSFORM_MESSAGES.CREATED;
      case 'PUT':
      case 'PATCH':
        return TRANSFORM_MESSAGES.UPDATED;
      case 'DELETE':
        return TRANSFORM_MESSAGES.DELETED;
      default:
        return TRANSFORM_MESSAGES.FETCHED;
    }
  }

  private transformPaginatedResponse(
    data: any,
    statusCode: number,
    message: string,
  ): PaginatedResponse<T> {
    const { data: items, meta } = data;

    return {
      statusCode,
      message,
      data: items,
      pagination: {
        page: meta.page,
        limit: meta.limit,
        totalItems: meta.total,
        totalPages: meta.totalPages,
        hasNextPage: meta.page < meta.totalPages,
        hasPreviousPage: meta.page > 1,
      },
      timestamp: new Date().toISOString(),
    };
  }

  private transformSingleResponse(
    data: T,
    statusCode: number,
    message: string,
  ): BaseResponse<T> {
    return {
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
