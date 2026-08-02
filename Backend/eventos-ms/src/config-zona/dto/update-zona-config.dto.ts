import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdateZonaConfigDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  nombre?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  multiplicador?: number;
}
