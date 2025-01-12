import { SetMetadata } from '@nestjs/common';
import { RESPONSE_TYPES } from '@/constants/message/transform.constant';

export const TRANSFORM_TYPE_KEY = 'transformType';

export const TransformResponse = (options?: {
  responseType?: typeof RESPONSE_TYPES[keyof typeof RESPONSE_TYPES];
  message?: string;
}) => SetMetadata(TRANSFORM_TYPE_KEY, options);
