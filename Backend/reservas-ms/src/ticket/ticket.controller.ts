import { BadRequestException, Controller, ForbiddenException, Get, Query, Req, UseGuards } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { AuthUser, JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  findByUsuario(@Query('usuarioId') usuarioId: string, @Req() req: { user: AuthUser }) {
    if (!usuarioId) {
      throw new BadRequestException('El query param usuarioId es obligatorio');
    }
    const isAdmin = req.user.roles.map((r) => r.toLowerCase()).includes('admin');
    if (!isAdmin && usuarioId !== req.user.id) {
      throw new ForbiddenException('No puede consultar los tickets de otro usuario');
    }
    return this.ticketService.findByUsuario(usuarioId);
  }
}
