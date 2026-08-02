import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Reserva } from '../reserva/entities/reserva.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import { EventosClientModule } from '../eventos-client/eventos-client.module';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Ticket]), EventosClientModule, HttpModule],
  providers: [SeedService],
})
export class SeedModule {}
