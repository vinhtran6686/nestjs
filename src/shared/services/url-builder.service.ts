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

  buildAuthUrl(
    path: string,
    params?: Record<string, string>,
    version?: string,
  ): string {
    const fullPath = `auth/${path}`;
    let url = this.buildApiUrl(fullPath, version);

    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    return url;
  }
}
