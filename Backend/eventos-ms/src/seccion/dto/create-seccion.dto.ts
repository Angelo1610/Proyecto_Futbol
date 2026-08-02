import { IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';
import { TipoSeccion } from '../entities/seccion.entity';

export class CreateSeccionDto {
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

  @IsOptional()
  @IsEnum(TipoSeccion)
  tipo?: TipoSeccion;

  @IsOptional()
  @IsNumber()
  @Min(0)
  multiplicador?: number;

  @IsUUID()
  escenarioId!: string;
}
