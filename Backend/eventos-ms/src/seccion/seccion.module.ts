import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeccionService } from './seccion.service';
import { SeccionController } from './seccion.controller';
import { Seccion } from './entities/seccion.entity';
import { Escenario } from 'src/escenario/entities/escenario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seccion, Escenario])],
  controllers: [SeccionController],
  providers: [SeccionService],
})
export class SeccionModule {}
