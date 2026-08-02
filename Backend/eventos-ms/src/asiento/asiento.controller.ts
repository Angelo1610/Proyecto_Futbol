import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AsientoService } from './asiento.service';
import { CreateAsientoDto } from './dto/create-asiento.dto';
import { UpdateAsientoDto } from './dto/update-asiento.dto';

@Controller('asiento')
export class AsientoController {
  constructor(private readonly asientoService: AsientoService) {}

  @Post()
  create(@Body() createAsientoDto: CreateAsientoDto) {
    return this.asientoService.create(createAsientoDto);
  }

  @Get()
  findAll() {
    return this.asientoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.asientoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAsientoDto: UpdateAsientoDto) {
    return this.asientoService.update(id, updateAsientoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.asientoService.remove(id);
  }
}
