
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type OrderStatus = 'Preparing' | 'Out for Delivery' | 'Delivered';

export type LoadStatus = 'Pending' | 'Confirmed';

export type ServiceStatus = 'Pending' | 'Resolved';

export type View = 'home' | 'menu' | 'cart' | 'confirmation' | 'about' | 'profile' | 'admin';

export interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  notes?: string;
  created: string; // ISO date string
  isPaid?: boolean;
  userPhone: string;
}

export interface BalanceLoad {
  id: string;
  amount: number;
  created: string; // ISO date string
  userPhone: string;
  status: LoadStatus;
}

export interface PurchaseBill {
  id: string;
  supplier: string;
  description: string;
  amount: number;
  created: string; // ISO date string
}

export interface ServiceRequest {
  id: string;
  subType: 'water';
  userPhone: string;
  created: string;
  status: ServiceStatus;
  tableNumber?: string;
}

export type Transaction = 
  | (Order & { type: 'order' }) 
  | (BalanceLoad & { type: 'load' })
  | (PurchaseBill & { type: 'expense' })
  | (ServiceRequest & { type: 'service' });

export interface UserProfile {
  balance: number;
  favorites: string[]; // array of menu_item IDs
  phone: string;
}

export interface AppState {
  isLoggedIn: boolean;
  isLoading: boolean;
  view: View;
  menuItems: MenuItem[];
  cartItems: CartItem[];
  transactions: Transaction[];
  balance: number;
  favoriteItemIds: string[];
  orderNotes: string;
  toastMessage: string;
  phone: string | null;
}

// Action types for reducer
export type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INITIALIZE_STATE'; payload: Partial<AppState> }
  | { type: 'LOGIN'; payload: { phone: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_VIEW'; payload: View }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'PLACE_ORDER'; payload: { order: Transaction; newBalance: number } }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: OrderStatus } }
  | { type: 'MARK_ORDER_PAID'; payload: { orderId: string } }
  | { type: 'ADD_EXPENSE'; payload: { expense: Transaction } }
  | { type: 'LOAD_BALANCE'; payload: { load: Transaction } }
  | { type: 'CONFIRM_LOAD'; payload: { transactionId: string } }
  | { type: 'ADMIN_ADD_FUNDS'; payload: { load: Transaction } }
  | { type: 'ADD_MENU_ITEM'; payload: MenuItem }
  | { type: 'EDIT_MENU_ITEM'; payload: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; payload: string }
  | { type: 'REQUEST_SERVICE'; payload: Transaction }
  | { type: 'RESOLVE_SERVICE'; payload: string }
  | { type: 'SET_FAVORITES'; payload: string[] }
  | { type: 'SET_ORDER_NOTES'; payload: string }
  | { type: 'SET_TOAST'; payload: string };
