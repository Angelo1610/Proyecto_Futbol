import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscenarioService } from './escenario.service';
import { EscenarioController } from './escenario.controller';
import { Escenario } from './entities/escenario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Escenario])],
  controllers: [EscenarioController],
  providers: [EscenarioService],
})
export class EscenarioModule {}