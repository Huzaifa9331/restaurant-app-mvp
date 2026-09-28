// Q7 + Q10: Cart with quantity steppers, notes, promo code and the Dine-in / Takeaway choice.
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { validatePromo } from '../reducers/cartReducer';
import { mockTables } from '../data/tables';

const PICKUP_MINUTES = [15, 30, 45, 60];

export default function CartScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state, dispatch } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [orderType, setOrderType] = useState('Dine-in');
  const [tableId, setTableId] = useState('T1');
  const [pickupMinutes, setPickupMinutes] = useState(30);

  const applyPromo = () => {
    const result = validatePromo(promoInput);
    if (!result.valid) { setPromoError(result.message); return; }
    setPromoError('');
    dispatch({ type: 'APPLY_PROMO', code: result.code });
    setPromoInput('');
  };

  if (state.items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.subtext}>Add dishes from the Menu tab to get started.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {state.items.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.emoji}>{item.image}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>Rs. {item.price * item.quantity}</Text>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => dispatch({ type: 'DECREMENT', id: item.id })}><Text style={styles.stepText}>−</Text></TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => dispatch({ type: 'INCREMENT', id: item.id })}><Text style={styles.stepText}>+</Text></TouchableOpacity>
            </View>
          </View>
          <TextInput
            style={styles.note} value={item.note} placeholder='Special instructions (e.g. "no onions")'
            placeholderTextColor={colors.subtext} onChangeText={(t) => dispatch({ type: 'UPDATE_NOTE', id: item.id, note: t })}
          />
          <TouchableOpacity onPress={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}>
            <Text style={styles.remove}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.heading}>Promo code</Text>
        {state.promoCode ? (
          <View style={styles.row}>
            <Text style={[styles.name, { flex: 1 }]}>{state.promoCode} applied ({state.discountPercent}% off)</Text>
            <TouchableOpacity onPress={() => dispatch({ type: 'REMOVE_PROMO' })}><Text style={styles.remove}>Remove</Text></TouchableOpacity>
          </View>
        ) : (
          <View style={styles.row}>
            <TextInput style={[styles.note, { flex: 1, marginTop: 0 }]} value={promoInput} onChangeText={(t) => { setPromoInput(t); setPromoError(''); }}
              placeholder="WELCOME10 or FEAST20" placeholderTextColor={colors.subtext} autoCapitalize="characters" />
            <TouchableOpacity style={styles.smallBtn} onPress={applyPromo}><Text style={styles.smallBtnText}>Apply</Text></TouchableOpacity>
          </View>
        )}
        {promoError ? <Text style={styles.error}>{promoError}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>How will you eat?</Text>
        <View style={styles.row}>
          {['Dine-in', 'Takeaway'].map((t) => (
            <TouchableOpacity key={t} style={[styles.choice, orderType === t && styles.choiceActive]} onPress={() => setOrderType(t)}>
              <Text style={[styles.choiceText, orderType === t && styles.choiceTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {orderType === 'Dine-in' ? (
          <>
            <Text style={styles.subtext}>Choose a table</Text>
            <View style={styles.wrap}>
              {mockTables.map((t) => (
                <TouchableOpacity key={t.id} style={[styles.choice, tableId === t.id && styles.choiceActive]} onPress={() => setTableId(t.id)}>
                  <Text style={[styles.choiceText, tableId === t.id && styles.choiceTextActive]}>{t.name} ({t.seats})</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.subtext}>Pickup time</Text>
            <View style={styles.wrap}>
              {PICKUP_MINUTES.map((m) => (
                <TouchableOpacity key={m} style={[styles.choice, pickupMinutes === m && styles.choiceActive]} onPress={() => setPickupMinutes(m)}>
                  <Text style={[styles.choiceText, pickupMinutes === m && styles.choiceTextActive]}>In {m} min</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.primary} onPress={() => navigation.navigate('OrderSummary', { orderType, tableId, pickupMinutes })}>
        <Text style={styles.primaryText}>Review order</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => dispatch({ type: 'CLEAR_CART' })}>
        <Text style={[styles.remove, { textAlign: 'center', marginTop: 14 }]}>Clear cart</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  content: { padding: 16, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg, padding: 24 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: c.text, marginTop: 8 },
  subtext: { color: c.subtext, fontSize: 13, marginTop: 10, marginBottom: 4 },
  card: { backgroundColor: c.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: c.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  emoji: { fontSize: 30 },
  name: { fontSize: 16, fontWeight: '700', color: c.text },
  price: { color: c.primary, fontWeight: '700', marginTop: 2 },
  heading: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: c.chip, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 18, fontWeight: '700', color: c.text },
  qty: { fontSize: 16, fontWeight: '700', color: c.text, minWidth: 18, textAlign: 'center' },
  note: { borderWidth: 1, borderColor: c.border, borderRadius: 8, padding: 10, marginTop: 10, color: c.text, backgroundColor: c.bg },
  remove: { color: c.danger, fontWeight: '600', marginTop: 8 },
  error: { color: c.danger, marginTop: 6, fontSize: 13 },
  smallBtn: { backgroundColor: c.primary, paddingVertical: 11, paddingHorizontal: 16, borderRadius: 8 },
  smallBtnText: { color: c.onPrimary, fontWeight: '700' },
  choice: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: c.border, backgroundColor: c.bg },
  choiceActive: { backgroundColor: c.primary, borderColor: c.primary },
  choiceText: { color: c.text, fontWeight: '600' },
  choiceTextActive: { color: c.onPrimary },
  primary: { backgroundColor: c.primary, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 6 },
  primaryText: { color: c.onPrimary, fontWeight: '700', fontSize: 16 },
});
