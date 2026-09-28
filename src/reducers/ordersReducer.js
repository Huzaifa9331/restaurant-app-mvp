export const STATUS_ORDER = ['Pending', 'Preparing', 'Ready', 'Served'];

export function ordersReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.orders;
    case 'PLACE_ORDER':
      return [action.order, ...state];
    case 'SET_STATUS':
      return state.map((o) => (o.id === action.id ? { ...o, status: action.status, updatedAt: action.updatedAt } : o));
    default:
      return state;
  }
}
