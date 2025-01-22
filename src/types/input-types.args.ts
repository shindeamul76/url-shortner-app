import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";
import { ApiPropertyOptional } from '@nestjs/swagger';




export class OffsetPaginationArgs {
  @IsOptional()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiPropertyOptional()

  skip: number;

  @IsOptional()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiPropertyOptional()

  take: number;
}