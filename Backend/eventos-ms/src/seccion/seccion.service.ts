import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seccion } from './entities/seccion.entity';
import { Escenario } from 'src/escenario/entities/escenario.entity';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { UpdateSeccionDto } from './dto/update-seccion.dto';

@Injectable()
export class SeccionService {
  constructor(
    @InjectRepository(Seccion)
    private seccionRepository: Repository<Seccion>,
    @InjectRepository(Escenario)
    private escenarioRepository: Repository<Escenario>,
  ) {}

  async create(createSeccionDto: CreateSeccionDto): Promise<Seccion> {
    const { escenarioId, ...datos } = createSeccionDto;
    const escenario = await this.escenarioRepository.findOneBy({ id: escenarioId });
    if (!escenario) throw new NotFoundException('Escenario not found');
    const seccion = this.seccionRepository.create({ ...datos, escenario });
    return this.seccionRepository.save(seccion);
  }

  findAll(): Promise<Seccion[]> {
    return this.seccionRepository.find({ relations: ['escenario'] });
  }

  async findOne(id: string): Promise<Seccion> {
    const seccion = await this.seccionRepository.findOne({ where: { id }, relations: ['escenario'] });
    if (!seccion) throw new NotFoundException('Seccion not found');
    return seccion;
  }

  async update(id: string, updateSeccionDto: UpdateSeccionDto): Promise<Seccion> {
    const seccion = await this.findOne(id);
    Object.assign(seccion, updateSeccionDto);
    return this.seccionRepository.save(seccion);
  }

  async remove(id: string): Promise<void> {
    const seccion = await this.findOne(id);
    await this.seccionRepository.remove(seccion);
  }
}
