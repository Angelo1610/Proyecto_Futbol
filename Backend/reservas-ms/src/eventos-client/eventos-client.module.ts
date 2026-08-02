import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EventosClientService } from './eventos-client.service';

@Module({
  imports: [HttpModule],
  providers: [EventosClientService],
  exports: [EventosClientService],
})
export class EventosClientModule {}
