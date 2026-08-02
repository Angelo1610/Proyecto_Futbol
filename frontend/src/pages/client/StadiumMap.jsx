import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getEventoDetalle } from '../../api/eventos';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import SeatGrid from '../../components/client/SeatGrid';

import { usePurchase } from '../../context/PurchaseContext';

// Geometría del estadio: grilla de bloques individuales (como butacas reales) en coordenadas
// polares elípticas, agrupados por zona real del backend (palcos/tribuna arriba, general a los
// lados, preferencia abajo), todo inscrito en un óvalo exterior alrededor de la pista central.
function ellipsePoint(rx, ry, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: rx * Math.cos(rad), y: ry * Math.sin(rad) };
}

// Bloque anular entre dos radios (elípticos) y dos ángulos, al estilo de un sector de dona
function sectorPath(rxOuter, ryOuter, rxInner, ryInner, angleA, angleB) {
  const outerA = ellipsePoint(rxOuter, ryOuter, angleA);
  const outerB = ellipsePoint(rxOuter, ryOuter, angleB);
  const innerB = ellipsePoint(rxInner, ryInner, angleB);
  const innerA = ellipsePoint(rxInner, ryInner, angleA);
  const largeArc = angleA - angleB <= 180 ? 0 : 1;
  return `M ${outerA.x} ${outerA.y} A ${rxOuter} ${ryOuter} 0 ${largeArc} 0 ${outerB.x} ${outerB.y} L ${innerB.x} ${innerB.y} A ${rxInner} ${ryInner} 0 ${largeArc} 1 ${innerA.x} ${innerA.y} Z`;
}

const RX0 = 175, RY0 = 125; // radio interior (borde junto a la pista)
const OX = 340, OY = 250;   // radio exterior del estadio

function rxAt(f) { return RX0 + f * (OX - RX0); }
function ryAt(f) { return RY0 + f * (OY - RY0); }

// [anguloMayor, anguloMenor], rango de f (0=interior,1=exterior) y densidad de la grilla por zona.
// Una zona puede tener varias "piezas" (general = izquierda y derecha) que comparten color/click.
const ZONE_GRID = {
  tribunas: [{ angle: [55, -55], f: [0, 0.35], rows: 1, cols: 7 }],
  palcos: [{ angle: [55, -55], f: [0.35, 1], rows: 2, cols: 7 }],
  preferencia: [{ angle: [235, 125], f: [0, 1], rows: 3, cols: 9 }],
  general: [
    { angle: [-55, -125], f: [0, 1], rows: 4, cols: 5 },
    { angle: [125, 55], f: [0, 1], rows: 4, cols: 5 }
  ]
};

// Genera las "d" de cada bloque individual (sub-sección visual, sin nombre) de una pieza de zona
function buildBlocks({ angle: [aEnd, aStart], f: [f0, f1], rows, cols }) {
  const totalAngle = aEnd - aStart;
  const totalF = f1 - f0;
  const angGap = (totalAngle / cols) * 0.10;
  const fGap = (totalF / rows) * 0.12;
  const blocks = [];
  for (let r = 0; r < rows; r++) {
    const fInner = f0 + (r / rows) * totalF + fGap;
    const fOuter = f0 + ((r + 1) / rows) * totalF - fGap;
    for (let c = 0; c < cols; c++) {
      const aInner = aStart + (c / cols) * totalAngle + angGap;
      const aOuter = aStart + ((c + 1) / cols) * totalAngle - angGap;
      blocks.push(sectorPath(rxAt(fOuter), ryAt(fOuter), rxAt(fInner), ryAt(fInner), aOuter, aInner));
    }
  }
  return blocks;
}

const RINGS = [
  { tipo: 'palcos', color: 'var(--purple-500, #a855f7)' },
  { tipo: 'preferencia', color: 'var(--orange-500, #f97316)' },
  { tipo: 'tribunas', color: 'var(--teal-500, #14b8a6)' },
  { tipo: 'general', color: 'var(--indigo-500, #6366f1)' }
];

