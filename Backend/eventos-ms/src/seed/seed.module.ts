import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evento } from '../evento/entities/evento.entity';
import { Escenario } from '../escenario/entities/escenario.entity';
import { Seccion } from '../seccion/entities/seccion.entity';
import { Fila } from '../fila/entities/fila.entity';
import { Asiento } from '../asiento/entities/asiento.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Evento, Escenario, Seccion, Fila, Asiento])],
  providers: [SeedService],
})
export class SeedModule {}
