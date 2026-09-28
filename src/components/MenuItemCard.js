// Q8: React.memo card. It only re-renders when its own props change.
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

function MenuItemCard({ item, isFavourite, onAdd, onToggleFavourite }) {
  // Q8 proof: after optimisation, only the toggled card logs this line.
  console.log('MenuItemCard render:', item.name);

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.card, !item.isAvailable && styles.unavailable]}>
      <Text style={styles.emoji}>{item.image}</Text>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{item.name}</Text>
          {item.isSpecial && (
            <View style={styles.badge}><Text style={styles.badgeText}>Daily Special</Text></View>
          )}
        </View>
        <Text style={styles.desc}>{item.description}</Text>
        <View style={styles.bottom}>
          <Text style={styles.price}>Rs. {item.price}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onToggleFavourite(item.id)} hitSlop={8}>
              <Text style={styles.heart}>{isFavourite ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, !item.isAvailable && styles.addBtnOff]}
              disabled={!item.isAvailable}
              onPress={() => onAdd(item)}
            >
              <Text style={styles.addText}>{item.isAvailable ? 'Add' : 'Sold out'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: c.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: c.border },
  unavailable: { opacity: 0.45 },
  emoji: { fontSize: 44, marginRight: 14, alignSelf: 'center' },
  body: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  name: { fontSize: 17, fontWeight: '700', color: c.text },
  badge: { backgroundColor: c.badge, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontWeight: '700', color: c.badgeText },
  desc: { color: c.subtext, fontSize: 13, marginTop: 4 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  price: { fontSize: 16, fontWeight: '700', color: c.primary },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heart: { fontSize: 20 },
  addBtn: { backgroundColor: c.primary, paddingVertical: 7, paddingHorizontal: 18, borderRadius: 8 },
  addBtnOff: { backgroundColor: c.disabled },
  addText: { color: c.onPrimary, fontWeight: '700' },
});

export default React.memo(MenuItemCard);
