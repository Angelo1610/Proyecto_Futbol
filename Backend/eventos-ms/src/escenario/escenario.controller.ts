import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EscenarioService } from './escenario.service';
import { CreateEscenarioDto } from './dto/create-escenario.dto';
import { UpdateEscenarioDto } from './dto/update-escenario.dto';

@Controller('escenario')
export class EscenarioController {
  constructor(private readonly escenarioService: EscenarioService) {}

  @Post()
  create(@Body() createEscenarioDto: CreateEscenarioDto) {
    return this.escenarioService.create(createEscenarioDto);
  }

  @Get()
  findAll() {
    return this.escenarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.escenarioService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEscenarioDto: UpdateEscenarioDto) {
    return this.escenarioService.update(id, updateEscenarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.escenarioService.remove(id);
  }
}
