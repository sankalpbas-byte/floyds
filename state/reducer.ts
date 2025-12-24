
import { AppState, Action, Transaction } from '../types';

const calculateBalance = (phone: string, transactions: Transaction[]) => {
  let balance = 0;
  transactions.forEach(tx => {
    if (tx.type === 'load' && tx.userPhone === phone && tx.status === 'Confirmed') {
      balance += tx.amount;
    } else if (tx.type === 'order' && tx.userPhone === phone) {
      balance -= tx.totalPrice;
    }
  });
  return balance;
};

export const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'INITIALIZE_STATE':
      return { ...state, ...action.payload };

    case 'LOGIN': {
      const phone = action.payload.phone;
      const calculatedBalance = calculateBalance(phone, state.transactions);
      
      return {
        ...state,
        isLoggedIn: true,
        view: 'menu',
        balance: calculatedBalance,
        phone: phone,
        toastMessage: 'Login successful!',
      };
    }

    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false,
        cartItems: [],
        view: 'home',
        phone: null,
        toastMessage: 'You have been logged out.',
      };

    case 'SET_VIEW':
      return { ...state, view: action.payload };

    case 'SET_CART':
      return { ...state, cartItems: action.payload };

    case 'PLACE_ORDER':
      return {
        ...state,
        transactions: [action.payload.order, ...state.transactions],
        balance: action.payload.newBalance,
        cartItems: [],
        orderNotes: '',
      };

    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        transactions: state.transactions.map(tx =>
          tx.id === action.payload.orderId && tx.type === 'order'
            ? { ...tx, status: action.payload.status }
            : tx
        ),
      };

    case 'MARK_ORDER_PAID':
      return {
        ...state,
        transactions: state.transactions.map(tx =>
          tx.id === action.payload.orderId && tx.type === 'order'
            ? { ...tx, isPaid: true }
            : tx
        ),
      };

    case 'ADD_EXPENSE':
      return {
        ...state,
        transactions: [action.payload.expense, ...state.transactions],
      };
      
    case 'LOAD_BALANCE':
      return {
        ...state,
        transactions: [action.payload.load, ...state.transactions],
      };

    case 'CONFIRM_LOAD': {
      const updatedTransactions = state.transactions.map(tx => 
        tx.id === action.payload.transactionId && tx.type === 'load'
          ? { ...tx, status: 'Confirmed' as const }
          : tx
      );
      
      let newBalance = state.balance;
      const targetTx = state.transactions.find(tx => tx.id === action.payload.transactionId && tx.type === 'load');
      if (targetTx && targetTx.type === 'load' && targetTx.userPhone === state.phone) {
         newBalance += targetTx.amount;
      }

      return {
        ...state,
        transactions: updatedTransactions,
        balance: newBalance,
      };
    }

    case 'ADMIN_ADD_FUNDS': {
      const newTransactions = [action.payload.load, ...state.transactions];
      let newBalance = state.balance;
      if (action.payload.load.type === 'load' && action.payload.load.userPhone === state.phone) {
          newBalance += action.payload.load.amount;
      }
      return {
          ...state,
          transactions: newTransactions,
          balance: newBalance,
      }
    }

    // Menu Management Actions
    case 'ADD_MENU_ITEM':
      return {
        ...state,
        menuItems: [...state.menuItems, action.payload]
      };

    case 'EDIT_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };

    case 'DELETE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.filter(item => item.id !== action.payload)
      };

    // Service Request Actions
    case 'REQUEST_SERVICE':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };

    case 'RESOLVE_SERVICE':
      return {
        ...state,
        transactions: state.transactions.map(tx => 
          tx.id === action.payload && tx.type === 'service'
            ? { ...tx, status: 'Resolved' }
            : tx
        )
      };

    case 'SET_FAVORITES':
      return { ...state, favoriteItemIds: action.payload };
      
    case 'SET_ORDER_NOTES':
      return { ...state, orderNotes: action.payload };

    case 'SET_TOAST':
      return { ...state, toastMessage: action.payload };

    default:
      return state;
  }
};
