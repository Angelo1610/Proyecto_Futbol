import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { EstadoAsiento, TipoAsiento } from '../entities/asiento.entity';

export class CreateAsientoDto {
  @IsString()
  @Length(1, 255)
  numero!: string;

  @IsOptional()
  @IsEnum(TipoAsiento)
  tipo?: TipoAsiento;

  @IsOptional()
  @IsEnum(EstadoAsiento)
  estado?: EstadoAsiento;

  @IsUUID()
  filaId!: string;
}
