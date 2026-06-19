import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class AnalyzeChannelDto {
  @IsString()
  input: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(50)
  videoCount?: number;
}