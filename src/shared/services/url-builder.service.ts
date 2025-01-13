import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UrlBuilderService {
  constructor(private readonly configService: ConfigService) {}

  buildApiUrl(path: string, version?: string): string {
    const baseUrl = this.configService.get<string>('APP_URL');
    const apiPrefix = this.configService.get<string>('API.PREFIX', 'api');
    const apiVersion =
      version || this.configService.get<string>('API.DEFAULT_VERSION', 'v1');

    return `${baseUrl}/${apiPrefix}/${apiVersion}/${path}`.replace(/\/+/g, '/');
  }

  buildAuthUrl(path: string, params?: Record<string, string>): string {
    const baseUrl = this.configService.get<string>('API_URL');
    const url = `${baseUrl}/auth/${path}`;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return `${url}?${queryString}`;
    }
    return url;
  }

  buildClientUrl(path: string): string {
    const clientUrl = this.configService.get<string>('CLIENT_URL');
    return `${clientUrl}${path}`;
  }
}
