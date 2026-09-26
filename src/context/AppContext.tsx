import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem, WishlistItem, Order, Customer, StorePackage } from '../types';
import { products, getProductById, mergeProducts } from '../data/store';
import { fetchStorePackages, fetchSupabaseProducts, supabase } from '../lib/supabase';

interface AppState {
  cart: CartItem[];
  wishlist: WishlistItem[];
  user: Customer | null;
  orders: Order[];
  recentlyViewed: string[];
  storePackages: StorePackage[];
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

type Action =
  | { type: 'ADD_TO_CART'; productId: string; quantity?: number }
  | { type: 'ADD_PACKAGE_TO_CART'; storePackage: StorePackage }
  | { type: 'REMOVE_FROM_CART'; productId: string; cartItemId?: string }
  | { type: 'UPDATE_CART_QUANTITY'; productId: string; quantity: number; cartItemId?: string }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_TO_WISHLIST'; productId: string }
  | { type: 'REMOVE_FROM_WISHLIST'; productId: string }
  | { type: 'SET_USER'; user: Customer | null }
  | { type: 'ADD_ORDER'; order: Order }
  | { type: 'UPDATE_ORDER'; order: Order }
  | { type: 'ADD_RECENTLY_VIEWED'; productId: string }
  | { type: 'SET_TOAST'; toast: AppState['toast'] }
  | { type: 'LOAD_STATE'; state: Partial<AppState> };

const initialState: AppState = {
  cart: [],
  wishlist: [],
  user: null,
  orders: [],
  recentlyViewed: [],
  storePackages: [],
  toast: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.cart.find(i => i.productId === action.productId && !i.packageId);
      const product = getProductById(action.productId);
      if (!product) return state;
      if (existing) {
        const newQty = Math.min(existing.quantity + (action.quantity || 1), product.stockQuantity);
        return { ...state, cart: state.cart.map(i => i.productId === action.productId && !i.packageId ? { ...i, quantity: newQty } : i) };
      }
      return { ...state, cart: [...state.cart, { productId: action.productId, quantity: action.quantity || 1 }] };
    }
    case 'ADD_PACKAGE_TO_CART': {
      const bundle = action.storePackage;
      const pricedItems = bundle.items.map(item => {
        const product = getProductById(item.productId)!;
        return { ...item, unitRetailPrice: product.salePrice || product.price };
      });
      const retailTotal = pricedItems.reduce((total, item) => total + item.unitRetailPrice * item.quantity, 0);
      let allocated = 0;
      const packageInstanceId = crypto.randomUUID();
      const bundleItems = pricedItems.map((item, index) => {
        const retailLine = item.unitRetailPrice * item.quantity;
        const lineTotal = index === pricedItems.length - 1
          ? Math.max(0, bundle.packagePrice - allocated)
          : retailTotal > 0 ? Math.round((bundle.packagePrice * retailLine / retailTotal) * 100) / 100 : 0;
        allocated += lineTotal;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: lineTotal / item.quantity,
          packageId: bundle.id,
          cartItemId: `${packageInstanceId}:${item.productId}`,
        };
      });
      return { ...state, cart: [...state.cart, ...bundleItems] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(i => action.cartItemId ? i.cartItemId !== action.cartItemId : i.productId !== action.productId) };
    case 'UPDATE_CART_QUANTITY': {
      const product = getProductById(action.productId);
      if (!product) return state;
      const qty = Math.max(1, Math.min(action.quantity, product.stockQuantity));
      return { ...state, cart: state.cart.map(i => (action.cartItemId ? i.cartItemId === action.cartItemId : i.productId === action.productId && !i.packageId) ? { ...i, quantity: qty } : i) };
    }
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'ADD_TO_WISHLIST':
      if (state.wishlist.find(i => i.productId === action.productId)) return state;
      return { ...state, wishlist: [...state.wishlist, { productId: action.productId, addedAt: new Date().toISOString() }] };
    case 'REMOVE_FROM_WISHLIST':
      return { ...state, wishlist: state.wishlist.filter(i => i.productId !== action.productId) };
    case 'SET_USER':
      return { ...state, user: action.user };
    case 'ADD_ORDER':
      return { ...state, orders: [action.order, ...state.orders] };
    case 'UPDATE_ORDER':
      return { ...state, orders: state.orders.map(o => o.id === action.order.id ? action.order : o) };
    case 'ADD_RECENTLY_VIEWED': {
      const filtered = state.recentlyViewed.filter(id => id !== action.productId);
      return { ...state, recentlyViewed: [action.productId, ...filtered].slice(0, 10) };
    }
    case 'SET_TOAST':
      return { ...state, toast: action.toast };
    case 'LOAD_STATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  cartTotal: number;
  cartCount: number;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string, cartItemId?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, cartItemId?: string) => void;
  addPackageToCart: (storePackage: StorePackage) => void;
  clearCart: () => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('focus-store');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', state: parsed });
      }
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    fetchSupabaseProducts()
      .then(savedProducts => {
        if (!mounted) return;
        mergeProducts(savedProducts);
        dispatch({ type: 'LOAD_STATE', state: {} });
      })
      .catch(error => console.warn('Could not load saved products from Supabase:', error));

    fetchStorePackages()
      .then(storePackages => dispatch({ type: 'LOAD_STATE', state: { storePackages } }))
      .catch(error => console.warn('Could not load customer packages from Supabase:', error));

    return () => { mounted = false; };
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    const toSave = {
      cart: state.cart,
      wishlist: state.wishlist,
      user: state.user,
      orders: state.orders,
      recentlyViewed: state.recentlyViewed,
    };
    localStorage.setItem('focus-store', JSON.stringify(toSave));
  }, [state.cart, state.wishlist, state.user, state.orders, state.recentlyViewed]);

  const cartTotal = state.cart.reduce((sum, item) => {
    const product = getProductById(item.productId);
    if (!product) return sum;
    const price = item.unitPrice ?? product.salePrice ?? product.price;
    return sum + price * item.quantity;
  }, 0);

  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (productId: string, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', productId, quantity });
    showToast('Added to cart', 'success');
  };

  const removeFromCart = (productId: string, cartItemId?: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', productId, cartItemId });
  };

  const updateCartQuantity = (productId: string, quantity: number, cartItemId?: string) => {
    dispatch({ type: 'UPDATE_CART_QUANTITY', productId, quantity, cartItemId });
  };

  const addPackageToCart = (storePackage: StorePackage) => {
    const unavailable = storePackage.items.some(item => {
      const product = getProductById(item.productId);
      return !product || product.status !== 'active' || product.stockQuantity < item.quantity;
    });
    if (unavailable) {
      showToast('This package currently contains an unavailable item.', 'error');
      return;
    }
    dispatch({ type: 'ADD_PACKAGE_TO_CART', storePackage });
    showToast('Package added to cart', 'success');
  };

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const addToWishlist = (productId: string) => {
    dispatch({ type: 'ADD_TO_WISHLIST', productId });
    showToast('Added to wishlist', 'success');
  };

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', productId });
  };

  const isInWishlist = (productId: string) => state.wishlist.some(i => i.productId === productId);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    dispatch({ type: 'SET_TOAST', toast: { message, type } });
    setTimeout(() => dispatch({ type: 'SET_TOAST', toast: null }), 3000);
  };

  return (
    <AppContext.Provider value={{ state, dispatch, cartTotal, cartCount, addToCart, addPackageToCart, removeFromCart, updateCartQuantity, clearCart, addToWishlist, removeFromWishlist, isInWishlist, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
