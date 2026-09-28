export const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const today = formatDate(new Date());

// Starting bookings. Table 6 (8 seats) is taken at 20:00 today, so a party of 8 sees that slot disabled.
export const mockReservations = [
  { id: 'RES-1001', userId: 'u1', customerName: 'Ali Khan', phone: '0300-1234567', date: today, time: '20:00', partySize: 8, tableId: 'T6', tableName: 'Table 6', status: 'Confirmed' },
  { id: 'RES-1002', userId: 'u1', customerName: 'Ali Khan', phone: '0300-1234567', date: today, time: '19:00', partySize: 4, tableId: 'T3', tableName: 'Table 3', status: 'Confirmed' },
];
