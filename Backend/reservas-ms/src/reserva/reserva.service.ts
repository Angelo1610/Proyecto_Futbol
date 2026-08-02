import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DetalleAsientoReserva, EstadoReserva, Reserva } from './entities/reserva.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { EventosClientService } from '../eventos-client/eventos-client.service';
import { EstadoTicket, Ticket } from '../ticket/entities/ticket.entity';
import { EstadoPago, Pago } from '../pago/entities/pago.entity';

const MINUTOS_EXPIRACION = 10;
const MAX_ENTRADAS_POR_PARTIDO = 6;

export interface RequesterContext {
  id: string;
  isAdmin: boolean;
}

@Injectable()
export class ReservaService {
  private readonly logger = new Logger(ReservaService.name);

  constructor(
    @InjectRepository(Reserva) private reservaRepository: Repository<Reserva>,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    @InjectRepository(Pago) private pagoRepository: Repository<Pago>,
    private eventosClient: EventosClientService,
  ) {}

  async create(dto: CreateReservaDto): Promise<Reserva> {
    const evento = await this.eventosClient.getEvento(dto.eventoId);
    const eventoDetalle = this.eventosClient.evertoADetalle(evento);
    const asientos = this.eventosClient.buscarAsientos(evento, dto.asientoIds);

    if (asientos.length !== dto.asientoIds.length) {
      throw new NotFoundException('Uno o más asientos no pertenecen a este evento');
    }

    const noDisponibles = asientos.filter((a) => a.estado !== 'disponible');
    if (noDisponibles.length > 0) {
      throw new ConflictException(
        `Los siguientes asientos ya no están disponibles: ${noDisponibles.map((a) => a.numeroAsiento).join(', ')}`,
      );
    }

    const reservasExistentes = await this.reservaRepository.find({
      where: { usuarioId: dto.usuarioId, eventoId: dto.eventoId },
    });
    const entradasActivas = reservasExistentes
      .filter((r) => r.estado === EstadoReserva.PENDIENTE || r.estado === EstadoReserva.CONFIRMADA)
      .reduce((sum, r) => sum + r.detalleAsientos.length, 0);
    if (entradasActivas + dto.asientoIds.length > MAX_ENTRADAS_POR_PARTIDO) {
      throw new ConflictException(
        `Ya tienes ${entradasActivas} entrada(s) activa(s) para este partido. Máximo ${MAX_ENTRADAS_POR_PARTIDO} por cliente.`,
      );
    }

    const marcados: string[] = [];
    try {
      for (const asiento of asientos) {
        await this.eventosClient.patchAsientoEstado(asiento.asientoId, 'reservado');
        marcados.push(asiento.asientoId);
      }
    } catch (error) {
      for (const asientoId of marcados) {
        await this.eventosClient.patchAsientoEstado(asientoId, 'disponible').catch(() => undefined);
      }
      throw error;
    }

    const detalleAsientos: DetalleAsientoReserva[] = asientos.map((a) => ({
      asientoId: a.asientoId,
      numeroAsiento: a.numeroAsiento,
      filaNombre: a.filaNombre,
      zona: a.zona,
      precio: eventoDetalle.precioBase * a.multiplicador,
    }));

    const montoTotal = detalleAsientos.reduce((sum, d) => sum + d.precio, 0);
    const ahora = new Date();
    const expiraEn = new Date(ahora.getTime() + MINUTOS_EXPIRACION * 60 * 1000);

    const reserva = this.reservaRepository.create({
      usuarioId: dto.usuarioId,
      eventoId: dto.eventoId,
      eventoNombre: eventoDetalle.nombre,
      eventoFechaHora: `${eventoDetalle.fecha}T${eventoDetalle.hora}`,
      estadioNombre: eventoDetalle.estadioNombre,
      estado: EstadoReserva.PENDIENTE,
      fechaReserva: ahora,
      expiraEn,
      montoTotal,
      detalleAsientos,
    });

    return this.reservaRepository.save(reserva);
  }

  async findOne(id: string): Promise<Reserva> {
    const reserva = await this.reservaRepository.findOneBy({ id });
    if (!reserva) {
      throw new NotFoundException(`Reserva ${id} no encontrada`);
    }
    return reserva;
  }

  async findAll(filtros: { eventoId?: string; estado?: string }): Promise<Reserva[]> {
    const where: Record<string, unknown> = {};
    if (filtros.eventoId) where.eventoId = filtros.eventoId;
    if (filtros.estado) where.estado = filtros.estado;
    return this.reservaRepository.find({ where, order: { fechaReserva: 'DESC' } });
  }

