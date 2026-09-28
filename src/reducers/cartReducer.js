// Pure cart reducer: never mutates the previous state.
export const PROMO_CODES = { WELCOME10: 10, FEAST20: 20 };

export const initialCartState = { items: [], promoCode: null, discountPercent: 0 };

export function validatePromo(code) {
  const c = String(code || '').trim().toUpperCase();
  if (!c) return { valid: false, message: 'Enter a promo code.' };
  if (!(c in PROMO_CODES)) return { valid: false, message: `"${c}" is not a valid promo code.` };
  return { valid: true, code: c, percent: PROMO_CODES[c] };
}

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item } = action;
      if (state.items.some((i) => i.id === item.id)) {
        return { ...state, items: state.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)) };
      }
      return {
        ...state,
        items: [...state.items, { id: item.id, name: item.name, price: item.price, image: item.image, quantity: 1, note: '' }],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'INCREMENT':
      return { ...state, items: state.items.map((i) => (i.id === action.id ? { ...i, quantity: i.quantity + 1 } : i)) };
    case 'DECREMENT':
      return {
        ...state,
        items: state.items
          .map((i) => (i.id === action.id ? { ...i, quantity: i.quantity - 1 } : i))
          .filter((i) => i.quantity > 0), // removed when quantity reaches zero
      };
    case 'UPDATE_NOTE':
      return { ...state, items: state.items.map((i) => (i.id === action.id ? { ...i, note: action.note } : i)) };
    case 'CLEAR_CART':
      return initialCartState;
    case 'APPLY_PROMO': {
      const result = validatePromo(action.code);
      if (!result.valid) return state; // invalid codes are rejected (the screen shows the message)
      return { ...state, promoCode: result.code, discountPercent: result.percent };
    }
    case 'REMOVE_PROMO':
      return { ...state, promoCode: null, discountPercent: 0 };
    default:
      return state;
  }
}
