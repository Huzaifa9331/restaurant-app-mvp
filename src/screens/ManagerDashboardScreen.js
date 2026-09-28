// Q10: manager dashboard with Orders, Reservations and Menu Management tabs.
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useOrders } from '../context/OrdersContext';
import { useMenu } from '../context/MenuContext';
import { useReservationStore } from '../context/ReservationContext';
import { CATEGORIES } from '../data/menu';

const TABS = ['Incoming Orders', 'Reservations', 'Menu Management'];
const STATUSES = ['Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'];

function MenuRow({ item, styles, colors, updatePrice, toggleAvailability }) {
  const [price, setPrice] = useState(String(item.price));
  const save = () => {
    const n = Number(price);
    if (!Number.isFinite(n) || n <= 0) { Alert.alert('Invalid price', 'Enter a number greater than 0.'); return; }
    updatePrice(item.id, n);
  };
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={[styles.name, { flex: 1 }]}>{item.image} {item.name}</Text>
        <Switch value={item.isAvailable} onValueChange={() => toggleAvailability(item.id)} trackColor={{ true: colors.primary }} />
      </View>
      <View style={[styles.row, { marginTop: 8 }]}>
        <TextInput style={[styles.input, { flex: 1 }]} value={price} onChangeText={setPrice} keyboardType="numeric" />
        <TouchableOpacity style={styles.smallBtn} onPress={save}><Text style={styles.smallBtnText}>Save price</Text></TouchableOpacity>
      </View>
    </View>
  );
}

export default function ManagerDashboardScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { orders, setStatus } = useOrders();
  const { reservations, setReservationStatus } = useReservationStore();
  const { menuItems, addItem, updatePrice, toggleAvailability } = useMenu();

  const [tab, setTab] = useState(TABS[0]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Mains');

  const handleAdd = () => {
    const price = Number(newPrice);
    if (!newName.trim() || !Number.isFinite(price) || price <= 0) { Alert.alert('Missing details', 'Enter a name and a price above 0.'); return; }
    addItem({ id: 'c' + Date.now(), name: newName.trim(), description: 'New item added by the manager.', price, category: newCategory, image: '🍽️', isSpecial: false, isAvailable: true });
    setNewName(''); setNewPrice('');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {tab === 'Incoming Orders' && (
          <>
            {orders.length === 0 && <Text style={styles.hint}>No orders yet.</Text>}
            {orders.map((o) => (
              <View key={o.id} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.name}>{o.id} · {o.customerName}</Text>
                  <Text style={styles.status}>{o.status}</Text>
                </View>
                <Text style={styles.hint}>{o.type === 'Dine-in' ? o.tableName : o.pickupTime} · Rs. {o.total}</Text>
                <Text style={styles.hint}>{o.items.map((i) => `${i.quantity}× ${i.name}${i.note ? ` (${i.note})` : ''}`).join(', ')}</Text>
                <View style={styles.wrap}>
                  {STATUSES.filter((s) => s !== o.status).map((s) => (
                    <TouchableOpacity key={s} style={styles.smallBtn} onPress={() => setStatus(o.id, s)}>
                      <Text style={styles.smallBtnText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'Reservations' && (
          <>
            {reservations.length === 0 && <Text style={styles.hint}>No reservations.</Text>}
            {reservations.map((r) => (
              <View key={r.id} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.name}>{r.customerName} · {r.tableName}</Text>
                  <Text style={styles.status}>{r.status}</Text>
                </View>
                <Text style={styles.hint}>{r.date} at {r.time} · {r.partySize} guests · {r.phone}</Text>
                {r.status === 'Pending' && (
                  <View style={styles.wrap}>
                    <TouchableOpacity style={styles.smallBtn} onPress={() => setReservationStatus(r.id, 'Confirmed')}><Text style={styles.smallBtnText}>Accept</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => setReservationStatus(r.id, 'Declined')}><Text style={[styles.smallBtnText, { color: colors.bg }]}>Decline</Text></TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {tab === 'Menu Management' && (
          <>
            <View style={styles.card}>
              <Text style={styles.name}>Add a menu item</Text>
              <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Item name" placeholderTextColor={colors.subtext} />
              <TextInput style={styles.input} value={newPrice} onChangeText={setNewPrice} placeholder="Price (Rs.)" keyboardType="numeric" placeholderTextColor={colors.subtext} />
              <View style={styles.wrap}>
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <TouchableOpacity key={c} style={[styles.chip, newCategory === c && styles.chipActive]} onPress={() => setNewCategory(c)}>
                    <Text style={[styles.chipText, newCategory === c && { color: colors.onPrimary }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={[styles.smallBtn, { marginTop: 12, alignSelf: 'flex-start' }]} onPress={handleAdd}>
                <Text style={styles.smallBtnText}>Add item</Text>
              </TouchableOpacity>
            </View>
            {menuItems.map((item) => (
              <MenuRow key={item.id} item={item} styles={styles} colors={colors} updatePrice={updatePrice} toggleAvailability={toggleAvailability} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  tabs: { flexDirection: 'row', backgroundColor: c.card, borderBottomWidth: 1, borderBottomColor: c.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: c.primary },
  tabText: { color: c.subtext, fontWeight: '600', fontSize: 12, textAlign: 'center' },
  tabTextActive: { color: c.primary },
  card: { backgroundColor: c.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: c.border },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  name: { fontWeight: '700', color: c.text, fontSize: 15 },
  status: { fontWeight: '700', color: c.primary },
  hint: { color: c.subtext, marginTop: 4, fontSize: 13 },
  input: { borderWidth: 1, borderColor: c.border, borderRadius: 8, padding: 10, marginTop: 8, color: c.text, backgroundColor: c.bg },
  smallBtn: { backgroundColor: c.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  smallBtnText: { color: c.onPrimary, fontWeight: '700', fontSize: 13 },
  chip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.bg },
  chipActive: { backgroundColor: c.primary, borderColor: c.primary },
  chipText: { color: c.text, fontWeight: '600' },
});
