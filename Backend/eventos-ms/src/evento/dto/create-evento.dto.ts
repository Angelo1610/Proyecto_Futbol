import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { EstadoEvento } from "../entities/evento.entity";


export class CreateEventoDto {

    @IsString()
    nombre!:string;

    @IsString()
    descripcion!:string

    @IsDateString()
    fecha!:string

    @IsString()
    hora!:string

    @IsOptional()
    @IsEnum(EstadoEvento)
    estado?: EstadoEvento;

    @IsNumber()
    @Min(0)
    precioBase!:number;

    @IsOptional()
    @IsString()
    imagenUrl?:string | null;

    @IsUUID()
    escenarioId!:string
}