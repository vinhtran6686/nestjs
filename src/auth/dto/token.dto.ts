import { IsString } from 'class-validator';

export class TokensDto {
  @IsString()
  access_token: string;

  @IsString()
  refresh_token: string;
}
