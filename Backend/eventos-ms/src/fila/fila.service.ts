import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fila } from './entities/fila.entity';
import { Seccion } from 'src/seccion/entities/seccion.entity';
import { CreateFilaDto } from './dto/create-fila.dto';
import { UpdateFilaDto } from './dto/update-fila.dto';

@Injectable()
export class FilaService {
  constructor(
    @InjectRepository(Fila)
    private filaRepository: Repository<Fila>,
    @InjectRepository(Seccion)
    private seccionRepository: Repository<Seccion>,
  ) {}

  async create(createFilaDto: CreateFilaDto): Promise<Fila> {
    const { seccionId, ...datos } = createFilaDto;
    const seccion = await this.seccionRepository.findOneBy({ id: seccionId });
    if (!seccion) throw new NotFoundException('Seccion not found');
    const fila = this.filaRepository.create({ ...datos, seccion });
    return this.filaRepository.save(fila);
  }

  findAll(): Promise<Fila[]> {
    return this.filaRepository.find({ relations: ['seccion'] });
  }

  async findOne(id: string): Promise<Fila> {
    const fila = await this.filaRepository.findOne({ where: { id }, relations: ['seccion'] });
    if (!fila) throw new NotFoundException('Fila not found');
    return fila;
  }

  async update(id: string, updateFilaDto: UpdateFilaDto): Promise<Fila> {
    const fila = await this.findOne(id);
    Object.assign(fila, updateFilaDto);
    return this.filaRepository.save(fila);
  }

  async remove(id: string): Promise<void> {
    const fila = await this.findOne(id);
    await this.filaRepository.remove(fila);
  }
}
