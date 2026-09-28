# Restaurant App MVP (React Native + Expo)

Assignment 1, Fall 2026. Frontend only: no backend, no external API, no state management library.

**Name:** _your name_  **Roll no:** _your roll number_

## Installation
1. Install Node.js (LTS, v20 or newer) and npm.
2. In the project folder run:
   ```bash
   npm install
   npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage
   npx expo start
   ```
3. Scan the QR code with **Expo Go** (phone and computer on the same Wi-Fi), or press `a` for an Android emulator / `i` for the iOS simulator.

## Mock login credentials
| Role | Email | Password |
|---|---|---|
| Customer | customer@test.com | Customer1 |
| Manager | manager@test.com | Manager123 |

## Hooks used on each screen
| Screen | React hooks | Custom hooks / context hooks |
|---|---|---|
| LoginScreen | useState | useForm, useAuth, useTheme |
| MenuScreen | useState, useEffect, useRef, useMemo, useCallback | useDebounce, useMenu, useCart, useTheme |
| MenuItemCard (component) | React.memo, useMemo | useTheme |
| CartScreen | useState, useMemo | useCart, useTheme |
| OrderSummaryScreen | useMemo | useCart, useOrders, useAuth, useTheme |
| OrderTrackingScreen | useState, useEffect, useMemo | useOrders, useAuth, useTheme |
| ReservationScreen | useState, useMemo | useReservation, useTheme |
| ManagerDashboardScreen | useState, useMemo | useOrders, useMenu, useReservationStore, useTheme |
| ProfileScreen | useMemo | useAuth, useTheme, useCart |
| Context providers | useState, useReducer, useMemo, useCallback, useContext | useStorageSync (useEffect + AsyncStorage) |

## Cart reducer test cases
| # | Action | Initial state | Expected state |
|---|---|---|---|
| 1 | ADD_ITEM (Chicken Karahi) | items: [] | items: [{Karahi, qty 1, note ""}] |
| 2 | ADD_ITEM (same dish again) | Karahi qty 1 | Karahi qty 2 (no duplicate row) |
| 3 | INCREMENT | Karahi qty 2 | Karahi qty 3 |
| 4 | DECREMENT | Karahi qty 2 | Karahi qty 1 |
| 5 | DECREMENT | Karahi qty 1 | items: [] (removed at zero) |
| 6 | UPDATE_NOTE "no onions" | Karahi note "" | Karahi note "no onions" |
| 7 | APPLY_PROMO WELCOME10 | promoCode: null | promoCode: WELCOME10, discountPercent: 10 |
| 8 | APPLY_PROMO BAD | promoCode: null | state unchanged (the Cart screen shows the error message) |
| 9 | REMOVE_PROMO | WELCOME10 applied | promoCode: null, discountPercent: 0 |
| 10 | CLEAR_CART | any cart | { items: [], promoCode: null, discountPercent: 0 } |

## Notes (rewrite these in your own words)

**Why Context suits this data (Q6).** The logged-in user, the theme and the cart are needed by many screens at different depths. Passing them as props would mean threading them through every navigator and screen in between. With Context, any component reads what it needs directly through useAuth, useTheme or useCart. One drawback: every component that consumes a context re-renders whenever the value changes.

**useReducer vs useState for the cart (Q7).** The cart holds related pieces of state (items, promo code, discount) and several rules, for example that decrementing quantity 1 removes the item. A reducer keeps all those rules in one pure function and makes them easy to test. useState would have been enough for something simple, like a single item count.

**Empty dependency array in the filtering effect (Q4).** With `[]` the effect runs once, on mount, when the menu has not loaded yet, so it filters an empty list. It never runs again when the menu arrives or when a category chip is tapped, so the list stays empty and the chips do nothing.

**When not to use useMemo / useCallback (Q8).** Do not use them for cheap calculations, such as filtering a short list or simple arithmetic, because the dependency checks cost about as much as the work saved. Do not use them when the dependencies change on every render, since the cache never hits. useCallback gives no benefit if the child component is not wrapped in React.memo.

## Screenshots
_Add screenshots here: validation errors, successful login, render counter, console logs before and after React.memo, disabled time slot._

## Demo video
_Paste your screen-recording link here (maximum 3 minutes)._
