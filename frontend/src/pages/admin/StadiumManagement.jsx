import React, { useState, useEffect } from 'react';
import { getZonaConfig, updateZonaConfig, getEscenarios, getEscenarioDetalle } from '../../api/eventos';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Slider } from 'primereact/slider';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';

const ESTADO_ASIENTO_LABEL = { disponible: 'Disponibles', reservado: 'Reservados', vendido: 'Vendidos' };

function ConsultaEstadio() {
  const [escenarios, setEscenarios] = useState([]);
  const [escenarioId, setEscenarioId] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getEscenarios()
      .then((data) => {
        setEscenarios(data);
        if (data.length > 0) setEscenarioId(data[0].id);
      })
      .catch((err) => setError(err.message || 'No se pudieron cargar los estadios'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!escenarioId) return;
    getEscenarioDetalle(escenarioId)
      .then(setDetalle)
      .catch((err) => setError(err.message || 'No se pudo cargar el detalle del estadio'));
  }, [escenarioId]);

  const contarPorEstado = (asientos) =>
    asientos.reduce((acc, a) => {
      acc[a.estado] = (acc[a.estado] ?? 0) + 1;
      return acc;
    }, {});

  if (loading) {
    return (
      <div className="flex justify-content-center p-5">
        <ProgressSpinner style={{ width: '2rem', height: '2rem' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-column gap-4 surface-card border-round-2xl p-4 border-1 surface-border shadow-1">
      <div className="flex justify-content-between align-items-center">
        <h3 className="font-bold text-xl text-color m-0">Consulta de Estadio</h3>
        <Dropdown
          value={escenarioId}
          options={escenarios.map((e) => ({ label: e.nombre, value: e.id }))}
          onChange={(e) => setEscenarioId(e.value)}
          placeholder="Selecciona un estadio"
          className="w-15rem"
        />
      </div>

      {error && <Message severity="error" text={error} />}

      {detalle && (
        <div className="flex flex-column gap-3">
          <div className="flex gap-4 text-sm text-color-secondary">
            <span><i className="pi pi-map-marker mr-1"></i>{detalle.ubicacion}</span>
            <span><i className="pi pi-users mr-1"></i>Capacidad: {detalle.capacidad}</span>
          </div>
          {(detalle.seccion ?? []).map((seccion) => {
            const asientos = (seccion.fila ?? []).flatMap((f) => f.asiento ?? []);
            const conteo = contarPorEstado(asientos);
            return (
              <div key={seccion.id} className="surface-ground border-round-xl p-3 border-1 surface-border">
                <div className="flex justify-content-between align-items-center mb-2">
                  <span className="font-bold text-color">{seccion.nombre}</span>
                  <span className="text-xs text-color-secondary">{(seccion.fila ?? []).length} filas · {asientos.length} asientos</span>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(ESTADO_ASIENTO_LABEL).map(([estado, label]) => (
                    <span key={estado} className="text-xs px-2 py-1 border-round-lg surface-card border-1 surface-border">
                      {label}: <strong>{conteo[estado] ?? 0}</strong>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          {(detalle.seccion ?? []).length === 0 && (
            <p className="text-color-secondary text-sm m-0">Este estadio todavía no tiene secciones registradas.</p>
          )}
        </div>
      )}
    </div>
  );
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, innerRadius, outerRadius, startAngle, endAngle) {
  var start = polarToCartesian(x, y, outerRadius, endAngle);
  var end = polarToCartesian(x, y, outerRadius, startAngle);
  var startInner = polarToCartesian(x, y, innerRadius, endAngle);
  var endInner = polarToCartesian(x, y, innerRadius, startAngle);

  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  var d = [
      "M", start.x, start.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
      "L", endInner.x, endInner.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
      "Z"
  ].join(" ");

  return d;
}

// Colores fijos por tipo de zona (el backend solo maneja 4 tipos, no geometría de bloques)
const RING_STYLE = {
  palcos: { innerR: 90, outerR: 120, color: '#a855f7' },
  preferencia: { innerR: 125, outerR: 165, color: '#f97316' },
  tribunas: { innerR: 170, outerR: 215, color: '#14b8a6' },
  general: { innerR: 220, outerR: 270, color: '#6366f1' },
};

export default function StadiumManagement() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingZone, setEditingZone] = useState(null);
  const [formName, setFormName] = useState('');
  const [formMultiplier, setFormMultiplier] = useState(1.0);

  useEffect(() => {
    getZonaConfig()
      .then(setZones)
      .catch((err) => setError(err.message || 'No se pudo cargar la configuración de zonas'))
      .finally(() => setLoading(false));
  }, []);

  const openEditForm = (zone) => {
    setEditingZone(zone);
    setFormName(zone.nombre);
    setFormMultiplier(Number(zone.multiplicador));
  };

  const handleSaveZone = async (e) => {
    e.preventDefault();
    if (!formName) return;
    setSaving(true);
    try {
      const updated = await updateZonaConfig(editingZone.tipo, { nombre: formName, multiplicador: Number(formMultiplier) });
      setZones(zones.map(z => z.tipo === updated.tipo ? updated : z));
      setEditingZone(null);
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la zona');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-content-center p-8">
        <ProgressSpinner style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  return (
    <div className="grid m-0 h-full surface-ground border-round-3xl overflow-hidden shadow-4 border-1 border-200">

      {/* Panel Izquierdo: Visualizador */}
      <div className="col-12 xl:col-7 p-0 flex flex-column align-items-center justify-content-center relative overflow-hidden bg-gray-900" style={{ minHeight: '600px' }}>
         <div className="absolute top-0 left-0 p-5 z-2 w-full">
            <h2 className="text-white m-0 font-bold text-3xl opacity-90 drop-shadow-md">
              <i className="pi pi-map mr-3"></i>
              Plano del Estadio
            </h2>
            <p className="text-gray-300 m-0 mt-2">Zonas configuradas para todos los escenarios.</p>
         </div>

         <div className="flex-1 w-full flex align-items-center justify-content-center">
            <svg viewBox="0 0 800 600" className="w-full max-w-full h-auto drop-shadow-lg" style={{ maxHeight: '600px' }}>
               <g transform="translate(400, 300) scale(1.0, 0.95)">

                 <g className="pitch">
                   <rect x="-60" y="-85" width="120" height="170" fill="#22c55e" stroke="white" strokeWidth="2" rx="4" />
                   <line x1="-60" y1="0" x2="60" y2="0" stroke="white" strokeWidth="2" />
                   <circle cx="0" cy="0" r="15" fill="none" stroke="white" strokeWidth="2" />
                   <circle cx="0" cy="0" r="2" fill="white" />
                   <rect x="-25" y="-85" width="50" height="25" fill="none" stroke="white" strokeWidth="2" />
                   <rect x="-25" y="60" width="50" height="25" fill="none" stroke="white" strokeWidth="2" />
                   <path d="M -15 -60 A 15 15 0 0 0 15 -60" fill="none" stroke="white" strokeWidth="2" />
                   <path d="M -15 60 A 15 15 0 0 1 15 60" fill="none" stroke="white" strokeWidth="2" />
                 </g>

                 {zones.map(zone => {
                   const style = RING_STYLE[zone.tipo];
                   if (!style) return null;
                   const isEditing = editingZone?.tipo === zone.tipo;
                   const d = describeArc(0, 0, style.innerR, style.outerR, 0.5, 359.5);
                   return (
                     <path
                       key={zone.tipo}
                       d={d}
                       fill={style.color}
                       stroke="white"
                       strokeWidth={isEditing ? '3' : '1.5'}
                       className="cursor-pointer transition-all transition-duration-200 hover:opacity-100"
                       style={{ opacity: isEditing ? 1 : 0.8 }}
                       onClick={() => openEditForm(zone)}
                     >
                       <title>{zone.nombre}</title>
                     </path>
                   );
                 })}
               </g>
            </svg>
         </div>
      </div>

      {/* Panel Derecho: Lista / Edición */}
      <div className="col-12 xl:col-5 p-0 solid-bg-white shadow-2 z-2 flex flex-column h-full">
         <div className="p-5 border-bottom-1 surface-border surface-50">
            <h1 className="text-3xl font-bold text-color m-0">Infraestructura</h1>
            <p className="text-color-secondary mt-2 mb-0">Multiplicador de precio por tipo de localidad.</p>
         </div>

         {error && <div className="p-4"><Message severity="error" text={error} className="w-full" /></div>}

         <div className="flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-column gap-5">
            <ConsultaEstadio />

            {!editingZone && (
              <div className="flex flex-column gap-4 fadein">
                 {zones.map(zone => {
                   const style = RING_STYLE[zone.tipo];
                   return (
                     <div key={zone.tipo} className="surface-card border-round-2xl p-4 border-1 surface-border shadow-1 flex flex-column transition-all hover:shadow-3 group">
                       <div className="flex justify-content-between align-items-start mb-3">
                         <div className="flex align-items-center gap-3">
                            <div className="w-1rem h-2rem border-round-sm shadow-1" style={{ backgroundColor: style?.color }}></div>
                            <h3 className="font-bold text-xl text-color m-0">{zone.nombre}</h3>
                         </div>
                         <span className="text-xs px-2 py-1 border-round-xl font-bold text-white" style={{ backgroundColor: style?.color }}>
                           x{Number(zone.multiplicador).toFixed(2)}
                         </span>
                       </div>

                       <div className="flex gap-2">
                         <Button label="Editar Multiplicador" icon="pi pi-pencil" className="p-button-outlined p-button-primary p-button-sm flex-1 border-round-lg" onClick={() => openEditForm(zone)} />
                       </div>
                     </div>
                   );
                 })}
              </div>
            )}

            {editingZone && (
              <form onSubmit={handleSaveZone} className="flex flex-column gap-5 fadein">
                 <div className="flex align-items-center gap-3 border-bottom-1 surface-border pb-3">
                    <Button icon="pi pi-arrow-left" type="button" className="p-button-rounded p-button-text p-button-secondary" onClick={() => setEditingZone(null)} />
                    <h2 className="m-0 font-bold text-xl">Editar {editingZone.nombre}</h2>
                 </div>

                 <div className="flex flex-column gap-2">
                   <label className="font-medium text-color-secondary">Nombre de la Localidad</label>
                   <InputText value={formName} onChange={e => setFormName(e.target.value)} required placeholder="Ej. Tribuna Vip" className="w-full p-inputtext-lg border-round-xl" />
                 </div>

                 <div className="flex flex-column gap-2">
                   <label className="font-medium text-color-secondary">Multiplicador de Precio</label>
                   <div className="flex align-items-center gap-4 p-4 border-round-xl border-1 surface-border" style={{ backgroundColor: 'var(--surface-ground)' }}>
                     <Slider value={formMultiplier} onChange={(e) => setFormMultiplier(e.value)} min={0.5} max={5.0} step={0.1} className="flex-1" />
                     <span className="font-bold text-primary bg-primary-reverse px-3 py-2 border-round-lg text-lg">
                       x{formMultiplier.toFixed(1)}
                     </span>
                   </div>
                 </div>

                 <Button type="submit" label={saving ? 'Guardando...' : 'Guardar Cambios'} icon="pi pi-save" className="w-full p-button-lg shadow-3 mt-2 border-round-xl" disabled={saving} />
              </form>
            )}
         </div>
      </div>
    </div>
  );
}
