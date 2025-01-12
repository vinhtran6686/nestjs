import { Module } from '@nestjs/common';
import { UrlBuilderService } from '../services/url-builder.service';

@Module({
  providers: [UrlBuilderService],
  exports: [UrlBuilderService],
})
export class SharedModule {}
