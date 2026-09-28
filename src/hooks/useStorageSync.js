import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Loads saved JSON once at start (calls onLoad), then saves `value` whenever it changes.
// Returns isLoaded so the app can show a loading screen instead of flashing empty data.
export default function useStorageSync(key, value, onLoad) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (active && raw) {
          try { onLoad(JSON.parse(raw)); } catch (e) { /* ignore corrupt data */ }
        }
      })
      .catch(() => {})
      .finally(() => { if (active) setIsLoaded(true); });
    return () => { active = false; };
  }, [key]);

  useEffect(() => {
    if (isLoaded) AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
  }, [key, value, isLoaded]);

  return isLoaded;
}
