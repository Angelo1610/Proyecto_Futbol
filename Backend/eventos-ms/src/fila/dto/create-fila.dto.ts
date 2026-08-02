import { IsInt, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateFilaDto {
  @IsString()
  @Length(1, 255)
  nombre!: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacidad?: number;

  @IsUUID()
  seccionId!: string;
}