  private assertOwnerOrAdmin(reserva: Reserva, requester: RequesterContext): void {
    if (!requester.isAdmin && reserva.usuarioId !== requester.id) {
      throw new ForbiddenException('No puede operar sobre una reserva de otro usuario');
    }
  }

  async pagar(
    id: string,
    requester: RequesterContext,
    metodo = 'tarjeta',
  ): Promise<{ reserva: Reserva; tickets: Ticket[] }> {
    const reserva = await this.findOne(id);
    this.assertOwnerOrAdmin(reserva, requester);
    if (reserva.estado !== EstadoReserva.PENDIENTE) {
      throw new ConflictException(`La reserva ${id} no está pendiente de pago`);
    }

    await this.pagoRepository.save(
      this.pagoRepository.create({
        reservaId: reserva.id,
        metodo,
        monto: reserva.montoTotal,
        estado: EstadoPago.APROBADO,
        fechaPago: new Date(),
      }),
    );

    reserva.estado = EstadoReserva.CONFIRMADA;
    await this.reservaRepository.save(reserva);

    const tickets: Ticket[] = [];
    for (const detalle of reserva.detalleAsientos) {
      const ticket = await this.ticketRepository.save(
        this.ticketRepository.create({
          codigo: await this.generarCodigoTicket(),
          reservaId: reserva.id,
          usuarioId: reserva.usuarioId,
          asientoId: detalle.asientoId,
          precio: detalle.precio,
          estado: EstadoTicket.ACTIVO,
          eventoNombre: reserva.eventoNombre,
          eventoFechaHora: reserva.eventoFechaHora,
          estadioNombre: reserva.estadioNombre,
          zona: detalle.zona,
          numeroAsiento: `${detalle.filaNombre}-${detalle.numeroAsiento}`,
        }),
      );
      tickets.push(ticket);

      await this.eventosClient
        .patchAsientoEstado(detalle.asientoId, 'vendido')
        .catch((e) => this.logger.error(`No se pudo marcar el asiento ${detalle.asientoId} como vendido: ${e.message}`));
    }

    return { reserva, tickets };
  }

  async cancelar(id: string, requester: RequesterContext): Promise<Reserva> {
    const reserva = await this.findOne(id);
    this.assertOwnerOrAdmin(reserva, requester);

    if (reserva.estado !== EstadoReserva.PENDIENTE && reserva.estado !== EstadoReserva.CONFIRMADA) {
      throw new ConflictException(`La reserva ${id} no se puede cancelar en su estado actual`);
    }

    if (reserva.estado === EstadoReserva.CONFIRMADA) {
      const tickets = await this.ticketRepository.find({ where: { reservaId: id } });
      const usado = tickets.some((t) => t.estado === EstadoTicket.USADO);
      if (usado) {
        throw new ConflictException('No se puede cancelar: uno o más tickets ya fueron utilizados');
      }
      for (const ticket of tickets) {
        ticket.estado = EstadoTicket.CANCELADO;
        await this.ticketRepository.save(ticket);
      }
    }

    await this.liberarAsientos(reserva);
    reserva.estado = EstadoReserva.CANCELADA;
    return this.reservaRepository.save(reserva);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async expirarPendientes(): Promise<void> {
    const vencidas = await this.reservaRepository
      .createQueryBuilder('reserva')
      .where('reserva.estado = :estado', { estado: EstadoReserva.PENDIENTE })
      .andWhere('reserva.expiraEn < :ahora', { ahora: new Date() })
      .getMany();

    for (const reserva of vencidas) {
      await this.liberarAsientos(reserva);
      reserva.estado = EstadoReserva.EXPIRADA;
      await this.reservaRepository.save(reserva);
      this.logger.log(`Reserva ${reserva.id} expirada y asientos liberados`);
    }
  }

  private async liberarAsientos(reserva: Reserva): Promise<void> {
    for (const detalle of reserva.detalleAsientos) {
      await this.eventosClient
        .patchAsientoEstado(detalle.asientoId, 'disponible')
        .catch((e) => this.logger.error(`No se pudo liberar el asiento ${detalle.asientoId}: ${e.message}`));
    }
  }

  private async generarCodigoTicket(): Promise<string> {
    let codigo: string;
    let existe: Ticket | null;
    do {
      const numero = Math.floor(100000 + Math.random() * 900000);
      codigo = `TKT-${numero}`;
      existe = await this.ticketRepository.findOneBy({ codigo });
    } while (existe);
    return codigo;
  }
}
