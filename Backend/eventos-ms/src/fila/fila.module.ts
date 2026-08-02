import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilaService } from './fila.service';
import { FilaController } from './fila.controller';
import { Fila } from './entities/fila.entity';
import { Seccion } from 'src/seccion/entities/seccion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fila, Seccion])],
  controllers: [FilaController],
  providers: [FilaService],
})
export class FilaModule {}
