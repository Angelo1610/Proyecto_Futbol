import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const PurchaseContext = createContext(null);

export const usePurchase = () => useContext(PurchaseContext);

export function PurchaseProvider({ children }) {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  const [lastPurchase, setLastPurchase] = useState(null);

  // Toggle seat selection and enforce a 6-seat limit
  // seat is a real backend seat object: { id (asientoId uuid), fila, numero }
  const toggleSeat = (seat) => {
    setSelectedSeats(prev => {
      if (prev.some(s => s.id === seat.id)) return prev.filter(s => s.id !== seat.id);
      if (prev.length >= 6) {
        setShowLimitModal(true);
        return prev;
      }
      const next = [...prev, seat];
      // start timer when first seat is selected
      if (next.length === 1) startTimer();
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedSeats([]);
    setSelectedZone(null);
    setSelectedMatch(null);
    stopTimer();
    setTimerSeconds(300);
  };

  const setZoneAndResetSeats = (zone) => {
    setSelectedZone(zone);
    setSelectedSeats([]);
    stopTimer();
    setTimerSeconds(300);
  };

  const startTimer = (seconds = 300) => {
    setTimerSeconds(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      setTimerSeconds(s => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setTimerActive(false);
          // expire: clear selection and show timeout modal
          setSelectedSeats([]);
          setSelectedZone(null);
          setSelectedMatch(null);
          setShowTimeoutModal(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerActive(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const confirmPurchase = (purchaseData) => {
    // store last purchase for Tickets page
    setLastPurchase(purchaseData);
    // stop timer and clear current selection
    stopTimer();
    setTimerSeconds(300);
    setSelectedSeats([]);
    setSelectedZone(null);
    setSelectedMatch(null);
    setShowTimeoutModal(false);
    setShowLimitModal(false);
  };

  return (
    <PurchaseContext.Provider value={{
      selectedMatch,
      setSelectedMatch,
      selectedZone,
      setSelectedZone,
      setZoneAndResetSeats,
      selectedSeats,
      setSelectedSeats,
      toggleSeat,
      clearSelection,
      showLimitModal,
      setShowLimitModal,
      showTimeoutModal,
      setShowTimeoutModal,
      timerSeconds,
      timerActive,
      startTimer,
      stopTimer,
      confirmPurchase,
      lastPurchase
    }}>
      {children}
    </PurchaseContext.Provider>
  );
}

export default PurchaseContext;
