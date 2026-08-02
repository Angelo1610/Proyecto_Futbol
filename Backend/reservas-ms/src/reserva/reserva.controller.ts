import { Body, Controller, ForbiddenException, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { JwtAuthGuard, AuthUser } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

function isAdmin(user: AuthUser): boolean {
  return user.roles.map((r) => r.toLowerCase()).includes('admin');
}

@UseGuards(JwtAuthGuard)
@Controller('reservas')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  create(@Body() createReservaDto: CreateReservaDto, @Req() req: { user: AuthUser }) {
    // El usuarioId siempre se toma del token, nunca del body, para evitar suplantación.
    createReservaDto.usuarioId = req.user.id;
    return this.reservaService.create(createReservaDto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Query('eventoId') eventoId?: string, @Query('estado') estado?: string) {
    return this.reservaService.findAll({ eventoId, estado });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: { user: AuthUser }) {
    const reserva = await this.reservaService.findOne(id);
    if (!isAdmin(req.user) && reserva.usuarioId !== req.user.id) {
      throw new ForbiddenException('No puede consultar una reserva de otro usuario');
    }
    return reserva;
  }

  @Post(':id/pagar')
  pagar(@Param('id') id: string, @Body('metodo') metodo: string | undefined, @Req() req: { user: AuthUser }) {
    return this.reservaService.pagar(id, { id: req.user.id, isAdmin: isAdmin(req.user) }, metodo);
  }

  @Post(':id/cancelar')
  cancelar(@Param('id') id: string, @Req() req: { user: AuthUser }) {
    return this.reservaService.cancelar(id, { id: req.user.id, isAdmin: isAdmin(req.user) });
  }
}
