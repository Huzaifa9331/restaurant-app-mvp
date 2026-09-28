import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { mockReservations } from '../data/reservations';
import useStorageSync from '../hooks/useStorageSync';

const ReservationContext = createContext(null);

export function ReservationProvider({ children }) {
  const [reservations, setReservations] = useState(mockReservations);
  const isLoaded = useStorageSync('restaurant_reservations', reservations, setReservations);

  const addReservation = useCallback((r) => setReservations((prev) => [r, ...prev]), []);
  const setReservationStatus = useCallback(
    (id, status) => setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r))), []);

  const value = useMemo(
    () => ({ reservations, isLoaded, addReservation, setReservationStatus }),
    [reservations, isLoaded, addReservation, setReservationStatus]
  );
  return <ReservationContext.Provider value={value}>{children}</ReservationContext.Provider>;
}

export function useReservationStore() {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error('useReservationStore must be used inside a <ReservationProvider>.');
  return ctx;
}
