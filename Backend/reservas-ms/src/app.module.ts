import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ReservaModule } from './reserva/reserva.module';
import { TicketModule } from './ticket/ticket.module';
import { EventosClientModule } from './eventos-client/eventos-client.module';
import { ReportesModule } from './reportes/reportes.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: +config.get<string>('DB_PORT', '3306'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // solo desarrollo
        logging: true,
      }),
    }),
    EventosClientModule,
    ReservaModule,
    TicketModule,
    ReportesModule,
    SeedModule,
  ],
})
export class AppModule {}
