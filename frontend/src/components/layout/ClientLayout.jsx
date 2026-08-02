import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { usePurchase } from '../../context/PurchaseContext';

export default function ClientLayout() {
  const { timerActive, timerSeconds, selectedSeats, selectedZone, selectedMatch } = usePurchase();
  const mm = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const ss = String(timerSeconds % 60).padStart(2, '0');

  return (
    <div className="min-h-screen flex flex-column surface-ground">
      <Navbar />
      {timerActive && (
        <div className="fixed top-0 right-0 mr-5 z-5 solid-bg-white border-round-2xl shadow-6 border-1 surface-border p-3 flex flex-column gap-2" style={{ width: '250px', marginTop: '5.5rem' }}>
          <div className="flex align-items-center justify-content-between">
            <div className="flex align-items-center gap-2 text-primary font-bold">
              <i className="pi pi-clock text-xl"></i>
              <span>Tiempo Restante</span>
            </div>
            <div className="px-2 py-1 border-round bg-primary-reverse text-primary font-bold border-1 border-primary text-xl">
              {mm}:{ss}
            </div>
          </div>
          <div className="text-xs text-color-secondary mt-1 border-top-1 surface-border pt-2">
            {selectedMatch && <div className="font-medium text-color truncate">{selectedMatch.title}</div>}
            {selectedZone && <div>{selectedZone.name} • {selectedSeats.length} asiento(s)</div>}
          </div>
        </div>
      )}
      <main className="flex-1 w-full mx-auto p-4 max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}
