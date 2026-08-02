import { Controller, ForbiddenException, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportesService } from './reportes.service';
import { AuthUser, JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('reportes')
@UseGuards(JwtAuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('mis-reservas/:usuarioId')
  async misReservas(
    @Param('usuarioId') usuarioId: string,
    @Req() req: { user: AuthUser },
    @Res() res: Response,
  ) {
    const isAdmin = req.user.roles.map((r) => r.toLowerCase()).includes('admin');
    if (!isAdmin && usuarioId !== req.user.id) {
      throw new ForbiddenException('No puede consultar el reporte de otro usuario');
    }
    const doc = await this.reportesService.generarReporteIndividual(usuarioId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="mis-reservas.pdf"');
    doc.pipe(res);
    doc.end();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('general')
  async general(
    @Query('fechaInicio') fechaInicio: string | undefined,
    @Query('fechaFin') fechaFin: string | undefined,
    @Query('eventoId') eventoId: string | undefined,
    @Query('estado') estado: string | undefined,
    @Res() res: Response,
  ) {
    const doc = await this.reportesService.generarReporteGeneral({
      fechaInicio,
      fechaFin,
      eventoId,
      estado,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="reporte-general.pdf"');
    doc.pipe(res);
    doc.end();
  }
}
