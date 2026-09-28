import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { menuData } from '../data/menu';
import useStorageSync from '../hooks/useStorageSync';

const MenuContext = createContext(null);

// Shared menu: manager edits appear on the customer menu immediately. Saved in AsyncStorage.
export function MenuProvider({ children }) {
  const [menuItems, setMenuItems] = useState(menuData);
  const isLoaded = useStorageSync('restaurant_menu', menuItems, setMenuItems);

  const addItem = useCallback((item) => setMenuItems((prev) => [...prev, item]), []);
  const updatePrice = useCallback(
    (id, price) => setMenuItems((prev) => prev.map((i) => (i.id === id ? { ...i, price } : i))), []);
  const toggleAvailability = useCallback(
    (id) => setMenuItems((prev) => prev.map((i) => (i.id === id ? { ...i, isAvailable: !i.isAvailable } : i))), []);

  const value = useMemo(
    () => ({ menuItems, isLoaded, addItem, updatePrice, toggleAvailability }),
    [menuItems, isLoaded, addItem, updatePrice, toggleAvailability]
  );
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used inside a <MenuProvider>.');
  return ctx;
}
