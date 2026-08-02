import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZonaConfig } from './entities/zona-config.entity';
import { UpdateZonaConfigDto } from './dto/update-zona-config.dto';
import { TipoSeccion } from '../seccion/entities/seccion.entity';

const DEFAULT_ZONAS: Record<TipoSeccion, { nombre: string; multiplicador: number }> = {
  [TipoSeccion.PALCO]: { nombre: 'Palcos', multiplicador: 2.5 },
  [TipoSeccion.TRIBUNA]: { nombre: 'Tribunas', multiplicador: 1.5 },
  [TipoSeccion.PREFERENCIA]: { nombre: 'Preferencia', multiplicador: 1.2 },
  [TipoSeccion.GENERAL]: { nombre: 'General', multiplicador: 1.0 },
};

@Injectable()
export class ConfigZonaService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(ZonaConfig)
    private zonaConfigRepository: Repository<ZonaConfig>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.zonaConfigRepository.count();
    if (count > 0) return;

    for (const tipo of Object.values(TipoSeccion)) {
      const defaults = DEFAULT_ZONAS[tipo];
      await this.zonaConfigRepository.save(
        this.zonaConfigRepository.create({ tipo, ...defaults }),
      );
    }
  }

  findAll(): Promise<ZonaConfig[]> {
    return this.zonaConfigRepository.find();
  }

  async update(tipo: TipoSeccion, dto: UpdateZonaConfigDto): Promise<ZonaConfig> {
    const zona = await this.zonaConfigRepository.findOneBy({ tipo });
    if (!zona) {
      throw new NotFoundException(`Zona ${tipo} not found`);
    }
    Object.assign(zona, dto);
    return this.zonaConfigRepository.save(zona);
  }
}
