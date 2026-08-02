import { ArrayMinSize, ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

export class CreateReservaDto {
  @IsUUID()
  usuarioId!: string;

  @IsUUID()
  eventoId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @IsUUID('4', { each: true })
  asientoIds!: string[];
}
