import React, { useState, useEffect } from 'react';
import { getMatches, getEscenarios, createMatch, updateMatch, deleteMatch } from '../../api/eventos';
import { getReservasPorEvento } from '../../api/reservas';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';

const ESTADO_RESERVA_LABEL = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  expirada: 'Expirada',
};

function toLocalDateTimeString(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function MatchManagement() {
  const [matches, setMatches] = useState([]);
  const [escenarios, setEscenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [matchToDelete, setMatchToDelete] = useState(null);

  const [reservasMatch, setReservasMatch] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [reservasError, setReservasError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    escenarioId: null,
    date: null,
    priceBase: 10,
    imageUrl: ''
  });
  const [formError, setFormError] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([getMatches(), getEscenarios()])
      .then(([matchesData, escenariosData]) => {
        setMatches(matchesData);
        setEscenarios(escenariosData);
      })
      .catch((err) => setError(err.message || 'No se pudo cargar la información'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingMatchId(null);
    setFormError('');
    setFormData({
      title: '',
      escenarioId: escenarios[0]?.id ?? null,
      date: null,
      priceBase: 10,
      imageUrl: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (match) => {
    setEditingMatchId(match.id);
    setFormError('');
    setFormData({
      title: match.title,
      escenarioId: match.escenarioId,
      date: new Date(match.date),
      priceBase: match.priceBase,
      imageUrl: match.imageUrl
    });
    setIsModalOpen(true);
  };

  const executeDelete = async () => {
    if (!matchToDelete) return;
    try {
      await deleteMatch(matchToDelete);
      setMatches(matches.filter(m => m.id !== matchToDelete));
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el partido');
    } finally {
      setMatchToDelete(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.imageUrl) {
      setFormError('Ingresa una URL de imagen para el partido.');
      return;
    }
    if (!formData.date) {
      setFormError('Selecciona una fecha válida.');
      return;
    }
    if (!formData.escenarioId) {
      setFormError('Selecciona un estadio sede.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        escenarioId: formData.escenarioId,
        date: toLocalDateTimeString(formData.date),
        priceBase: formData.priceBase,
        imageUrl: formData.imageUrl
      };
      if (editingMatchId) {
        const updated = await updateMatch(editingMatchId, payload);
        setMatches(matches.map(m => m.id === editingMatchId ? updated : m));
      } else {
        const created = await createMatch(payload);
        setMatches([created, ...matches]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'No se pudo guardar el partido');
    } finally {
      setSaving(false);
    }
  };

  const openReservas = async (match) => {
    setReservasMatch(match);
    setReservasError('');
    setLoadingReservas(true);
    try {
      const data = await getReservasPorEvento(match.id);
      setReservas(data);
    } catch (err) {
      setReservasError(err.message || 'No se pudieron cargar las reservas de este partido');
    } finally {
      setLoadingReservas(false);
    }
  };

  const escenarioOptions = escenarios.map(e => ({ label: e.nombre, value: e.id }));

  if (loading) {
    return (
      <div className="flex justify-content-center p-8">
        <ProgressSpinner style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-column gap-5">
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-color m-0">Programación de Partidos</h1>
          <p className="text-color-secondary mt-1">Crea y edita los eventos deportivos disponibles.</p>
        </div>
        <Button label="Nuevo Partido" icon="pi pi-calendar-plus" className="p-button-primary" onClick={openCreateModal} disabled={escenarios.length === 0} />
      </div>

      {error && <Message severity="error" text={error} />}

      <div className="flex flex-column gap-4">
        {matches.map(match => (
          <div key={match.id} className="solid-bg-white border-round-3xl shadow-4 overflow-hidden border-1 border-200 flex flex-column md:flex-row transition-all hover:shadow-6 group relative">
             <div className="w-full md:w-20rem h-12rem md:h-auto relative">
                <img src={match.imageUrl} alt={match.title} className="w-full h-full object-cover" />
                <div className="absolute top-0 left-0 w-full h-full bg-black-alpha-40 transition-alpha group-hover:bg-black-alpha-20"></div>
                <div className="absolute bottom-0 left-0 p-3">
                   <span className="font-bold text-white bg-primary px-3 py-1 border-round-xl shadow-2">
                     ${match.priceBase.toFixed(2)} Base
                   </span>
                </div>
             </div>

             <div className="flex-1 p-4 md:p-5 flex flex-column justify-content-between relative">
                <div className="absolute top-0 right-0 p-4 flex gap-2">
                   <Button icon="pi pi-list" className="p-button-rounded p-button-info p-button-text surface-100 hover:surface-200" onClick={() => openReservas(match)} tooltip="Ver Reservas" />
                   <Button icon="pi pi-pencil" className="p-button-rounded p-button-secondary p-button-text surface-100 hover:surface-200 text-color" onClick={() => openEditModal(match)} tooltip="Editar" />
                   <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text surface-100 hover:surface-200" onClick={() => setMatchToDelete(match.id)} tooltip="Eliminar" />
                </div>

                <div className="mb-4 pr-8">
                  <h3 className="font-bold text-3xl text-color m-0 mb-2">{match.title}</h3>
                  <div className="flex align-items-center gap-2 text-color-secondary">
                     <i className="pi pi-map-marker text-primary text-lg"></i>
                     <span className="font-medium text-lg">{match.stadium}</span>
                  </div>
                </div>

                <div className="flex flex-column md:flex-row align-items-start md:align-items-center gap-4 mt-auto border-top-1 surface-border pt-4">
                  <div className="flex align-items-center gap-3 bg-blue-50 px-4 py-3 border-round-2xl border-1 border-blue-200">
                     <i className="pi pi-calendar text-blue-500 text-2xl"></i>
                     <div className="flex flex-column">
                        <span className="text-xs text-blue-500 font-bold uppercase tracking-widest">Fecha Programada</span>
                        <span className="text-base font-bold text-color mt-1">{new Date(match.date).toLocaleString('es-EC', { dateStyle: 'long', timeStyle: 'short' })}</span>
                     </div>
                  </div>
                  <div className="flex align-items-center gap-3 surface-50 px-4 py-3 border-round-2xl border-1 surface-border">
                     <i className="pi pi-verified text-green-500 text-2xl"></i>
                     <div className="flex flex-column">
                        <span className="text-xs text-color-secondary font-bold uppercase tracking-widest">Estado</span>
                        <span className="text-base font-bold text-green-600 mt-1">Venta Abierta</span>
                     </div>
                  </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      <Dialog header={editingMatchId ? 'Editar Partido' : 'Registrar Nuevo Partido'} visible={isModalOpen} onHide={() => setIsModalOpen(false)} style={{ width: '600px' }} breakpoints={{ '960px': '75vw', '640px': '90vw' }}>
        <form id="matchForm" onSubmit={handleSave} className="flex flex-column gap-4 pt-3">
          {formError && <Message severity="error" text={formError} />}

          <div className="flex flex-column gap-2">
            <label htmlFor="imageUrl" className="font-medium text-color-secondary">URL de Imagen Promocional</label>
            <InputText id="imageUrl" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." required />
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="Preview" className="w-full h-12rem object-cover border-round-xl border-1 surface-border" />
            )}
          </div>

          <div className="grid">
            <div className="col-12 md:col-6 flex flex-column gap-2">
              <label htmlFor="title" className="font-medium text-color-secondary">Título del Encuentro</label>
              <InputText id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Ej. LDU vs Barcelona SC" />
            </div>

            <div className="col-12 md:col-6 flex flex-column gap-2">
              <label htmlFor="stadium" className="font-medium text-color-secondary">Estadio Sede</label>
              <Dropdown id="stadium" value={formData.escenarioId} options={escenarioOptions} onChange={e => setFormData({...formData, escenarioId: e.value})} required />
            </div>

            <div className="col-12 md:col-6 flex flex-column gap-2">
              <label htmlFor="date" className="font-medium text-color-secondary">Fecha y Hora</label>
              <Calendar id="date" value={formData.date} onChange={e => setFormData({...formData, date: e.value})} showTime hourFormat="24" required />
            </div>

            <div className="col-12 md:col-6 flex flex-column gap-2">
              <label htmlFor="priceBase" className="font-medium text-color-secondary">Precio Base (General)</label>
              <InputNumber id="priceBase" value={formData.priceBase} onValueChange={e => setFormData({...formData, priceBase: e.value})} mode="currency" currency="USD" locale="en-US" required min={1} />
            </div>
          </div>

          <div className="flex justify-content-end gap-2 mt-3">
            <Button type="button" label="Cancelar" className="p-button-text" onClick={() => setIsModalOpen(false)} disabled={saving} />
            <Button type="submit" label={saving ? 'Guardando...' : (editingMatchId ? 'Guardar Cambios' : 'Publicar Partido')} icon="pi pi-save" disabled={saving} />
          </div>
        </form>
      </Dialog>

      <Dialog
        header={`Reservas - ${reservasMatch?.title ?? ''}`}
        visible={!!reservasMatch}
        onHide={() => setReservasMatch(null)}
        style={{ width: '700px' }}
        breakpoints={{ '960px': '90vw' }}
      >
        {reservasError && <Message severity="error" text={reservasError} className="w-full mb-3" />}
        {loadingReservas ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner style={{ width: '2rem', height: '2rem' }} />
          </div>
        ) : (
          <DataTable value={reservas} paginator rows={8} emptyMessage="Este partido todavía no tiene reservas.">
            <Column field="usuarioId" header="Usuario" style={{ maxWidth: '180px' }} body={(r) => <span className="text-xs font-mono">{r.usuarioId}</span>} />
            <Column header="Asientos" body={(r) => r.detalleAsientos?.length ?? 0} />
            <Column field="montoTotal" header="Monto" body={(r) => `$${Number(r.montoTotal).toFixed(2)}`} />
            <Column field="estado" header="Estado" body={(r) => ESTADO_RESERVA_LABEL[r.estado] ?? r.estado} />
            <Column field="fechaReserva" header="Fecha" body={(r) => new Date(r.fechaReserva).toLocaleString('es-EC')} />
          </DataTable>
        )}
      </Dialog>

      <Dialog header="Eliminar Partido" visible={!!matchToDelete} onHide={() => setMatchToDelete(null)} style={{ width: '400px' }}>
        <div className="flex flex-column align-items-center text-center gap-3 pt-3">
          <i className="pi pi-exclamation-triangle text-red-500 text-5xl"></i>
          <p className="m-0 text-color-secondary">¿Estás seguro de que deseas eliminar este partido? Esta acción no se puede deshacer.</p>
          <div className="flex gap-2 w-full mt-3">
            <Button label="Cancelar" className="p-button-text flex-1" onClick={() => setMatchToDelete(null)} />
            <Button label="Sí, Eliminar" className="p-button-danger flex-1" onClick={executeDelete} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
