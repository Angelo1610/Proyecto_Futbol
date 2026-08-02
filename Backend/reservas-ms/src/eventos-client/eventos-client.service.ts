import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

export interface AsientoDetalle {
  asientoId: string;
  numeroAsiento: string;
  filaNombre: string;
  zona: string;
  multiplicador: number;
  estado: string;
}

export interface EventoDetalle {
  id: string;
  nombre: string;
  fecha: string;
  hora: string;
  precioBase: number;
  estadioNombre: string;
}

@Injectable()
export class EventosClientService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('EVENTOS_MS_URL', 'http://localhost:3000');
  }

  async listEventos(): Promise<any[]> {
    try {
      const { data } = await firstValueFrom(this.httpService.get(`${this.baseUrl}/evento`));
      return data;
    } catch {
      return [];
    }
  }

  async getEvento(eventoId: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(this.httpService.get(`${this.baseUrl}/evento/${eventoId}`));
      return data;
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        throw new NotFoundException(`Evento ${eventoId} no encontrado en eventos-ms`);
      }
      throw new BadGatewayException('No se pudo contactar a eventos-ms');
    }
  }

  async patchAsientoEstado(asientoId: string, estado: string): Promise<void> {
    try {
      await firstValueFrom(this.httpService.patch(`${this.baseUrl}/asiento/${asientoId}`, { estado }));
    } catch (error) {
      throw new BadGatewayException(`No se pudo actualizar el asiento ${asientoId} en eventos-ms`);
    }
  }

  evertoADetalle(evento: any): EventoDetalle {
    return {
      id: evento.id,
      nombre: evento.nombre,
      fecha: evento.fecha,
      hora: evento.hora,
      precioBase: Number(evento.precioBase),
      estadioNombre: evento.escenario?.nombre ?? '',
    };
  }

  buscarAsientos(evento: any, asientoIds: string[]): AsientoDetalle[] {
    const encontrados: AsientoDetalle[] = [];
    const secciones = evento.escenario?.seccion ?? [];

    for (const seccion of secciones) {
      for (const fila of seccion.fila ?? []) {
        for (const asiento of fila.asiento ?? []) {
          if (asientoIds.includes(asiento.id)) {
            encontrados.push({
              asientoId: asiento.id,
              numeroAsiento: asiento.numero,
              filaNombre: fila.nombre,
              zona: seccion.nombre,
              multiplicador: Number(seccion.multiplicador),
              estado: asiento.estado,
            });
          }
        }
      }
    }

    return encontrados;
  }
}
