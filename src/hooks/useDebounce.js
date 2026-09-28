import { useState, useEffect } from 'react';

// Returns `value` only after it has stopped changing for `delay` ms.
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id); // cancels on every change and on unmount
  }, [value, delay]);
  return debounced;
}
