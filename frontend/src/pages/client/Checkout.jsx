import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PurchaseProgress from '../../components/client/PurchaseProgress';
import { usePurchase } from '../../context/PurchaseContext';
import { useAuth } from '../../context/AuthContext';
import { crearReserva, pagarReserva, mapTicket } from '../../api/reservas';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { selectedMatch, selectedZone, selectedSeats, confirmPurchase } = usePurchase();

  const match = state?.match ?? selectedMatch;
  const zone = state?.zone ?? selectedZone;
  const seats = state?.seats ?? selectedSeats;

  if (!match || !zone || !seats || seats.length === 0) {
    return (
      <div className="text-center py-8 text-color-secondary">
        <p>No hay información de reserva.</p>
        <Button label="Volver al catálogo" link onClick={() => navigate('/')} />
      </div>
    );
  }

  const unitPrice = match.priceBase * zone.multiplier;
  const subtotal = unitPrice * seats.length;
  const taxes = subtotal * 0.15; // 15% iva simulado
  const total = subtotal + taxes;

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      const reserva = await crearReserva({
        usuarioId: user.id,
        eventoId: match.id,
        asientoIds: seats.map(s => s.id),
      });
      const { tickets } = await pagarReserva(reserva.id);
      confirmPurchase({ match, zone, seats, total });
      navigate('/tickets', { state: { success: true, tickets: tickets.map(mapTicket) } });
    } catch (err) {
      setError(err.message || 'No se pudo completar la compra. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-column gap-5 py-5">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold text-color m-0">Finaliza tu Compra</h1>
        <p className="text-color-secondary mt-2">Completa el pago para asegurar tus asientos de inmediato.</p>
      </div>

      <div className="grid">
        {/* Columna Izquierda: Tarjeta de Pago */}
        <div className="col-12 lg:col-7 flex flex-column gap-4">
          <div className="solid-bg-white p-5 border-round-3xl shadow-4 border-1 border-200">
            <h2 className="text-2xl font-bold text-color mt-0 mb-4 flex align-items-center gap-3">
              <i className="pi pi-credit-card text-primary text-2xl"></i> 
              Método de Pago
            </h2>
            
            <div className="surface-ground border-2 border-primary border-round-2xl p-4 flex align-items-center justify-content-between cursor-pointer mb-4">
              <div className="flex align-items-center gap-4">
                <div className="bg-white shadow-1 text-primary p-3 border-round-xl">
                  <i className="pi pi-credit-card text-3xl"></i>
                </div>
                <div>
                  <p className="font-bold text-color text-lg m-0 mb-1">Tarjeta de Crédito / Débito</p>
                  <p className="text-sm text-color-secondary m-0">Pago seguro procesado por pasarela</p>
                </div>
              </div>
              <div className="w-1.5rem h-1.5rem border-circle bg-primary flex align-items-center justify-content-center shadow-2">
                <div className="w-0.5rem h-0.5rem bg-white border-circle"></div>
              </div>
            </div>

            {/* Simulación de formulario de tarjeta */}
            <div className="grid formgrid p-fluid mt-4">
               <div className="field col-12">
                  <label className="font-bold text-sm text-color-secondary uppercase">Número de Tarjeta</label>
                  <div className="p-inputgroup">
                     <span className="p-inputgroup-addon bg-white"><i className="pi pi-credit-card text-color-secondary"></i></span>
                     <InputText placeholder="**** **** **** 1234" disabled className="bg-white font-mono text-lg" />
                  </div>
               </div>
               <div className="field col-12 md:col-6">
                  <label className="font-bold text-sm text-color-secondary uppercase">Expiración</label>
                  <InputText placeholder="MM/YY" disabled className="bg-white font-mono text-lg" />
               </div>
               <div className="field col-12 md:col-6">
                  <label className="font-bold text-sm text-color-secondary uppercase">CVC</label>
                  <InputText placeholder="***" disabled className="bg-white font-mono text-lg" />
               </div>
               <div className="field col-12">
                  <label className="font-bold text-sm text-color-secondary uppercase">Nombre del Titular</label>
                  <InputText placeholder="Juan Pérez" disabled className="bg-white text-lg" />
               </div>
            </div>

            <div className="mt-5 flex align-items-center gap-3 text-sm text-color-secondary bg-green-50 p-3 border-round-xl border-1 border-green-200">
              <i className="pi pi-shield text-green-500 text-2xl"></i>
              <span>Tus datos están protegidos. Esta es una transacción de demostración simulada de forma segura.</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Resumen Estilo Ticket */}
        <div className="col-12 lg:col-5">
          <div className="solid-bg-white border-round-3xl shadow-4 overflow-hidden flex flex-column relative border-1 border-200 sticky top-5">
            {/* Header / Banner del Ticket */}
            <div className="h-6rem bg-cover bg-center relative" style={{ backgroundImage: `url(${match.imageUrl})` }}>
               <div className="absolute top-0 left-0 w-full h-full bg-black-alpha-50"></div>
               <div className="absolute bottom-0 left-0 w-full p-3 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-300">Orden de Compra</span>
                  <h3 className="text-lg font-bold m-0 mt-1 line-height-2">{match.title}</h3>
               </div>
            </div>

            <div className="p-3 bg-primary-reverse text-primary flex align-items-center gap-3 border-bottom-1 surface-border" style={{ borderBottomStyle: 'dashed' }}>
               <i className="pi pi-map-marker text-xl"></i>
               <div className="flex flex-column">
                 <span className="font-bold text-sm">{match.stadium}</span>
                 <span className="text-xs mt-1 text-color-secondary">{new Date(match.date).toLocaleString('es-EC')}</span>
               </div>
            </div>

            <div className="p-4 flex flex-column bg-white">
              <span className="text-color-secondary font-bold text-xs uppercase tracking-wide mb-3">Tus Asientos ({seats.length})</span>
              <div className="flex flex-column gap-2 overflow-y-auto custom-scrollbar max-h-15rem pr-2">
                {seats.map(seat => (
                  <div key={seat.id} className="flex justify-content-between align-items-center p-2 border-round-lg surface-50 border-1 border-300">
                      <div className="flex align-items-center gap-3">
                        <div className="w-2.5rem h-2.5rem border-circle surface-200 flex align-items-center justify-content-center font-bold text-color">
                           {seat.numero}
                        </div>
                        <div className="flex flex-column gap-1">
                          <span className="text-xs font-bold text-color uppercase">{zone.name}</span>
                          <span className="text-xs text-color-secondary">Fila {seat.fila}</span>
                        </div>
                      </div>
                      <span className="font-bold text-color">
                        ${unitPrice.toFixed(2)}
                      </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 surface-50 border-top-1 surface-border" style={{ borderTopStyle: 'dashed' }}>
              {error && <Message severity="error" text={error} className="w-full mb-3" />}
              <div className="flex flex-column gap-2 text-sm mb-4">
                <div className="flex justify-content-between text-color-secondary font-medium">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-content-between text-color-secondary font-medium">
                  <span>Cargos e Impuestos (15%)</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-content-between align-items-center pt-3 border-top-1 border-300 mb-4">
                <span className="text-color-secondary font-bold uppercase text-xs tracking-wide">Total a Pagar</span>
                <span className="text-4xl font-bold text-primary">${total.toFixed(2)}</span>
              </div>

              <Button 
                label={loading ? "Procesando..." : "Confirmar y Pagar"}
                icon={loading ? "pi pi-spin pi-spinner" : "pi pi-lock"}
                onClick={handleConfirm}
                disabled={loading}
                className="w-full p-button-lg p-button-primary shadow-3 border-round-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
