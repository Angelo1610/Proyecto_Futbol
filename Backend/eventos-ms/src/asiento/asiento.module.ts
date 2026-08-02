import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsientoService } from './asiento.service';
import { AsientoController } from './asiento.controller';
import { Asiento } from './entities/asiento.entity';
import { Fila } from 'src/fila/entities/fila.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asiento, Fila])],
  controllers: [AsientoController],
  providers: [AsientoService],
})
export class AsientoModule {}
