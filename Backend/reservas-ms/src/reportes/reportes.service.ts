import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import { Reserva } from '../reserva/entities/reserva.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import { EventosClientService } from '../eventos-client/eventos-client.service';

export interface FiltrosReporteGeneral {
  fechaInicio?: string;
  fechaFin?: string;
  eventoId?: string;
  estado?: string;
}

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);

  constructor(
    @InjectRepository(Reserva) private reservaRepository: Repository<Reserva>,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    private eventosClient: EventosClientService,
  ) {}

  async generarReporteIndividual(usuarioId: string): Promise<PDFKit.PDFDocument> {
    const reservas = await this.reservaRepository.find({
      where: { usuarioId },
      order: { fechaReserva: 'DESC' },
    });
    const tickets = await this.ticketRepository.find({
      where: { usuarioId },
      order: { eventoFechaHora: 'ASC' },
    });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    doc.fontSize(18).text('Mis Reservas - Reporte Individual', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#555');
    doc.text(`Usuario: ${usuarioId}`);
    doc.text(`Generado: ${new Date().toLocaleString('es-EC')}`);
    doc.fillColor('#000');
    doc.moveDown();

    doc.fontSize(13).text(`Historial de reservas (${reservas.length})`, { underline: true });
    doc.moveDown(0.3);
    if (reservas.length === 0) {
      doc.fontSize(10).text('Sin reservas registradas.');
    }
    for (const r of reservas) {
      doc
        .fontSize(10)
        .text(
          `${r.eventoNombre}  |  ${r.eventoFechaHora}  |  ${r.estadioNombre}  |  ` +
            `${r.detalleAsientos.length} asiento(s)  |  $${Number(r.montoTotal).toFixed(2)}  |  ${r.estado.toUpperCase()}`,
        );
    }
    doc.moveDown();

    doc.fontSize(13).text(`Tickets emitidos (${tickets.length})`, { underline: true });
    doc.moveDown(0.3);
    if (tickets.length === 0) {
      doc.fontSize(10).text('Sin tickets emitidos.');
    }
    for (const t of tickets) {
      doc
        .fontSize(10)
        .text(
          `${t.codigo}  |  ${t.eventoNombre}  |  ${t.zona} - ${t.numeroAsiento}  |  $${Number(t.precio).toFixed(2)}  |  ${t.estado.toUpperCase()}`,
        );
    }

    return doc;
  }

  async generarReporteGeneral(filtros: FiltrosReporteGeneral): Promise<PDFKit.PDFDocument> {
    const where: Record<string, unknown> = {};
    if (filtros.eventoId) where.eventoId = filtros.eventoId;
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.fechaInicio && filtros.fechaFin) {
      where.fechaReserva = Between(
        new Date(filtros.fechaInicio),
        new Date(`${filtros.fechaFin}T23:59:59`),
      );
    }

    const reservas = await this.reservaRepository.find({ where, order: { fechaReserva: 'DESC' } });

    const porEstado: Record<string, number> = {};
    for (const r of reservas) {
      porEstado[r.estado] = (porEstado[r.estado] ?? 0) + 1;
    }

    const eventoIds = [...new Set(reservas.map((r) => r.eventoId))];

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    doc.fontSize(18).text('Reporte General de Reservas', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#555');
    doc.text(`Generado: ${new Date().toLocaleString('es-EC')}`);
    const filtroTxt =
      [
        filtros.fechaInicio && filtros.fechaFin ? `Rango: ${filtros.fechaInicio} a ${filtros.fechaFin}` : null,
        filtros.eventoId ? `Partido: ${filtros.eventoId}` : null,
        filtros.estado ? `Estado: ${filtros.estado}` : null,
      ]
        .filter(Boolean)
        .join('  |  ') || 'Sin filtros aplicados';
    doc.text(`Filtros: ${filtroTxt}`);
    doc.fillColor('#000');
    doc.moveDown();

    doc.fontSize(13).text('Indicadores generales', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).text(`Cantidad de reservas: ${reservas.length}`);
    for (const [estado, cantidad] of Object.entries(porEstado)) {
      doc.text(`  - ${estado}: ${cantidad}`);
    }
    doc.moveDown();

    doc.fontSize(13).text('Detalle de reservas', { underline: true });
    doc.moveDown(0.3);
    if (reservas.length === 0) {
      doc.fontSize(10).text('No hay reservas para los filtros seleccionados.');
    }
    for (const r of reservas) {
      doc
        .fontSize(9)
        .text(
          `${r.fechaReserva.toISOString().slice(0, 16).replace('T', ' ')}  |  ${r.eventoNombre}  |  ` +
            `${r.detalleAsientos.length} asiento(s)  |  $${Number(r.montoTotal).toFixed(2)}  |  ${r.estado.toUpperCase()}`,
        );
    }
    doc.moveDown();

    doc.fontSize(13).text('Disponibilidad y ocupación por partido', { underline: true });
    doc.moveDown(0.3);

    if (eventoIds.length === 0) {
      doc.fontSize(10).text('No hay partidos involucrados en el filtro actual.');
    }

    for (const eventoId of eventoIds) {
      try {
        const evento = await this.eventosClient.getEvento(eventoId);
        const secciones = evento.escenario?.seccion ?? [];

        let totalAsientos = 0;
        let disponibles = 0;
        let reservados = 0;
        let vendidos = 0;

        doc.fontSize(11).text(`${evento.nombre} - ${evento.escenario?.nombre ?? ''}`);
        doc.fontSize(9);

        for (const seccion of secciones) {
          let seccionTotal = 0;
          let seccionOcupados = 0;
          for (const fila of seccion.fila ?? []) {
            for (const asiento of fila.asiento ?? []) {
              seccionTotal++;
              totalAsientos++;
              if (asiento.estado === 'disponible') {
                disponibles++;
              } else if (asiento.estado === 'reservado') {
                reservados++;
                seccionOcupados++;
              } else if (asiento.estado === 'vendido') {
                vendidos++;
                seccionOcupados++;
              }
            }
          }
          const pct = seccionTotal > 0 ? ((seccionOcupados / seccionTotal) * 100).toFixed(1) : '0.0';
          doc.text(`  Sección ${seccion.nombre}: ${seccionOcupados}/${seccionTotal} ocupados (${pct}%)`);
        }

        const pctTotal =
          totalAsientos > 0 ? (((reservados + vendidos) / totalAsientos) * 100).toFixed(1) : '0.0';
        doc
          .fontSize(9)
          .fillColor('#333')
          .text(
            `  Total: ${totalAsientos} asientos | Disponibles: ${disponibles} | Reservados: ${reservados} | Vendidos: ${vendidos} | Ocupación: ${pctTotal}%`,
          );
        doc.fillColor('#000');
        doc.moveDown(0.5);
      } catch (error) {
        this.logger.warn(`No se pudo obtener el detalle del partido ${eventoId}: ${(error as Error).message}`);
        doc.fontSize(9).text(`  (No se pudo obtener el detalle del partido ${eventoId} desde eventos-ms)`);
        doc.moveDown(0.5);
      }
    }

    return doc;
  }
}
