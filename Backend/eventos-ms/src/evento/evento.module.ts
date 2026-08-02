import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoService } from './evento.service';
import { EventoController } from './evento.controller';
import { Evento } from './entities/evento.entity';
import { Escenario } from 'src/escenario/entities/escenario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evento, Escenario])],
  controllers: [EventoController],
  providers: [EventoService],
})
export class EventoModule {}
