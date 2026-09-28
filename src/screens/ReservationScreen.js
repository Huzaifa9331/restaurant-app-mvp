// Q9: reservation UI only. All logic lives in useReservation.
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useReservation from '../hooks/useReservation';
import { formatDate } from '../data/reservations';

const nextDays = () => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return formatDate(d); });

export default function ReservationScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const r = useReservation();
  const [showConfirm, setShowConfirm] = useState(false);
  const days = useMemo(nextDays, []);

  const openConfirm = () => { if (r.validate()) setShowConfirm(true); };
  const confirmBooking = () => {
    const made = r.createReservation();
    setShowConfirm(false);
    if (made) Alert.alert('Request sent', `${made.tableName} at ${made.time} on ${made.date}. The manager will confirm it.`);
  };
  const askCancel = (id) => Alert.alert('Cancel reservation?', 'This cannot be undone.', [
    { text: 'Keep it', style: 'cancel' },
    { text: 'Cancel booking', style: 'destructive', onPress: () => r.cancelReservation(id) },
  ]);

  const chip = (label, active, onPress, disabled, key) => (
    <TouchableOpacity key={key ?? label} disabled={disabled} onPress={onPress}
      style={[styles.chip, active && styles.chipActive, disabled && styles.chipDisabled]}>
      <Text style={[styles.chipText, active && styles.chipTextActive, disabled && styles.chipTextDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
  const err = (k) => (r.errors[k] ? <Text style={styles.error}>{r.errors[k]}</Text> : null);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.heading}>Date</Text>
        <View style={styles.wrap}>{days.map((d) => chip(d.slice(5), r.date === d, () => r.setDate(d), false, d))}</View>
        <TextInput style={styles.input} value={r.date} onChangeText={r.setDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.subtext} />
        {err('date')}

        <Text style={styles.heading}>Party size</Text>
        <View style={styles.stepper}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => r.setPartySize(Math.max(1, r.partySize - 1))}><Text style={styles.stepText}>−</Text></TouchableOpacity>
          <Text style={styles.qty}>{r.partySize}</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={() => r.setPartySize(Math.min(12, r.partySize + 1))}><Text style={styles.stepText}>+</Text></TouchableOpacity>
        </View>
        {err('partySize')}

        <Text style={styles.heading}>Time slot</Text>
        <View style={styles.wrap}>{r.slots.map((s) => chip(s.time, r.timeSlot === s.time, () => r.setTimeSlot(s.time), !s.available))}</View>
        <Text style={styles.hint}>Greyed-out slots have no free table for {r.partySize} {r.partySize === 1 ? 'guest' : 'guests'}.</Text>
        {err('timeSlot')}

        {r.timeSlot && (
          <>
            <Text style={styles.heading}>Table</Text>
            <View style={styles.wrap}>
              {r.availableTables.map((t) => chip(`${t.name} (${t.seats}) · ${t.location}`, r.tableId === t.id, () => r.setTableId(t.id), false, t.id))}
            </View>
            {err('tableId')}
          </>
        )}

        <Text style={styles.heading}>Contact</Text>
        <TextInput style={styles.input} value={r.contactName} onChangeText={r.setContactName} placeholder="Name" placeholderTextColor={colors.subtext} />
        {err('contactName')}
        <TextInput style={styles.input} value={r.phone} onChangeText={r.setPhone} placeholder="03XX-XXXXXXX" keyboardType="phone-pad" placeholderTextColor={colors.subtext} />
        {err('phone')}

        <TouchableOpacity style={styles.primary} onPress={openConfirm}><Text style={styles.primaryText}>Review booking</Text></TouchableOpacity>
      </View>

      <Text style={styles.section}>My reservations</Text>
      {r.myReservations.length === 0 && <Text style={styles.hint}>You have no reservations yet.</Text>}
      {r.myReservations.map((b) => (
        <View key={b.id} style={styles.card}>
          <View style={styles.head}>
            <Text style={styles.name}>{b.tableName} · {b.time}</Text>
            <Text style={[styles.status, (b.status === 'Cancelled' || b.status === 'Declined') && { color: colors.danger }]}>{b.status}</Text>
          </View>
          <Text style={styles.hint}>{b.date} · {b.partySize} guests · {b.phone}</Text>
          {(b.status === 'Pending' || b.status === 'Confirmed') && (
            <TouchableOpacity onPress={() => askCancel(b.id)}><Text style={styles.cancel}>Cancel booking</Text></TouchableOpacity>
          )}
        </View>
      ))}

      <Modal transparent animationType="fade" visible={showConfirm} onRequestClose={() => setShowConfirm(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.heading}>Confirm your booking</Text>
            <Text style={styles.line}>Date: {r.date}</Text>
            <Text style={styles.line}>Time: {r.timeSlot}</Text>
            <Text style={styles.line}>Guests: {r.partySize}</Text>
            <Text style={styles.line}>Table: {r.selectedTable?.name} ({r.selectedTable?.location})</Text>
            <Text style={styles.line}>Contact: {r.contactName}, {r.phone}</Text>
            <View style={[styles.wrap, { marginTop: 14 }]}>
              <TouchableOpacity style={[styles.primary, { flex: 1, marginTop: 0 }]} onPress={confirmBooking}><Text style={styles.primaryText}>Confirm</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.secondary, { flex: 1 }]} onPress={() => setShowConfirm(false)}><Text style={styles.secondaryText}>Edit</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  card: { backgroundColor: c.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: c.border },
  heading: { fontSize: 15, fontWeight: '700', color: c.text, marginTop: 12, marginBottom: 6 },
  section: { fontSize: 18, fontWeight: '700', color: c.text, marginVertical: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1, borderColor: c.border, backgroundColor: c.bg },
  chipActive: { backgroundColor: c.primary, borderColor: c.primary },
  chipDisabled: { backgroundColor: c.chip, opacity: 0.45 },
  chipText: { color: c.text, fontWeight: '600' },
  chipTextActive: { color: c.onPrimary },
  chipTextDisabled: { textDecorationLine: 'line-through', color: c.subtext },
  input: { borderWidth: 1, borderColor: c.border, borderRadius: 10, padding: 11, marginTop: 8, color: c.text, backgroundColor: c.bg },
  error: { color: c.danger, fontSize: 13, marginTop: 4 },
  hint: { color: c.subtext, fontSize: 12, marginTop: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.chip, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 20, fontWeight: '700', color: c.text },
  qty: { fontSize: 18, fontWeight: '700', color: c.text, minWidth: 24, textAlign: 'center' },
  primary: { backgroundColor: c.primary, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 18 },
  primaryText: { color: c.onPrimary, fontWeight: '700', fontSize: 16 },
  secondary: { padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: c.border },
  secondaryText: { color: c.text, fontWeight: '700', fontSize: 16 },
  head: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontWeight: '700', color: c.text, fontSize: 16 },
  status: { fontWeight: '700', color: c.primary },
  cancel: { color: c.danger, fontWeight: '600', marginTop: 10 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: c.card, borderRadius: 16, padding: 18 },
  line: { color: c.text, marginTop: 4 },
});
