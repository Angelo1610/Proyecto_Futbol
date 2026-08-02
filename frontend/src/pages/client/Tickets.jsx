import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getTicketsPorUsuario, abrirReporteMisReservas } from '../../api/reservas';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useEffect, useRef } from 'react';

const buildQrUrl = (payload, size = 300) => {
  const data = encodeURIComponent(payload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}`;
};

export default function Tickets() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [fetchedTickets, setFetchedTickets] = useState([]);
  const [loading, setLoading] = useState(!state?.success);
  const [error, setError] = useState('');
  const [generandoReporte, setGenerandoReporte] = useState(false);
  const toast = useRef(null);

  const handleReportePdf = async () => {
    if (!user) return;
    setGenerandoReporte(true);
    try {
      await abrirReporteMisReservas(user.id);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'No se pudo generar el reporte',
        detail: err.message,
      });
    } finally {
      setGenerandoReporte(false);
    }
  };

  const isRecentPurchase = Boolean(state?.success);

  useEffect(() => {
    if (isRecentPurchase || !user) {
      setLoading(false);
      return;
    }
    getTicketsPorUsuario(user.id)
      .then(setFetchedTickets)
      .catch((err) => setError(err.message || 'No se pudieron cargar tus boletos'))
      .finally(() => setLoading(false));
  }, [isRecentPurchase, user]);

  let baseTickets = isRecentPurchase ? state.tickets : fetchedTickets;

  if (!isRecentPurchase && searchTerm) {
    baseTickets = baseTickets.filter(t =>
      t.matchTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const groupedTickets = useMemo(() => {
    const sorted = [...baseTickets].sort((a, b) => new Date(a.date) - new Date(b.date));
    const groups = {};
    sorted.forEach(ticket => {
      const dateObj = new Date(ticket.date);
      dateObj.setHours(0,0,0,0);
      const dateKey = dateObj.toISOString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateLabel: dateObj.toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          dateVal: dateObj,
          tickets: []
        };
      }
      groups[dateKey].tickets.push(ticket);
    });

    return Object.values(groups);
  }, [baseTickets]);

  useEffect(() => {
    if (isRecentPurchase && toast.current) {
      toast.current.show({
        severity: 'success',
        summary: '¡Reserva Confirmada!',
        detail: 'Tus entradas han sido generadas exitosamente.',
        life: 5000
      });
    }
  }, [isRecentPurchase]);

  return (
    <div className="max-w-6xl mx-auto flex flex-column gap-5 py-4">
      <Toast ref={toast} position="top-right" />
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-4 py-4 border-bottom-1 surface-border">
        <div>
          <h1 className="text-4xl font-bold text-color m-0">Mis Boletos</h1>
          <p className="text-color-secondary mt-2 m-0">Historial de tus reservas y entradas electrónicas listas para usar.</p>
        </div>
        
        <div className="flex align-items-center gap-3 w-full md:w-auto">
          <span className="p-input-icon-left w-full md:w-20rem">
            <i className="pi pi-search ml-2" />
            <InputText
              placeholder="Buscar por equipo o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-inputtext-lg border-round-xl"
              style={{ paddingLeft: '3rem' }}
            />
          </span>
          <Button
            icon="pi pi-file-pdf"
            label="Reporte PDF"
            className="p-button-danger border-round-xl"
            loading={generandoReporte}
            onClick={handleReportePdf}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-content-center py-8">
          <ProgressSpinner style={{ width: '3rem', height: '3rem' }} />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : groupedTickets.length === 0 ? (
        <div className="text-center py-8 text-color-secondary">
          <p>No se encontraron tickets.</p>
          <Button label="Explorar Eventos" link onClick={() => navigate('/')} />
        </div>
      ) : (
        <div className="flex flex-column gap-6 pb-6">
          {groupedTickets.map((group) => (
            <div key={group.dateLabel} className="flex flex-column gap-4">
              
              <div className="flex align-items-center gap-3">
                <div className="surface-card border-1 surface-border px-3 py-2 border-round-xl flex align-items-center gap-2 shadow-1">
                  <i className="pi pi-calendar text-primary"></i>
                  <span className="font-bold text-color capitalize">{group.dateLabel}</span>
                </div>
                <div className="h-1rem border-bottom-1 surface-border flex-1"></div>
              </div>

              <div className="flex flex-column gap-4">
                <AnimatePresence>
                  {group.tickets.map((ticket, index) => (
                    <motion.div 
                      key={ticket.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex flex-column md:flex-row solid-bg-white border-round-3xl shadow-3 overflow-hidden border-1 border-200 cursor-pointer hover:shadow-6 transition-all relative group">
                        {/* Acento lateral */}
                        <div className="w-1rem bg-primary hidden md:block"></div>

                        {/* Info Principal */}
                        <div className="flex-1 p-4 md:p-5 flex flex-column justify-content-between">
                            <div className="flex justify-content-between align-items-start mb-4">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Entrada Confirmada</span>
                                <h3 className="text-2xl font-bold text-color m-0">{ticket.matchTitle}</h3>
                              </div>
                              <div className="surface-100 text-color-secondary font-mono text-xs px-2 py-1 border-round-lg border-1 surface-border">
                                #{ticket.id}
                              </div>
                            </div>

                            <div className="flex flex-column md:flex-row align-items-start md:align-items-center gap-4 text-sm text-color-secondary mb-4">
                              <div className="flex align-items-center gap-2">
                                  <i className="pi pi-calendar text-primary"></i>
                                  {new Date(ticket.date).toLocaleString('es-EC', { dateStyle: 'long', timeStyle: 'short' })}
                              </div>
                              <div className="flex align-items-center gap-2">
                                  <i className="pi pi-map-marker text-primary"></i>
                                  {ticket.stadium}
                              </div>
                            </div>

                            <div className="flex gap-5 mt-auto">
                              <div className="flex flex-column">
                                <span className="text-xs text-color-secondary uppercase tracking-wide">Localidad</span>
                                <span className="font-bold text-xl text-color">{ticket.zone}</span>
                              </div>
                              <div className="flex flex-column border-left-1 border-300 pl-5">
                                <span className="text-xs text-color-secondary uppercase tracking-wide">Asiento</span>
                                <span className="font-bold text-xl text-color">{ticket.seat}</span>
                              </div>
                            </div>
                        </div>

                        {/* Separador Perforado */}
                        <div className="hidden md:flex flex-column justify-content-center align-items-center relative px-3">
                            <div className="absolute top-0 w-2rem h-1rem surface-ground border-round-bottom-xl border-x-1 border-b-1 border-200" style={{ marginTop: '-1px' }}></div>
                            <div className="h-full border-left-2 border-dashed border-300"></div>
                            <div className="absolute bottom-0 w-2rem h-1rem surface-ground border-round-top-xl border-x-1 border-t-1 border-200" style={{ marginBottom: '-1px' }}></div>
                        </div>

                        {/* QR / Descarga */}
                        <div className="w-full md:w-16rem surface-50 p-4 md:p-5 flex flex-row md:flex-column align-items-center justify-content-center gap-4 border-top-1 md:border-top-none border-dashed border-300">
                            <div className="bg-white p-2 border-round-2xl shadow-2 hidden md:block">
                              <img src={buildQrUrl(JSON.stringify(ticket), 150)} alt="QR" className="w-7rem h-7rem object-cover" />
                            </div>
                            <div className="flex-1 flex flex-column align-items-center w-full">
                              <span className="font-bold text-2xl text-color mb-2 hidden md:block">${ticket.price.toFixed(2)}</span>
                              <Button 
                                icon="pi pi-download" 
                                label="Descargar QR" 
                                className="p-button-outlined p-button-secondary p-button-sm w-full border-round-xl"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // lógica de descarga real si aplicara
                                }} 
                              />
                            </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isRecentPurchase && (
        <div className="text-center pb-6">
          <Button label="Volver al Inicio" link onClick={() => navigate('/')} />
        </div>
      )}

      <Dialog 
        visible={!!selectedTicket} 
        onHide={() => setSelectedTicket(null)} 
        showHeader={false}
        contentClassName="p-0"
        className="border-round-3xl overflow-hidden shadow-6 m-0"
        maskClassName="bg-black-alpha-60"
        style={{ width: 'auto' }}
      >
        {selectedTicket && (
          <div className="solid-bg-white p-5 flex flex-column align-items-center justify-content-center relative fadeinup animation-duration-300" style={{ minWidth: '320px' }}>
             
             <Button 
                icon="pi pi-times" 
                className="p-button-rounded p-button-text p-button-secondary absolute z-5" 
                style={{ top: '0.5rem', right: '0.5rem' }}
                onClick={() => setSelectedTicket(null)}
             />

             <h3 className="text-color font-bold m-0 mb-4 uppercase tracking-widest text-xs">Escanea tu Acceso</h3>
             
             <div className="w-18rem h-18rem border-round-xl overflow-hidden p-2 border-2 surface-border bg-white shadow-1">
               <img src={buildQrUrl(JSON.stringify(selectedTicket), 400)} alt="QR" className="w-full h-full object-cover" />
             </div>
             
             <span className="font-mono text-xs text-color-secondary mt-4 font-bold surface-100 px-3 py-2 border-round-lg border-1 surface-border">
               TICKET ID: {selectedTicket.id}
             </span>
          </div>
        )}
      </Dialog>
    </div>
  );
}
