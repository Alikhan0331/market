import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CounterDealDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  counterBudget: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  counterNote?: string;
}
