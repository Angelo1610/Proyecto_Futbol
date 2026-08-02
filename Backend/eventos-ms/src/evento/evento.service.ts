import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Evento } from './entities/evento.entity';
import { Repository, ILike } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Escenario } from 'src/escenario/entities/escenario.entity';

export interface FiltrosEvento {
  fecha?: string;
  nombre?: string;
  estadio?: string;
}

@Injectable()
export class EventoService {
  constructor(
    @InjectRepository(Evento)
    private eventoRepository: Repository<Evento>,
    @InjectRepository(Escenario)
    private escenarioRepository: Repository<Escenario>,
  ) {}

  async create(createEventoDto: CreateEventoDto):Promise<Evento> {
    const {escenarioId, ...eventoDato} = createEventoDto;
    const escenario = await this.escenarioRepository.findOneBy({id:escenarioId});
    if(!escenario){
      throw new NotFoundException('Escenario not Found');
    }
    const evento  = this.eventoRepository.create({...eventoDato,escenario});
    return this.eventoRepository.save(evento);
  }

  findAll(filtros: FiltrosEvento = {}): Promise<Evento[]> {
    const where: Record<string, unknown> = {};
    if (filtros.fecha) where.fecha = filtros.fecha;
    if (filtros.nombre) where.nombre = ILike(`%${filtros.nombre}%`);
    if (filtros.estadio) where.escenario = { nombre: ILike(`%${filtros.estadio}%`) };

    return this.eventoRepository.find({
      where,
      relations: ['escenario', 'escenario.seccion'],
      order: { fecha: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Evento> {
    const evento = await this.eventoRepository.findOne({
      where: { id },
      relations: ['escenario', 'escenario.seccion', 'escenario.seccion.fila', 'escenario.seccion.fila.asiento'],
    });
    if (!evento) {
      throw new NotFoundException(`Evento with id ${id} not found`);
    }
    return evento;
  }

  async update(id: string, updateEventoDto: UpdateEventoDto): Promise<Evento> {
    const { escenarioId, ...eventoDato } = updateEventoDto;
    const evento = await this.findOne(id);
    if (escenarioId) {
      const escenario = await this.escenarioRepository.findOneBy({ id: escenarioId });
      if (!escenario) {
        throw new NotFoundException('Escenario not Found');
      }
      evento.escenario = escenario;
    }
    Object.assign(evento, eventoDato);
    return this.eventoRepository.save(evento);
  }

  async remove(id: string): Promise<void> {
    const evento = await this.findOne(id);
    await this.eventoRepository.remove(evento);
  }
}