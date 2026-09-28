// Menu screen (Q4, Q5, Q8, Q9). Hooks: useState, useEffect, useRef, useMemo, useCallback + custom hooks.
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, TextInput } from 'react-native';
import { CATEGORIES } from '../data/menu';
import { useTheme } from '../context/ThemeContext';
import { useMenu } from '../context/MenuContext';
import { useCart } from '../context/CartContext';
import useDebounce from '../hooks/useDebounce';
import MenuItemCard from '../components/MenuItemCard';

const SIMULATE_ERROR = false; // true = test the error message + Retry button
const BACK_TO_TOP_OFFSET = 300;
const SORTS = [
  { key: 'default', label: 'Default' },
  { key: 'priceAsc', label: 'Price ↑' },
  { key: 'priceDesc', label: 'Price ↓' },
  { key: 'name', label: 'Name A-Z' },
];

// Simulated fetch: resolves after 1.5 s. Returns the promise and a cancel function.
function fetchMenu() {
  let timerId;
  const promise = new Promise((resolve, reject) => {
    timerId = setTimeout(() => (SIMULATE_ERROR ? reject(new Error('Could not load the menu. Please try again.')) : resolve(true)), 1500);
  });
  return { promise, cancel: () => clearTimeout(timerId) };
}

export default function MenuScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { menuItems } = useMenu(); // shared state: manager edits show up here immediately
  const { dispatch } = useCart();

  // Refs. Changing ref.current does NOT re-render (React is not told); calling a state setter DOES
  // (React re-runs the component). Refs hold values that must persist without changing the screen.
  const renderCount = useRef(0);
  renderCount.current += 1;
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const previousQueryRef = useRef('');

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 400);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [favouriteIds, setFavouriteIds] = useState([]);

  const loadMenu = (isPull = false) => {
    if (isPull) setRefreshing(true); else setIsLoading(true);
    setError(null);
    const request = fetchMenu();
    request.promise.catch((e) => setError(e.message)).finally(() => { setIsLoading(false); setRefreshing(false); });
    return request.cancel;
  };

  // Load on mount. The returned cleanup clears the timer so nothing updates after unmount.
  useEffect(() => loadMenu(), []);

  // Derived data: computed from menuItems + filters during render (memoised), NOT stored in state.
  // Storing it would duplicate the source of truth and could go out of sync with it.
  const visibleItems = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    let list = menuItems.filter((item) => {
      const okCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const okSearch = q === '' || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      return okCategory && okSearch;
    });
    if (sortBy === 'priceAsc') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'priceDesc') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [menuItems, selectedCategory, debouncedSearch, sortBy]);

  useEffect(() => {
    navigation.setOptions({ title: `Menu (${visibleItems.length} items)` });
  }, [visibleItems.length, navigation]);

  // Remember the last 5 searches; the ref stores the previous query to skip consecutive duplicates.
  useEffect(() => {
    const term = debouncedSearch.trim();
    if (term.length < 2 || term.toLowerCase() === previousQueryRef.current) return;
    previousQueryRef.current = term.toLowerCase();
    setRecentSearches((prev) => [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 5));
  }, [debouncedSearch]);

  // Stable handler references so React.memo on the cards actually skips re-renders.
  const handleAdd = useCallback((item) => dispatch({ type: 'ADD_ITEM', item }), [dispatch]);
  const handleToggleFavourite = useCallback(
    (id) => setFavouriteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])), []);

  const renderItem = useCallback(
    ({ item }) => (
      <MenuItemCard item={item} isFavourite={favouriteIds.includes(item.id)} onAdd={handleAdd} onToggleFavourite={handleToggleFavourite} />
    ),
    [favouriteIds, handleAdd, handleToggleFavourite]
  );

  const clearSearch = () => { setSearchText(''); inputRef.current?.focus(); };
  const showSuggestions = isFocused && searchText === '' && recentSearches.length > 0;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.subtext}>Loading today's menu...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadMenu()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.searchRow}>
        <TouchableOpacity onPress={() => inputRef.current?.focus()}><Text style={styles.searchIcon}>🔍</Text></TouchableOpacity>
        <TextInput
          ref={inputRef} style={styles.searchInput} value={searchText} onChangeText={setSearchText}
          onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
          placeholder="Search dishes..." placeholderTextColor={colors.subtext}
        />
        {searchText !== '' && <TouchableOpacity onPress={clearSearch}><Text style={styles.clearBtn}>✕</Text></TouchableOpacity>}
      </View>

      {showSuggestions && (
        <View style={styles.suggestions}>
          <Text style={styles.subtext}>Recent searches</Text>
          <View style={styles.suggestionRow}>
            {recentSearches.map((t) => (
              <TouchableOpacity key={t} style={styles.suggestionChip} onPress={() => setSearchText(t)}>
                <Text style={styles.chipText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.chip, selectedCategory === cat && styles.chipActive]} onPress={() => setSelectedCategory(cat)}>
              <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chips, { paddingTop: 0 }]}>
          {SORTS.map((s) => (
            <TouchableOpacity key={s.key} style={[styles.chip, sortBy === s.key && styles.chipActive]} onPress={() => setSortBy(s.key)}>
              <Text style={[styles.chipText, sortBy === s.key && styles.chipTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        ref={listRef}
        data={visibleItems}
        extraData={favouriteIds}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={() => loadMenu(true)}
        onScroll={(e) => setShowBackToTop(e.nativeEvent.contentOffset.y > BACK_TO_TOP_OFFSET)}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.empty}>
            {debouncedSearch ? `No dishes match "${debouncedSearch}". Try another word or category.` : 'No items in this category.'}
          </Text>
        }
      />

      {showBackToTop && (
        <TouchableOpacity style={styles.topBtn} onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}>
          <Text style={styles.topBtnText}>↑ Back to top</Text>
        </TouchableOpacity>
      )}
      <View style={styles.debug} pointerEvents="none"><Text style={styles.debugText}>Renders: {renderCount.current}</Text></View>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg, padding: 24 },
  subtext: { color: c.subtext, fontSize: 13, marginTop: 8 },
  errorText: { color: c.danger, fontSize: 16, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: c.primary, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 },
  retryText: { color: c.onPrimary, fontWeight: '700', fontSize: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, marginHorizontal: 16, marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: c.border, paddingHorizontal: 12 },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 16, color: c.text },
  clearBtn: { fontSize: 18, color: c.subtext, paddingLeft: 8 },
  suggestions: { marginHorizontal: 16, marginTop: 8 },
  suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  suggestionChip: { backgroundColor: c.chip, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16 },
  chips: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: c.border, backgroundColor: c.card },
  chipActive: { backgroundColor: c.primary, borderColor: c.primary },
  chipText: { color: c.text, fontWeight: '600' },
  chipTextActive: { color: c.onPrimary },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  empty: { textAlign: 'center', color: c.subtext, marginTop: 40, paddingHorizontal: 24, lineHeight: 22 },
  topBtn: { position: 'absolute', right: 16, bottom: 24, backgroundColor: c.text, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 22 },
  topBtnText: { color: c.bg, fontWeight: '700' },
  debug: { position: 'absolute', left: 12, bottom: 12, backgroundColor: 'rgba(0,0,0,0.65)', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  debugText: { color: '#fff', fontSize: 11 },
});
