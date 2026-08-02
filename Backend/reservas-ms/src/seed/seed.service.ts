import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { DetalleAsientoReserva, EstadoReserva, Reserva } from '../reserva/entities/reserva.entity';
import { EstadoTicket, Ticket } from '../ticket/entities/ticket.entity';
import { EventosClientService } from '../eventos-client/eventos-client.service';

const DEMO_USUARIOS = [
  { username: 'cliente@gmail.com', password: 'password123' },
  { username: 'mixto@espe.edu.ec', password: 'password123' },
];

interface AsientoDisponible {
  asientoId: string;
  numeroAsiento: string;
  filaNombre: string;
  zona: string;
  multiplicador: number;
}

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Reserva) private reservaRepository: Repository<Reserva>,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    private eventosClient: EventosClientService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.reservaRepository.count();
    if (count > 0) {
      this.logger.log('Ya existen reservas, se omite la siembra de datos demo.');
      return;
    }

    try {
      const eventos = await this.eventosClient.listEventos();
      if (eventos.length === 0) {
        this.logger.warn('No hay eventos en eventos-ms todavía; se omite la siembra de reservas demo.');
        return;
      }

      const usuarios = await this.loginDemoUsuarios();
      if (usuarios.length === 0) {
        this.logger.warn('No se pudo autenticar a los usuarios demo en master-ms; se omite la siembra de reservas.');
        return;
      }

      let creadas = 0;
      for (let i = 0; i < Math.min(2, eventos.length); i++) {
        const evento = await this.eventosClient.getEvento(eventos[i].id);
        const eventoDetalle = this.eventosClient.evertoADetalle(evento);
        const asientosDisponibles = this.listarAsientosDisponibles(evento);

        for (let u = 0; u < usuarios.length; u++) {
          const usuarioId = usuarios[u];
          const asientos = asientosDisponibles.splice(0, 2);
          if (asientos.length === 0) continue;

          const detalleAsientos: DetalleAsientoReserva[] = asientos.map((a) => ({
            asientoId: a.asientoId,
            numeroAsiento: a.numeroAsiento,
            filaNombre: a.filaNombre,
            zona: a.zona,
            precio: eventoDetalle.precioBase * a.multiplicador,
          }));
          const montoTotal = detalleAsientos.reduce((sum, d) => sum + d.precio, 0);
          const confirmar = (i + u) % 2 === 0;

          const reserva = await this.reservaRepository.save(
            this.reservaRepository.create({
              usuarioId,
              eventoId: eventoDetalle.id,
              eventoNombre: eventoDetalle.nombre,
              eventoFechaHora: `${eventoDetalle.fecha}T${eventoDetalle.hora}`,
              estadioNombre: eventoDetalle.estadioNombre,
              estado: confirmar ? EstadoReserva.CONFIRMADA : EstadoReserva.PENDIENTE,
              fechaReserva: new Date(),
              expiraEn: confirmar ? null : new Date(Date.now() + 10 * 60 * 1000),
              montoTotal,
              detalleAsientos,
            }),
          );

          for (const asiento of asientos) {
            const nuevoEstado = confirmar ? 'vendido' : 'reservado';
            await this.eventosClient.patchAsientoEstado(asiento.asientoId, nuevoEstado).catch(() => undefined);
          }

          if (confirmar) {
            for (const detalle of detalleAsientos) {
              await this.ticketRepository.save(
                this.ticketRepository.create({
                  codigo: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
                  reservaId: reserva.id,
                  usuarioId,
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
            }
          }

          creadas++;
        }
      }

      this.logger.log(`Sembradas ${creadas} reservas demo.`);
    } catch (error) {
      this.logger.warn(`No se pudo sembrar reservas demo: ${(error as Error).message}`);
    }
  }

  private listarAsientosDisponibles(evento: any): AsientoDisponible[] {
    const disponibles: AsientoDisponible[] = [];
    const secciones = evento.escenario?.seccion ?? [];
    for (const seccion of secciones) {
      for (const fila of seccion.fila ?? []) {
        for (const asiento of fila.asiento ?? []) {
          if (asiento.estado === 'disponible') {
            disponibles.push({
              asientoId: asiento.id,
              numeroAsiento: asiento.numero,
              filaNombre: fila.nombre,
              zona: seccion.nombre,
              multiplicador: Number(seccion.multiplicador),
            });
          }
        }
      }
    }
    return disponibles;
  }

  private async loginDemoUsuarios(): Promise<string[]> {
    const masterUrl = this.configService.get<string>('MASTER_MS_URL', 'http://localhost:8080');
    const ids: string[] = [];
    for (const credenciales of DEMO_USUARIOS) {
      try {
        const { data } = await firstValueFrom(
          this.httpService.post(`${masterUrl}/api/auth/login`, credenciales),
        );
        if (data?.user?.id) {
          ids.push(data.user.id);
        }
      } catch (error) {
        this.logger.warn(
          `No se pudo autenticar a ${credenciales.username} en master-ms: ${(error as Error).message}`,
        );
      }
    }
    return ids;
  }
}