export default function StadiumMap() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const {
    setSelectedMatch, selectedZone, setSelectedZone, setZoneAndResetSeats,
    selectedSeats, toggleSeat, showLimitModal, setShowLimitModal,
    showTimeoutModal, setShowTimeoutModal
  } = usePurchase();

  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);

  useEffect(() => {
    getEventoDetalle(id)
      .then((data) => {
        setEvento(data);
        setSelectedMatch({
          id: data.id,
          title: data.nombre,
          date: `${data.fecha}T${data.hora}`,
          stadium: data.escenario?.nombre,
          imageUrl: data.imagenUrl,
          priceBase: Number(data.precioBase),
        });
      })
      .catch((err) => setError(err.message || 'No se pudo cargar el evento'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleZoneClick = (seccion, color) => {
    setZoneAndResetSeats({
      id: seccion.id,
      name: seccion.nombre,
      multiplier: Number(seccion.multiplicador),
      color,
      fila: seccion.fila,
    });
  };

  const handleProceed = () => {
    if (selectedSeats.length > 0) {
      navigate('/checkout');
    }
  };

  useEffect(() => {
    if (selectedSeats.length === 0) {
      setShowSummaryDialog(false);
    }
  }, [selectedSeats]);

  if (loading) {
    return (
      <div className="flex justify-content-center p-8">
        <ProgressSpinner style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  if (error || !evento) return <div>{error || 'Partido no encontrado'}</div>;

  const match = {
    title: evento.nombre,
    date: `${evento.fecha}T${evento.hora}`,
    stadium: evento.escenario?.nombre,
    imageUrl: evento.imagenUrl,
    priceBase: Number(evento.precioBase),
  };
  const secciones = evento.escenario?.seccion ?? [];

  return (
    <div className="flex flex-column gap-4">
      <Button
        label="Volver al catálogo"
        icon="pi pi-arrow-left"
        className="p-button-text p-button-plain w-12rem"
        onClick={() => navigate('/')}
      />



      <AnimatePresence mode="wait">
        {!selectedZone ? (
          <motion.div
            key="stadium-macro"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="solid-bg-white border-round-3xl p-4 md:p-6 shadow-4 border-1 border-200 w-full"
          >
            <div className="flex-1 relative min-h-[600px] surface-ground border-round-2xl border-1 border-300 flex flex-column overflow-hidden shadow-inset-1">
                <div className="absolute top-0 left-0 w-full p-4 flex justify-content-between align-items-start z-2">
                  <div>
                    <h2 className="text-2xl font-bold text-color m-0">Mapa del Estadio</h2>
                    <p className="text-color-secondary mt-1">Haz clic en una zona para ver los asientos</p>
                  </div>
                </div>

                {/* SVG INTERACTIVO DEL ESTADIO */}
                <div className="flex-1 w-full flex align-items-center justify-content-center">
                  <svg viewBox="0 0 800 600" className="w-full max-w-full h-auto drop-shadow-lg" style={{ maxHeight: '600px' }}>
                    <g transform="translate(400, 300)">

                      {/* Contorno ovalado del estadio */}
                      <ellipse cx="0" cy="0" rx={OX} ry={OY} fill="none" stroke="var(--surface-300, #d1d5db)" strokeWidth="1.5" />

                      {/* Cancha Central */}
                      <g className="pitch" transform="scale(1.3) rotate(90)">
                        <rect x="-60" y="-85" width="120" height="170" fill="#22c55e" stroke="white" strokeWidth="2" rx="4" />
                        <line x1="-60" y1="0" x2="60" y2="0" stroke="white" strokeWidth="2" />
                        <circle cx="0" cy="0" r="15" fill="none" stroke="white" strokeWidth="2" />
                        <circle cx="0" cy="0" r="2" fill="white" />
                        <rect x="-25" y="-85" width="50" height="25" fill="none" stroke="white" strokeWidth="2" />
                        <rect x="-25" y="60" width="50" height="25" fill="none" stroke="white" strokeWidth="2" />
                        <path d="M -15 -60 A 15 15 0 0 0 15 -60" fill="none" stroke="white" strokeWidth="2" />
                        <path d="M -15 60 A 15 15 0 0 1 15 60" fill="none" stroke="white" strokeWidth="2" />
                      </g>

                      {/* Zonas reales del backend, cada una dibujada como una grilla de bloques (sub-secciones sin nombre) */}
                      {RINGS.map(ring => {
                        const seccion = secciones.find(s => s.tipo === ring.tipo);
                        if (!seccion) return null;
                        const isHovered = hoveredBlock === seccion.id;
                        const pieces = ZONE_GRID[ring.tipo];
                        const tooltip = `${seccion.nombre} - $${(match.priceBase * Number(seccion.multiplicador)).toFixed(2)}`;
                        return pieces.map((piece, pieceIdx) => (
                          <g
                            key={`${seccion.id}-${pieceIdx}`}
                            className="cursor-pointer transition-all transition-duration-200"
                            style={{
                              opacity: hoveredBlock ? (isHovered ? 1 : 0.55) : 0.95,
                              transform: isHovered ? 'scale(1.015)' : 'scale(1)',
                              transformOrigin: '0 0'
                            }}
                            onMouseEnter={() => setHoveredBlock(seccion.id)}
                            onMouseLeave={() => setHoveredBlock(null)}
                            onClick={() => handleZoneClick(seccion, ring.color)}
                          >
                            {buildBlocks(piece).map((d, blockIdx) => (
                              <path key={blockIdx} d={d} fill={ring.color} stroke="white" strokeWidth="2" strokeLinejoin="round">
                                <title>{tooltip}</title>
                              </path>
                            ))}
                          </g>
                        ));
                      })}
                    </g>
                  </svg>
                </div>

                {/* Leyenda Dinámica */}
                <div className="absolute bottom-0 left-0 w-full p-3 surface-50 border-top-1 surface-border">
                  <div className="flex flex-wrap justify-content-center gap-4">
                    {RINGS.map(ring => {
                      const seccion = secciones.find(s => s.tipo === ring.tipo);
                      if (!seccion) return null;
                      return (
                        <div key={ring.tipo} className="flex align-items-center gap-2">
                          <div className="w-1rem h-1rem border-circle shadow-1" style={{ backgroundColor: ring.color }}></div>
                          <span className="text-xs font-bold text-color-secondary uppercase">{seccion.nombre}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
          </motion.div>
        ) : (
          <motion.div
            key="stadium-micro"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="solid-bg-white border-round-3xl p-4 md:p-6 shadow-4 border-1 border-200 w-full relative min-h-[600px] flex flex-column"
          >
            {/* Lado Único: Seat Grid Completo */}
            <div className="flex-1 w-full h-full p-0 flex flex-column relative">
                <div className="flex justify-content-between align-items-center mb-4">
                  <Button
                    label="Mapa General"
                    icon="pi pi-arrow-left"
                    className="p-button-outlined p-button-secondary p-button-sm"
                    onClick={() => { setSelectedZone(null); setSelectedSeats([]); }}
                  />
                  <div className="px-3 py-2 surface-section border-round-lg border-1 surface-border flex align-items-center gap-2">
                    <div className="w-1rem h-1rem border-circle shadow-1" style={{ backgroundColor: selectedZone.color }}></div>
                    <span className="text-color-secondary text-sm">Bloque: </span>
                    <span className="font-bold text-color">{selectedZone.name}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <SeatGrid
                    seccion={{ nombre: selectedZone.name, fila: selectedZone.fila }}
                    selectedSeats={selectedSeats}
                    onToggleSeat={toggleSeat}
                    zoneColor={selectedZone.color}
                  />
                </div>
              </div>

            {/* Botón Flotante para ver el Resumen */}
            <AnimatePresence>
              {selectedSeats.length > 0 && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="fixed bottom-0 right-0 m-4 z-5 md:m-6"
                >
                  <Button
                    label={`Resumen de Compra (${selectedSeats.length})`}
                    icon="pi pi-shopping-cart"
                    className="p-button-rounded p-button-primary p-button-lg shadow-6"
                    onClick={() => setShowSummaryDialog(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup de Resumen de Compra */}
      <Dialog
        header="Resumen de Compra"
        visible={showSummaryDialog}
        onHide={() => setShowSummaryDialog(false)}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        style={{ width: '450px' }}
        contentClassName="p-0"
        className="overflow-hidden border-round-2xl"
      >
        <div className="w-full flex flex-column relative min-h-full">
            {/* Cabecera / Banner del Ticket */}
            <div className="h-8rem bg-cover bg-center relative" style={{ backgroundImage: `url(${match.imageUrl})` }}>
               <div className="absolute top-0 left-0 w-full h-full bg-black-alpha-50"></div>
               <div className="absolute bottom-0 left-0 w-full p-3 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-300">Detalle de Boletos</span>
                  <h3 className="text-lg font-bold m-0 mt-1 line-height-2">{match.title}</h3>
               </div>
            </div>

            {/* Info del Estadio */}
            <div className="p-3 bg-primary-reverse text-primary flex align-items-center gap-3 border-bottom-1 surface-border" style={{ borderBottomStyle: 'dashed' }}>
               <i className="pi pi-map-marker text-2xl"></i>
               <div className="flex flex-column">
                 <span className="font-bold text-sm">{match.stadium}</span>
                 <span className="text-xs mt-1 text-color-secondary">{new Date(match.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
               </div>
            </div>

            {/* Lista de Asientos */}
            <div className="flex-1 p-4 flex flex-column bg-white">
              <div className="flex justify-content-between align-items-center mb-4">
                 <span className="text-color-secondary font-bold text-xs uppercase tracking-wide">Tus Asientos</span>
                 <span className={`px-2 py-1 text-xs border-round-xl font-bold bg-primary text-primary-reverse`}>
                    {selectedSeats.length} / 6
                 </span>
              </div>

              <div className="flex flex-column gap-2 overflow-y-auto custom-scrollbar pr-2 max-h-15rem">
                {selectedSeats.map(seat => (
                  <div key={seat.id} className="flex justify-content-between align-items-center p-2 border-round-lg surface-50 border-1 border-300 transition-colors hover:surface-100">
                      <div className="flex align-items-center gap-3">
                        <div className="w-1rem h-2rem border-round-sm shadow-1" style={{ backgroundColor: selectedZone?.color }}></div>
                        <div className="flex flex-column gap-1">
                          <span className="text-xs font-bold text-color uppercase">{selectedZone?.name}</span>
                          <span className="text-xs text-color-secondary">Fila {seat.fila} • Asiento {seat.numero}</span>
                        </div>
                      </div>
                      <span className="font-bold text-color bg-white px-2 py-1 border-round border-1 border-200">
                        ${(match.priceBase * selectedZone?.multiplier).toFixed(2)}
                      </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total y Checkout */}
            <div className="p-4 surface-50 border-top-1 surface-border mt-auto" style={{ borderTopStyle: 'dashed' }}>
              <div className="flex justify-content-between align-items-center mb-4">
                <span className="text-color-secondary font-bold uppercase text-xs tracking-wide">Total a pagar</span>
                <span className="text-3xl font-bold text-color">
                  ${selectedZone ? (selectedSeats.length * match.priceBase * selectedZone.multiplier).toFixed(2) : "0.00"}
                </span>
              </div>
              <Button
                label="Completar Pago"
                icon="pi pi-check-circle"
                onClick={handleProceed}
                className="w-full p-button-lg p-button-primary shadow-3 border-round-xl"
              />
            </div>
        </div>
      </Dialog>

        <Dialog header="Aviso de selección" visible={showLimitModal} onHide={() => setShowLimitModal(false)} breakpoints={{'960px': '75vw', '640px': '90vw'}} style={{width: '50vw'}}>
            <p className="m-0">Ya alcanzaste el límite permitido de 6 asientos por transacción. Para continuar, quita un asiento seleccionado y vuelve a intentarlo.</p>
        </Dialog>

        <Dialog header="Tiempo agotado" visible={showTimeoutModal} onHide={() => { setShowTimeoutModal(false); navigate('/'); }} breakpoints={{'960px': '75vw', '640px': '90vw'}} style={{width: '50vw'}}>
            <p className="m-0">La reserva se canceló automáticamente porque el tiempo para completar la compra se terminó. Serás redirigido al catálogo.</p>
        </Dialog>

    </div>
  );
}
