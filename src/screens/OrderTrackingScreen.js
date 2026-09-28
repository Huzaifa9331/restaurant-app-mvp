// Q10: live order tracking. useEffect + setInterval move the status on a demo timer.
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { STATUS_ORDER } from '../reducers/ordersReducer';

const stageFor = (elapsedSec) => (elapsedSec >= 30 ? 'Served' : elapsedSec >= 20 ? 'Ready' : elapsedSec >= 10 ? 'Preparing' : 'Pending');
const fmt = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

export default function OrderTrackingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { orders, setStatus } = useOrders();
  const { user } = useAuth();
  const [now, setNow] = useState(Date.now());

  const myOrders = useMemo(() => orders.filter((o) => o.userId === user.id), [orders, user]);

  // Every second: update the elapsed clock and advance orders (10 s / 20 s / 30 s demo timings).
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      myOrders.forEach((o) => {
        if (o.status === 'Cancelled' || o.status === 'Served') return;
        const target = stageFor(Math.floor((t - o.createdAt) / 1000));
        if (STATUS_ORDER.indexOf(target) > STATUS_ORDER.indexOf(o.status)) setStatus(o.id, target);
      });
    }, 1000);
    return () => clearInterval(id); // cleanup: no interval survives unmount
  }, [myOrders, setStatus]);

  const renderOrder = ({ item: o }) => {
    const finished = o.status === 'Served' || o.status === 'Cancelled';
    const elapsed = Math.floor(((finished ? o.updatedAt : now) - o.createdAt) / 1000);
    const stepIndex = STATUS_ORDER.indexOf(o.status);
    return (
      <View style={styles.card}>
        <View style={styles.head}>
          <Text style={styles.id}>{o.id}</Text>
          <Text style={[styles.status, o.status === 'Cancelled' && { color: colors.danger }]}>{o.status}</Text>
        </View>
        <Text style={styles.sub}>{o.type === 'Dine-in' ? `Dine-in, ${o.tableName}` : `Takeaway, ${o.pickupTime}`} · Rs. {o.total}</Text>
        <Text style={styles.sub}>{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</Text>

        {o.status !== 'Cancelled' && (
          <View style={styles.steps}>
            {STATUS_ORDER.map((s, idx) => (
              <View key={s} style={styles.step}>
                <View style={[styles.dot, idx <= stepIndex && styles.dotOn]}><Text style={styles.dotText}>{idx <= stepIndex ? '✓' : idx + 1}</Text></View>
                <Text style={[styles.stepLabel, idx <= stepIndex && { color: colors.text }]}>{s}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.timer}>{finished ? 'Total time' : 'Elapsed'}: {fmt(Math.max(0, elapsed))}</Text>

        {o.status === 'Pending' && (
          <TouchableOpacity onPress={() => setStatus(o.id, 'Cancelled')}><Text style={styles.cancel}>Cancel order</Text></TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <FlatList
      style={styles.screen} contentContainerStyle={{ padding: 16 }} data={myOrders} extraData={now}
      keyExtractor={(o) => o.id} renderItem={renderOrder}
      ListEmptyComponent={<Text style={styles.empty}>No orders yet. Add dishes to your cart and place an order to track it here.</Text>}
    />
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  empty: { textAlign: 'center', color: c.subtext, marginTop: 60, lineHeight: 22, paddingHorizontal: 20 },
  card: { backgroundColor: c.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: c.border },
  head: { flexDirection: 'row', justifyContent: 'space-between' },
  id: { fontWeight: '700', color: c.text, fontSize: 16 },
  status: { fontWeight: '700', color: c.primary },
  sub: { color: c.subtext, marginTop: 4, fontSize: 13 },
  steps: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  step: { alignItems: 'center', flex: 1 },
  dot: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.chip, alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: c.primary },
  dotText: { color: c.onPrimary, fontWeight: '700', fontSize: 12 },
  stepLabel: { fontSize: 11, color: c.subtext, marginTop: 4 },
  timer: { marginTop: 12, color: c.text, fontWeight: '600' },
  cancel: { color: c.danger, fontWeight: '600', marginTop: 10 },
});
