
import React, { createContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { appReducer } from './reducer';
import { AppState, Action, View, MenuItem, Order, OrderStatus, CartItem, Transaction, ServiceRequest } from '../types';
import { MENU_ITEMS } from '../constants';
import { api } from '../services/api';

// The shape of the context data
interface AppContextProps {
  state: AppState;
  login: (phone: string) => void;
  logout: () => void;
  setView: (view: View) => void;
  setToast: (message: string) => void;
  addToCart: (item: MenuItem) => void;
  updateQuantity: (itemId: string, change: number) => void;
  placeOrder: () => void;
  loadBalance: (amount: number) => void;
  toggleFavorite: (itemId: string) => void;
  setOrderNotes: (notes: string) => void;
  quickOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markOrderPaid: (orderId: string) => void;
  addExpense: (supplier: string, description: string, amount: number) => void;
  confirmLoad: (transactionId: string) => void;
  adminAddFunds: (userPhone: string, amount: number) => void;
  addMenuItem: (item: MenuItem) => void;
  editMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;
  requestWater: () => void;
  resolveServiceRequest: (id: string) => void;
}

const initialState: AppState = {
  isLoggedIn: false,
  isLoading: true,
  menuItems: [],
  cartItems: [],
  transactions: [],
  view: 'home',
  balance: 0,
  favoriteItemIds: [],
  orderNotes: '',
  toastMessage: '',
  phone: null,
};

export const AppContext = createContext<AppContextProps>({
  state: initialState,
  login: () => {},
  logout: () => {},
  setView: () => {},
  setToast: () => {},
  addToCart: () => {},
  updateQuantity: () => {},
  placeOrder: () => {},
  loadBalance: () => {},
  toggleFavorite: () => {},
  setOrderNotes: () => {},
  quickOrder: () => {},
  updateOrderStatus: () => {},
  markOrderPaid: () => {},
  addExpense: () => {},
  confirmLoad: () => {},
  adminAddFunds: () => {},
  addMenuItem: () => {},
  editMenuItem: () => {},
  deleteMenuItem: () => {},
  requestWater: () => {},
  resolveServiceRequest: () => {},
});

const LOCAL_STORAGE_KEY = 'floyds-app-state';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const initialize = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // 1. Try fetching from API (Cloudflare)
      const apiState = await api.fetchState();
      
      if (apiState) {
         dispatch({
          type: 'INITIALIZE_STATE',
          payload: { ...apiState, isLoading: false },
        });
      } else {
        // 2. Fallback to LocalStorage
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        const parsedState = savedState ? JSON.parse(savedState) : {};
        
        // Ensure menuItems exist (fallback to constant if local storage empty or fresh load)
        const initialMenuItems = parsedState.menuItems && parsedState.menuItems.length > 0 
          ? parsedState.menuItems 
          : MENU_ITEMS;

        dispatch({
          type: 'INITIALIZE_STATE',
          payload: { ...parsedState, menuItems: initialMenuItems, isLoading: false },
        });
      }
    };
    
    initialize();
  }, []);
  
  useEffect(() => {
    // Save state to local storage whenever it changes
    if (!state.isLoading) {
      const stateToSave = {
        isLoggedIn: state.isLoggedIn,
        cartItems: state.cartItems,
        transactions: state.transactions,
        balance: state.balance,
        favoriteItemIds: state.favoriteItemIds,
        phone: state.phone,
        menuItems: state.menuItems, // Persist menu changes
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
      
      // Optionally sync specific changes to API here if needed in background
      // api.syncMenu(state.menuItems);
    }
  }, [state]);

  const login = (phone: string) => dispatch({ type: 'LOGIN', payload: { phone } });
  const logout = () => dispatch({ type: 'LOGOUT' });
  const setView = (view: View) => dispatch({ type: 'SET_VIEW', payload: view });
  const setToast = (message: string) => dispatch({ type: 'SET_TOAST', payload: message });
  const setOrderNotes = (notes: string) => dispatch({ type: 'SET_ORDER_NOTES', payload: notes });

  const addToCart = (item: MenuItem) => {
    if (!state.isLoggedIn) {
      setToast("Please log in to add items to your cart.");
      return;
    }
    const existingItem = state.cartItems.find(cartItem => cartItem.id === item.id);
    let newCart;
    if (existingItem) {
      newCart = state.cartItems.map(cartItem =>
        cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
      );
    } else {
      newCart = [...state.cartItems, { ...item, quantity: 1 }];
    }
    dispatch({ type: 'SET_CART', payload: newCart });
    setToast(`${item.name} added to cart!`);
  };

  const updateQuantity = (itemId: string, change: number) => {
    const updatedItems = state.cartItems
      .map(item =>
        item.id === itemId ? { ...item, quantity: item.quantity + change } : item
      )
      .filter(item => item.quantity > 0);
    dispatch({ type: 'SET_CART', payload: updatedItems });
  };
  
  const quickOrder = (order: Order) => {
    dispatch({ type: 'SET_CART', payload: order.items });
    setView('cart');
  };

  const placeOrder = () => {
    if (!state.isLoggedIn || state.cartItems.length === 0) return;
    
    const totalPrice = state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const newBalance = state.balance - totalPrice;
    
    if (newBalance < 0) {
      setToast("Insufficient balance to place order.");
      return;
    }
    
    const newOrder: Transaction = {
      id: new Date().toISOString() + Math.random(),
      items: state.cartItems,
      totalPrice,
      status: 'Preparing',
      notes: state.orderNotes.trim() || undefined,
      created: new Date().toISOString(),
      type: 'order',
      isPaid: true,
      userPhone: state.phone || 'Guest',
    };
    
    dispatch({ type: 'PLACE_ORDER', payload: { order: newOrder, newBalance } });
    api.syncTransaction(newOrder); // Try to sync
    setView('confirmation');
  };

  const loadBalance = (amount: number) => {
    if (!state.isLoggedIn) return;
    
    const newLoad: Transaction = {
        id: new Date().toISOString() + Math.random(),
        amount,
        created: new Date().toISOString(),
        type: 'load',
        userPhone: state.phone || 'Guest',
        status: 'Pending'
    };
    dispatch({ type: 'LOAD_BALANCE', payload: { load: newLoad } });
    api.syncTransaction(newLoad);
    setToast(`Request to load Nrs. ${amount} sent. Waiting for admin approval.`);
  };

  const toggleFavorite = (itemId: string) => {
    if (!state.isLoggedIn) {
      setToast("Please log in to manage favorites.");
      return;
    }
    const newFavorites = state.favoriteItemIds.includes(itemId)
      ? state.favoriteItemIds.filter(id => id !== itemId)
      : [...state.favoriteItemIds, itemId];
    dispatch({ type: 'SET_FAVORITES', payload: newFavorites });
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status } });
  };

  const markOrderPaid = (orderId: string) => {
    dispatch({ type: 'MARK_ORDER_PAID', payload: { orderId } });
    setToast('Order marked as paid.');
  };

  const addExpense = (supplier: string, description: string, amount: number) => {
     const expense: Transaction = {
         id: new Date().toISOString() + Math.random(),
         supplier,
         description,
         amount,
         created: new Date().toISOString(),
         type: 'expense'
     };
     dispatch({ type: 'ADD_EXPENSE', payload: { expense }});
     api.syncTransaction(expense);
     setToast('Expense recorded successfully.');
  };

  const confirmLoad = (transactionId: string) => {
      dispatch({ type: 'CONFIRM_LOAD', payload: { transactionId } });
      setToast('Wallet load confirmed.');
  }

  const adminAddFunds = (userPhone: string, amount: number) => {
      const newLoad: Transaction = {
          id: new Date().toISOString() + Math.random(),
          amount,
          created: new Date().toISOString(),
          type: 'load',
          userPhone,
          status: 'Confirmed'
      };
      dispatch({ type: 'ADMIN_ADD_FUNDS', payload: { load: newLoad } });
      api.syncTransaction(newLoad);
      setToast(`Successfully added Nrs. ${amount} to ${userPhone}.`);
  }

  // Menu Management
  const addMenuItem = (item: MenuItem) => {
    dispatch({ type: 'ADD_MENU_ITEM', payload: item });
    api.syncMenu([...state.menuItems, item]);
    setToast('Menu item added.');
  };

  const editMenuItem = (item: MenuItem) => {
    dispatch({ type: 'EDIT_MENU_ITEM', payload: item });
    const updatedMenu = state.menuItems.map(i => i.id === item.id ? item : i);
    api.syncMenu(updatedMenu);
    setToast('Menu item updated.');
  };

  const deleteMenuItem = (itemId: string) => {
    dispatch({ type: 'DELETE_MENU_ITEM', payload: itemId });
    const updatedMenu = state.menuItems.filter(i => i.id !== itemId);
    api.syncMenu(updatedMenu);
    setToast('Menu item deleted.');
  };

  // Service Requests
  const requestWater = () => {
    if (!state.isLoggedIn) return;
    const request: ServiceRequest = {
      id: new Date().toISOString() + Math.random(),
      subType: 'water',
      userPhone: state.phone || 'Guest',
      created: new Date().toISOString(),
      status: 'Pending',
    };
    dispatch({ type: 'REQUEST_SERVICE', payload: { ...request, type: 'service' } });
    api.syncTransaction({ ...request, type: 'service' });
    setToast('Water requested. A server will be with you shortly.');
  };

  const resolveServiceRequest = (id: string) => {
    dispatch({ type: 'RESOLVE_SERVICE', payload: id });
  };
  
  const value = {
    state,
    login,
    logout,
    setView,
    setToast,
    addToCart,
    updateQuantity,
    placeOrder,
    loadBalance,
    toggleFavorite,
    setOrderNotes,
    quickOrder,
    updateOrderStatus,
    markOrderPaid,
    addExpense,
    confirmLoad,
    adminAddFunds,
    addMenuItem,
    editMenuItem,
    deleteMenuItem,
    requestWater,
    resolveServiceRequest,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
