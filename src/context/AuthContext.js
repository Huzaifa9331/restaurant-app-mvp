import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const login = useCallback((u) => setUser(u), []);
  const logout = useCallback(() => setUser(null), []); // navigator swaps back to the Login screen
  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>. Wrap your app in it in App.js.');
  return ctx;
}
