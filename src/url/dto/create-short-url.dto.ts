import { IsNotEmpty, IsOptional, IsString, IsUrl, IsDate } from 'class-validator';

export class CreateShortUrlDto {
  @IsNotEmpty()
  @IsUrl()
  longUrl: string;

  @IsOptional()
  @IsString()
  shortAlias?: string; 

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDate()
  expiresAt?: Date; 
}