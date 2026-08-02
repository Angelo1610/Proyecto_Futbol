import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evento } from '../evento/entities/evento.entity';
import { Escenario } from '../escenario/entities/escenario.entity';
import { Seccion, TipoSeccion } from '../seccion/entities/seccion.entity';
import { Fila } from '../fila/entities/fila.entity';
import { Asiento } from '../asiento/entities/asiento.entity';

const ZONAS: { tipo: TipoSeccion; nombre: string; multiplicador: number }[] = [
  { tipo: TipoSeccion.PALCO, nombre: 'Palcos', multiplicador: 2.5 },
  { tipo: TipoSeccion.TRIBUNA, nombre: 'Tribunas', multiplicador: 1.5 },
  { tipo: TipoSeccion.PREFERENCIA, nombre: 'Preferencia', multiplicador: 1.2 },
  { tipo: TipoSeccion.GENERAL, nombre: 'General', multiplicador: 1.0 },
];

const FILAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ASIENTOS_POR_FILA = 12;

const EVENTOS_DEMO = [
  {
    nombre: 'LDU Quito vs. Barcelona SC',
    descripcion: 'Fecha de Liga Pro Serie A',
    fecha: '2026-08-15',
    hora: '19:00:00',
    precioBase: 25.0,
    imagenUrl:
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    estadio: {
      nombre: 'Estadio Rodrigo Paz Delgado',
      ubicacion: 'Quito, Ecuador',
      capacidad: 41575,
    },
  },
  {
    nombre: 'El Nacional vs. Independiente del Valle',
    descripcion: 'Fecha de Liga Pro Serie A',
    fecha: '2026-08-20',
    hora: '16:00:00',
    precioBase: 15.0,
    imagenUrl:
      'https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=800&q=80',
    estadio: {
      nombre: 'Estadio Olímpico Atahualpa',
      ubicacion: 'Quito, Ecuador',
      capacidad: 35000,
    },
  },
  {
    nombre: 'Emelec vs. Aucas',
    descripcion: 'Fecha de Liga Pro Serie A',
    fecha: '2026-08-25',
    hora: '18:00:00',
    precioBase: 20.0,
    imagenUrl:
      'https://images.unsplash.com/photo-1518605368461-1ee7e53f1a0e?auto=format&fit=crop&w=800&q=80',
    estadio: {
      nombre: 'Estadio George Capwell',
      ubicacion: 'Guayaquil, Ecuador',
      capacidad: 20000,
    },
  },
];

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Evento) private eventoRepository: Repository<Evento>,
    @InjectRepository(Escenario) private escenarioRepository: Repository<Escenario>,
    @InjectRepository(Seccion) private seccionRepository: Repository<Seccion>,
    @InjectRepository(Fila) private filaRepository: Repository<Fila>,
    @InjectRepository(Asiento) private asientoRepository: Repository<Asiento>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.eventoRepository.count();
    if (count > 0) {
      this.logger.log('Ya existen eventos, se omite la siembra de datos demo.');
      return;
    }

    this.logger.log('Sembrando eventos demo con escenario/secciones/filas/asientos...');

    for (const datos of EVENTOS_DEMO) {
      const escenario = await this.escenarioRepository.save(
        this.escenarioRepository.create({
          nombre: datos.estadio.nombre,
          descripcion: `Estadio sede de ${datos.nombre}`,
          ubicacion: datos.estadio.ubicacion,
          capacidad: datos.estadio.capacidad,
        }),
      );

      for (const zona of ZONAS) {
        const seccion = await this.seccionRepository.save(
          this.seccionRepository.create({
            nombre: zona.nombre,
            descripcion: `Localidad ${zona.nombre}`,
            capacidad: FILAS.length * ASIENTOS_POR_FILA,
            tipo: zona.tipo,
            multiplicador: zona.multiplicador,
            escenario,
          }),
        );

        for (const nombreFila of FILAS) {
          const fila = await this.filaRepository.save(
            this.filaRepository.create({
              nombre: nombreFila,
              descripcion: `Fila ${nombreFila}`,
              capacidad: ASIENTOS_POR_FILA,
              seccion,
            }),
          );

          const asientos = Array.from({ length: ASIENTOS_POR_FILA }, (_, i) =>
            this.asientoRepository.create({
              numero: String(i + 1),
              fila,
            }),
          );
          await this.asientoRepository.save(asientos);
        }
      }

      await this.eventoRepository.save(
        this.eventoRepository.create({
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          fecha: datos.fecha,
          hora: datos.hora,
          precioBase: datos.precioBase,
          imagenUrl: datos.imagenUrl,
          escenario,
        }),
      );
    }

    this.logger.log('Eventos demo creados exitosamente.');
  }
}
