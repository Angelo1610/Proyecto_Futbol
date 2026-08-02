import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZonaConfig } from './entities/zona-config.entity';
import { ConfigZonaService } from './config-zona.service';
import { ConfigZonaController } from './config-zona.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ZonaConfig])],
  controllers: [ConfigZonaController],
  providers: [ConfigZonaService],
  exports: [ConfigZonaService],
})
export class ConfigZonaModule {}
