import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import { Pago } from '../pago/entities/pago.entity';
import { ReservaService } from './reserva.service';
import { ReservaController } from './reserva.controller';
import { EventosClientModule } from '../eventos-client/eventos-client.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Ticket, Pago]), EventosClientModule],
  controllers: [ReservaController],
  providers: [ReservaService],
})
export class ReservaModule {}
