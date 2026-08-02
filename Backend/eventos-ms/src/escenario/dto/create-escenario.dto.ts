import { IsInt, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";

export class CreateEscenarioDto {
    @IsString()
    @Length(1,255)
    nombre!: string;

    @IsOptional()
    @IsString()
    @Length(0,255)
    descripcion?: string;

    @IsString()
    @Length(0,255)
    ubicacion!: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    capacidad?: number;
}
