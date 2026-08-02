import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
  ) {}

  findByUsuario(usuarioId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: { usuarioId },
      order: { eventoFechaHora: 'ASC' },
    });
  }
}
