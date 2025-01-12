import { RESPONSE_TYPES } from '@/constants/message/transform.constant';

export type ResponseType = typeof RESPONSE_TYPES[keyof typeof RESPONSE_TYPES];

export interface TransformOptions {
  responseType?: ResponseType;
  message?: string;
  excludeKeys?: string[];
}
