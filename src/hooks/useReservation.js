import { useState, useMemo, useEffect, useCallback } from 'react';
import { useReservationStore } from '../context/ReservationContext';
import { useAuth } from '../context/AuthContext';
import { mockTables } from '../data/tables';
import { formatDate } from '../data/reservations';

export const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => `${String(12 + i).padStart(2, '0')}:00`); // 12:00 - 22:00
const PHONE_RE = /^03\d{2}-\d{7}$/;
const ACTIVE = ['Pending', 'Confirmed'];

// All reservation business logic lives here. The screen only renders.
export default function useReservation() {
  const { user } = useAuth();
  const { reservations, addReservation, setReservationStatus } = useReservationStore();

  const [date, setDate] = useState(formatDate(new Date()));
  const [timeSlot, setTimeSlot] = useState(null);
  const [partySize, setPartySize] = useState(2);
  const [tableId, setTableId] = useState(null);
  const [contactName, setContactName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  // Tables with enough seats that are not booked at this date and time
  const tablesFor = useCallback(
    (time) =>
      mockTables.filter(
        (t) =>
          t.seats >= partySize &&
          !reservations.some((r) => r.tableId === t.id && r.date === date && r.time === time && ACTIVE.includes(r.status))
      ),
    [partySize, date, reservations]
  );

  const slots = useMemo(() => TIME_SLOTS.map((time) => ({ time, available: tablesFor(time).length > 0 })), [tablesFor]);
  const availableTables = useMemo(() => (timeSlot ? tablesFor(timeSlot) : []), [timeSlot, tablesFor]);

  // Drop the chosen slot if it became unavailable (party size or date changed)
  useEffect(() => {
    if (timeSlot && !slots.find((s) => s.time === timeSlot)?.available) setTimeSlot(null);
  }, [slots, timeSlot]);

  // Keep a valid table selected
  useEffect(() => {
    if (!availableTables.some((t) => t.id === tableId)) setTableId(availableTables[0]?.id ?? null);
  }, [availableTables, tableId]);

  const validate = () => {
    const e = {};
    const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(new Date(`${date}T00:00:00`).getTime());
    if (!dateOk) e.date = 'Use the format YYYY-MM-DD';
    else if (date < formatDate(new Date())) e.date = 'The date cannot be in the past';

    if (!timeSlot) e.timeSlot = 'Choose a time slot';
    else if (dateOk && new Date(`${date}T${timeSlot}:00`).getTime() < Date.now() + 60 * 60 * 1000) {
      e.timeSlot = 'Bookings must be made at least one hour ahead';
    }
    if (!Number.isInteger(partySize) || partySize < 1 || partySize > 12) e.partySize = 'Party size must be between 1 and 12';
    if (!tableId) e.tableId = 'No table is free for this slot';
    if (!contactName.trim()) e.contactName = 'Enter a contact name';
    if (!PHONE_RE.test(phone)) e.phone = 'Use the format 03XX-XXXXXXX';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const createReservation = () => {
    if (!validate()) return null;
    const table = mockTables.find((t) => t.id === tableId);
    const reservation = {
      id: 'RES-' + Date.now().toString().slice(-6),
      userId: user.id, customerName: contactName.trim(), phone, date, time: timeSlot,
      partySize, tableId, tableName: table.name, status: 'Pending',
    };
    addReservation(reservation);
    setTimeSlot(null);
    setPhone('');
    setErrors({});
    return reservation;
  };

  const cancelReservation = (id) => setReservationStatus(id, 'Cancelled');
  const myReservations = useMemo(() => reservations.filter((r) => r.userId === user?.id), [reservations, user]);
  const selectedTable = mockTables.find((t) => t.id === tableId);

  return {
    date, setDate, timeSlot, setTimeSlot, partySize, setPartySize, tableId, setTableId,
    contactName, setContactName, phone, setPhone, errors, slots, availableTables, selectedTable,
    validate, createReservation, cancelReservation, myReservations,
  };
}
