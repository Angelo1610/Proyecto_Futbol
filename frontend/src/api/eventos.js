import { eventosApi } from './client';

export function mapMatch(evento) {
  return {
    id: evento.id,
    title: evento.nombre,
    date: `${evento.fecha}T${evento.hora}`,
    stadium: evento.escenario?.nombre ?? '',
    imageUrl: evento.imagenUrl,
    priceBase: Number(evento.precioBase),
    escenarioId: evento.escenario?.id,
  };
}

export async function getMatches() {
  const eventos = await eventosApi.get('/evento');
  return eventos.map(mapMatch);
}

export async function getEventoDetalle(id) {
  return eventosApi.get(`/evento/${id}`);
}

export async function createMatch({ title, escenarioId, date, priceBase, imageUrl }) {
  const [fecha, hora] = date.split('T');
  const evento = await eventosApi.post('/evento', {
    nombre: title,
    descripcion: title,
    fecha,
    hora: hora?.length === 5 ? `${hora}:00` : hora,
    precioBase: Number(priceBase),
    imagenUrl: imageUrl,
    escenarioId,
  });
  return mapMatch(evento);
}

export async function updateMatch(id, { title, escenarioId, date, priceBase, imageUrl }) {
  const payload = {};
  if (title !== undefined) {
    payload.nombre = title;
    payload.descripcion = title;
  }
  if (date !== undefined) {
    const [fecha, hora] = date.split('T');
    payload.fecha = fecha;
    payload.hora = hora?.length === 5 ? `${hora}:00` : hora;
  }
  if (priceBase !== undefined) payload.precioBase = Number(priceBase);
  if (imageUrl !== undefined) payload.imagenUrl = imageUrl;
  if (escenarioId !== undefined) payload.escenarioId = escenarioId;

  const evento = await eventosApi.patch(`/evento/${id}`, payload);
  return mapMatch(evento);
}

export function deleteMatch(id) {
  return eventosApi.delete(`/evento/${id}`);
}

export function getEscenarios() {
  return eventosApi.get('/escenario');
}

export function getEscenarioDetalle(id) {
  return eventosApi.get(`/escenario/${id}`);
}

export function getZonaConfig() {
  return eventosApi.get('/config/zonas');
}

export function updateZonaConfig(tipo, { nombre, multiplicador }) {
  return eventosApi.patch(`/config/zonas/${tipo}`, { nombre, multiplicador });
}
