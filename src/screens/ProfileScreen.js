// Q6: profile with theme switch and logout.
import React, { useMemo } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const { dispatch } = useCart();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handleLogout = () => {
    dispatch({ type: 'CLEAR_CART' });
    logout(); // the navigator swaps back to the Login screen (stack reset)
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.avatar}>{user.role === 'manager' ? '👨‍🍳' : '🍽️'}</Text>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{user.role === 'manager' ? 'Manager' : 'Customer'}</Text></View>
      </View>
      <View style={[styles.card, styles.row]}>
        <Text style={styles.label}>Dark mode</Text>
        <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: colors.primary }} />
      </View>
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg, padding: 16 },
  card: { backgroundColor: c.card, borderRadius: 14, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: c.border, alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  avatar: { fontSize: 48 },
  name: { fontSize: 20, fontWeight: '700', color: c.text, marginTop: 6 },
  email: { color: c.subtext, marginTop: 2 },
  badge: { backgroundColor: c.badge, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginTop: 10 },
  badgeText: { color: c.badgeText, fontWeight: '700' },
  label: { color: c.text, fontSize: 16, fontWeight: '600' },
  logout: { backgroundColor: c.primary, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  logoutText: { color: c.onPrimary, fontWeight: '700', fontSize: 16 },
});
