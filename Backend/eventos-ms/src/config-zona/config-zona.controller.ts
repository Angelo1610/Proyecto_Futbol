import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ConfigZonaService } from './config-zona.service';
import { UpdateZonaConfigDto } from './dto/update-zona-config.dto';
import { TipoSeccion } from '../seccion/entities/seccion.entity';

@Controller('config/zonas')
export class ConfigZonaController {
  constructor(private readonly configZonaService: ConfigZonaService) {}

  @Get()
  findAll() {
    return this.configZonaService.findAll();
  }

  @Patch(':tipo')
  update(@Param('tipo') tipo: TipoSeccion, @Body() dto: UpdateZonaConfigDto) {
    return this.configZonaService.update(tipo, dto);
  }
}
