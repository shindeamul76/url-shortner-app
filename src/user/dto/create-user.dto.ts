import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateUserSSODto {
  @IsString()
  accessTokenSSO: string;

  @IsString()
  refreshTokenSSO: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsUrl()
  photoURL?: string;

  @IsString()
  provider: string;

  @IsString()
  providerAccountId: string;
}