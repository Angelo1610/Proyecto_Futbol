import { Injectable } from '@nestjs/common';
import { CreateEscenarioDto } from './dto/create-escenario.dto';
import { UpdateEscenarioDto } from './dto/update-escenario.dto';
import { Escenario } from './entities/escenario.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class EscenarioService {
  constructor(
    @InjectRepository(Escenario)
    private escenarioRepository: Repository<Escenario>,
  ) {}

  async create(createEscenarioDto: CreateEscenarioDto): Promise<Escenario> {
    const escenario = this.escenarioRepository.create(createEscenarioDto);
    return this.escenarioRepository.save(escenario);
  }



  async findAll(): Promise<Escenario[]> {
    return this.escenarioRepository.find();
  }

  async findOne(id: string):Promise<Escenario> {
    const escenario = await this.escenarioRepository.findOne({
      where: { id },
      relations: ['seccion', 'seccion.fila', 'seccion.fila.asiento'],
    });
    if(!escenario){
        throw new NotFoundException(`Escenario with id ${id} not found`);
    }
    return escenario;
  }

  async update(id: string, updateEscenarioDto: UpdateEscenarioDto): Promise<Escenario> {
    const escenario = await this.findOne( id );
    Object.assign(escenario, updateEscenarioDto);
    return this.escenarioRepository.save(escenario);
  }

  async remove(id: string): Promise<void> {
    const escenario = await this.findOne( id );
    await this.escenarioRepository.remove(escenario);
  }
}