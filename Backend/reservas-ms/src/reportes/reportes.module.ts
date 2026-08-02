import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from '../reserva/entities/reserva.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import { EventosClientModule } from '../eventos-client/eventos-client.module';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Ticket]), EventosClientModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
