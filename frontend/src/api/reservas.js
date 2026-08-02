import { reservasApi } from './client';

export function mapTicket(ticket) {
  return {
    id: ticket.codigo,
    matchTitle: ticket.eventoNombre,
    date: ticket.eventoFechaHora,
    stadium: ticket.estadioNombre,
    zone: ticket.zona,
    seat: ticket.numeroAsiento,
    price: Number(ticket.precio),
  };
}

export function crearReserva({ usuarioId, eventoId, asientoIds }) {
  return reservasApi.post('/reservas', { usuarioId, eventoId, asientoIds });
}

export function pagarReserva(reservaId, metodo = 'tarjeta') {
  return reservasApi.post(`/reservas/${reservaId}/pagar`, { metodo });
}

export function cancelarReserva(reservaId) {
  return reservasApi.post(`/reservas/${reservaId}/cancelar`);
}

export function getReserva(reservaId) {
  return reservasApi.get(`/reservas/${reservaId}`);
}

export function getReservasPorEvento(eventoId) {
  const params = new URLSearchParams();
  if (eventoId && eventoId !== 'all') params.set('eventoId', eventoId);
  const qs = params.toString();
  return reservasApi.get(`/reservas${qs ? `?${qs}` : ''}`);
}

export async function getTicketsPorUsuario(usuarioId) {
  const tickets = await reservasApi.get(`/tickets?usuarioId=${usuarioId}`);
  return tickets.map(mapTicket);
}

export async function abrirReporteMisReservas(usuarioId) {
  const blob = await reservasApi.getBlob(`/reportes/mis-reservas/${usuarioId}`);
  window.open(URL.createObjectURL(blob), '_blank');
}

export async function abrirReporteGeneral({ eventoId, fechaInicio, fechaFin, estado } = {}) {
  const params = new URLSearchParams();
  if (eventoId && eventoId !== 'all') params.set('eventoId', eventoId);
  if (fechaInicio) params.set('fechaInicio', fechaInicio);
  if (fechaFin) params.set('fechaFin', fechaFin);
  if (estado) params.set('estado', estado);
  const qs = params.toString();
  const blob = await reservasApi.getBlob(`/reportes/general${qs ? `?${qs}` : ''}`);
  window.open(URL.createObjectURL(blob), '_blank');
}
