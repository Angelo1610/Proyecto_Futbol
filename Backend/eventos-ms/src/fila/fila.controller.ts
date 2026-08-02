import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FilaService } from './fila.service';
import { CreateFilaDto } from './dto/create-fila.dto';
import { UpdateFilaDto } from './dto/update-fila.dto';

@Controller('fila')
export class FilaController {
  constructor(private readonly filaService: FilaService) {}

  @Post()
  create(@Body() createFilaDto: CreateFilaDto) {
    return this.filaService.create(createFilaDto);
  }

  @Get()
  findAll() {
    return this.filaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFilaDto: UpdateFilaDto) {
    return this.filaService.update(id, updateFilaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filaService.remove(id);
  }
}
