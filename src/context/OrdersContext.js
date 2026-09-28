import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import { ordersReducer } from '../reducers/ordersReducer';
import useStorageSync from '../hooks/useStorageSync';

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const [orders, dispatch] = useReducer(ordersReducer, []);
  const isLoaded = useStorageSync('restaurant_orders', orders, (saved) => dispatch({ type: 'LOAD', orders: saved }));

  const placeOrder = useCallback((data) => {
    const now = Date.now();
    const order = { id: 'ORD-' + String(now).slice(-6), status: 'Pending', createdAt: now, updatedAt: now, ...data };
    dispatch({ type: 'PLACE_ORDER', order });
    return order;
  }, []);
  const setStatus = useCallback(
    (id, status) => dispatch({ type: 'SET_STATUS', id, status, updatedAt: Date.now() }), []);

  const value = useMemo(() => ({ orders, isLoaded, placeOrder, setStatus }), [orders, isLoaded, placeOrder, setStatus]);
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used inside an <OrdersProvider>.');
  return ctx;
}
