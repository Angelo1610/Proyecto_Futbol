import React from 'react';
import { motion } from 'framer-motion';

// seccion: { id, nombre, fila: [{ id, nombre, asiento: [{ id, numero, estado }] }] }
export default function SeatGrid({ seccion, selectedSeats, onToggleSeat, zoneColor }) {
  const filas = [...(seccion?.fila ?? [])].sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 surface-card border-round-2xl shadow-3"
    >
      <div className="mb-5 flex flex-column md:flex-row justify-content-between align-items-start md:align-items-end gap-3">
        <div>
          <h3 className="text-xl font-bold text-color m-0">Selección de Asientos</h3>
          <p className="text-color-secondary text-sm mt-1 mb-0">Zona: {seccion?.nombre}</p>
        </div>
        <div className="flex gap-4 text-xs font-medium">
          <div className="flex align-items-center gap-2">
            <div className="w-1rem h-1rem border-round-top-lg border-round-bottom-sm border-bottom-2 surface-hover border-400 flex align-items-center justify-content-center">
            </div>
            Disponible
          </div>
          <div className="flex align-items-center gap-2">
            <div className="w-1rem h-1rem border-round-top-lg border-round-bottom-sm border-bottom-2 shadow-1 border-none" style={{ backgroundColor: zoneColor || 'var(--primary-color)' }}>
            </div>
            Seleccionado
          </div>
          <div className="flex align-items-center gap-2">
            <div className="w-1rem h-1rem border-round-top-lg border-round-bottom-sm border-bottom-2 surface-600 border-800 flex align-items-center justify-content-center">
            </div>
            Ocupado
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-4 custom-scrollbar flex justify-content-center">
        <div className="flex flex-column align-items-center min-w-max">
          <div className="w-full h-4rem border-round-top-2xl border-bottom-none border-3 mb-5 flex flex-column align-items-center justify-content-end relative overflow-hidden shadow-inset-2" style={{ backgroundColor: '#16a34a', borderColor: '#4ade80' }}>
            {/* Líneas de la cancha */}
            <div className="absolute top-0 w-8rem h-3rem border-3 border-top-none border-white-alpha-60"></div>
            <div className="absolute top-0 w-3rem h-1rem border-3 border-top-none border-white-alpha-60"></div>
            <div className="absolute bottom-0 w-full h-1 border-bottom-1 border-white-alpha-40"></div>
            <span className="text-white font-bold tracking-widest uppercase text-sm mb-2 z-1 drop-shadow-md">Cancha</span>
          </div>

          <div className="flex flex-column gap-2">
            {filas.map(fila => {
              const asientos = [...(fila.asiento ?? [])].sort((a, b) => Number(a.numero) - Number(b.numero));
              return (
                <div key={fila.id} className="flex align-items-center gap-2">
                  <span className="w-2rem text-center text-sm font-bold text-color-secondary">{fila.nombre}</span>
                  <div className="flex gap-2">
                    {asientos.map((asiento) => {
                      const occupied = asiento.estado !== 'disponible';
                      const selected = selectedSeats.some(s => s.id === asiento.id);

                      let btnClass = "w-2rem h-2rem md:w-3rem md:h-3rem border-round-top-xl border-round-bottom-sm border-bottom-3 text-xs font-semibold flex flex-column align-items-center justify-content-center transition-all cursor-pointer ";
                      let btnStyle = {};

                      if (occupied) {
                        btnClass += "surface-600 border-800 text-surface-200 cursor-not-allowed";
                      } else if (selected) {
                        btnClass += "text-white shadow-3 border-transparent";
                        btnStyle = { backgroundColor: zoneColor || 'var(--primary-color)' };
                      } else {
                        btnClass += "surface-card border-300 hover:surface-hover text-color";
                      }

                      return (
                        <button
                          key={asiento.id}
                          disabled={occupied}
                          onClick={() => onToggleSeat({ id: asiento.id, fila: fila.nombre, numero: asiento.numero })}
                          title={`Asiento ${fila.nombre}-${asiento.numero} - ${occupied ? 'Ocupado' : selected ? 'Seleccionado' : 'Disponible'}`}
                          className={btnClass}
                          style={btnStyle}
                        >
                          <span className="text-[10px] md:text-xs line-height-1 font-bold">{asiento.numero}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
