import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asiento } from './entities/asiento.entity';
import { Fila } from 'src/fila/entities/fila.entity';
import { CreateAsientoDto } from './dto/create-asiento.dto';
import { UpdateAsientoDto } from './dto/update-asiento.dto';

@Injectable()
export class AsientoService {
  constructor(
    @InjectRepository(Asiento)
    private asientoRepository: Repository<Asiento>,
    @InjectRepository(Fila)
    private filaRepository: Repository<Fila>,
  ) {}

  async create(createAsientoDto: CreateAsientoDto): Promise<Asiento> {
    const { filaId, ...datos } = createAsientoDto;
    const fila = await this.filaRepository.findOneBy({ id: filaId });
    if (!fila) throw new NotFoundException('Fila not found');
    const asiento = this.asientoRepository.create({ ...datos, fila });
    return this.asientoRepository.save(asiento);
  }

  findAll(): Promise<Asiento[]> {
    return this.asientoRepository.find({ relations: ['fila'] });
  }

  async findOne(id: string): Promise<Asiento> {
    const asiento = await this.asientoRepository.findOne({ where: { id }, relations: ['fila'] });
    if (!asiento) throw new NotFoundException('Asiento not found');
    return asiento;
  }

  async update(id: string, updateAsientoDto: UpdateAsientoDto): Promise<Asiento> {
    const asiento = await this.findOne(id);
    Object.assign(asiento, updateAsientoDto);
    return this.asientoRepository.save(asiento);
  }

  async remove(id: string): Promise<void> {
    const asiento = await this.findOne(id);
    await this.asientoRepository.remove(asiento);
  }
}
