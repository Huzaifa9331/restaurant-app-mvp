// Q8 + Q10: totals with useMemo, then place the order.
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { mockTables } from '../data/tables';

const SERVICE_RATE = 0.05;
const TAX_RATE = 0.15;
const money = (n) => `Rs. ${Math.round(n)}`;

export default function OrderSummaryScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state, dispatch } = useCart();
  const { placeOrder } = useOrders();
  const { user } = useAuth();
  const { orderType = 'Dine-in', tableId = 'T1', pickupMinutes = 30 } = route.params || {};

  // Recomputed only when the items or the discount change (service and tax are constants).
  const totals = useMemo(() => {
    const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discount = (subtotal * state.discountPercent) / 100;
    const base = subtotal - discount;      // service charge and tax apply after the discount
    const service = base * SERVICE_RATE;
    const tax = base * TAX_RATE;
    return { subtotal, discount, service, tax, grand: base + service + tax };
  }, [state.items, state.discountPercent]);

  const table = mockTables.find((t) => t.id === tableId);
  const detail = orderType === 'Dine-in' ? `Dine-in at ${table?.name}` : `Takeaway, pickup in ${pickupMinutes} min`;

  const confirm = () => {
    placeOrder({
      userId: user.id, customerName: user.fullName, items: state.items, total: Math.round(totals.grand),
      type: orderType, tableName: orderType === 'Dine-in' ? table?.name : null,
      pickupTime: orderType === 'Takeaway' ? `In ${pickupMinutes} min` : null, promoCode: state.promoCode,
    });
    dispatch({ type: 'CLEAR_CART' });
    navigation.popToTop();
    navigation.navigate('OrdersTab');
  };

  if (state.items.length === 0) {
    return <View style={styles.empty}><Text style={styles.text}>Your cart is empty.</Text></View>;
  }

  const line = (label, value, bold) => (
    <View style={styles.line}>
      <Text style={[styles.label, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.value, bold && styles.bold]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.card}>
        <Text style={styles.heading}>{detail}</Text>
        {state.items.map((i) => (
          <View key={i.id} style={{ marginTop: 8 }}>
            {line(`${i.quantity} × ${i.name}`, money(i.price * i.quantity))}
            {i.note ? <Text style={styles.note}>Note: {i.note}</Text> : null}
          </View>
        ))}
      </View>
      <View style={styles.card}>
        {line('Subtotal', money(totals.subtotal))}
        {state.promoCode && line(`Discount (${state.promoCode}, ${state.discountPercent}%)`, `- ${money(totals.discount)}`)}
        {line(`Service charge (${SERVICE_RATE * 100}%)`, money(totals.service))}
        {line(`Sales tax (${TAX_RATE * 100}%)`, money(totals.tax))}
        <View style={styles.divider} />
        {line('Grand total', money(totals.grand), true)}
      </View>
      <TouchableOpacity style={styles.primary} onPress={confirm}>
        <Text style={styles.primaryText}>Place order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg },
  text: { color: c.text },
  card: { backgroundColor: c.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: c.border },
  heading: { fontSize: 16, fontWeight: '700', color: c.text },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  label: { color: c.subtext, flex: 1, paddingRight: 8 },
  value: { color: c.text },
  bold: { fontWeight: '700', color: c.text, fontSize: 17 },
  note: { color: c.subtext, fontSize: 12, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: c.border, marginVertical: 8 },
  primary: { backgroundColor: c.primary, padding: 15, borderRadius: 12, alignItems: 'center' },
  primaryText: { color: c.onPrimary, fontWeight: '700', fontSize: 16 },
});
