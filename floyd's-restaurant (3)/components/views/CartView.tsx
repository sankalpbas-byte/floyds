import React, { useMemo, useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../../state/AppContext';
import { PlusIcon } from '../icons/PlusIcon';
import { MinusIcon } from '../icons/MinusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ReorderIcon } from '../icons/ReorderIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { Order, Transaction } from '../../types';

export const CartView: React.FC = () => {
  const { state, updateQuantity, placeOrder, setView, addToCart, setOrderNotes, quickOrder } = useContext(AppContext);
  const { cartItems, transactions, favoriteItemIds, orderNotes, menuItems } = state;

  const [highlightedItem, setHighlightedItem] = useState<string | null>(null);
  const [highlightedTotal, setHighlightedTotal] = useState(false);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const prevTotalPriceRef = useRef(totalPrice);

  useEffect(() => {
    if (prevTotalPriceRef.current !== totalPrice) {
        setHighlightedTotal(true);
        const timer = setTimeout(() => setHighlightedTotal(false), 500);
        prevTotalPriceRef.current = totalPrice;
        return () => clearTimeout(timer);
    }
  }, [totalPrice]);

  const handleUpdateQuantity = (itemId: string, change: number) => {
    const item = cartItems.find(i => i.id === itemId);
    if (item && (item.quantity + change > 0)) {
      setHighlightedItem(itemId);
      setTimeout(() => setHighlightedItem(null), 500);
    }
    updateQuantity(itemId, change);
  };

  const [isFavoritesExpanded, setIsFavoritesExpanded] = useState(false);

  const lastTwoOrders = useMemo(() => {
    return transactions
      .filter((tx): tx is Transaction & { type: 'order' } => tx.type === 'order')
      .slice(0, 2);
  }, [transactions]);
  
  const favoriteItems = useMemo(() => {
    return menuItems.filter(item => favoriteItemIds.includes(item.id));
  }, [favoriteItemIds, menuItems]);

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Your Cart</h2>

      {cartItems.length === 0 ? (
        <div className="text-center bg-[#121212] p-12 rounded-3xl border border-white/5 shadow-lg">
          <div className="inline-block p-4 rounded-full bg-neutral-800 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <p className="text-neutral-400 text-lg mb-8">Your cart is empty. Hungry for something delicious?</p>
          <button 
            onClick={() => setView('menu')}
            className="bg-green-500 text-black py-3 px-8 rounded-full font-bold hover:bg-green-400 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all shadow-lg shadow-green-500/20"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          <div className="bg-[#121212] rounded-3xl shadow-xl border border-white/5 overflow-hidden">
            <ul className="divide-y divide-white/5">
              {cartItems.map(item => (
                <li key={item.id} className="p-4 sm:p-6 flex items-center justify-between transition-colors hover:bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <img src={item.imageUrl} alt={item.name} loading="lazy" className="w-20 h-20 object-cover rounded-xl shadow-sm bg-neutral-800" />
                    <div>
                      <p className="font-bold text-white text-lg">{item.name}</p>
                      <p className={`text-sm font-bold font-mono transition-all duration-300 ${highlightedItem === item.id ? 'text-green-300 scale-105' : 'text-green-400'}`}>
                        Nrs. {(item.price * item.quantity).toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-neutral-900/50 p-1.5 rounded-xl border border-white/5">
                    <button onClick={() => handleUpdateQuantity(item.id, -1)} className="p-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 hover:text-white text-neutral-400 transition-colors">
                      {item.quantity === 1 ? <TrashIcon /> : <MinusIcon />}
                    </button>
                    <span className="w-6 text-center font-bold text-white">{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.id, 1)} className="p-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 hover:text-white text-neutral-400 transition-colors">
                      <PlusIcon />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="p-6 border-t border-white/5 bg-neutral-900/30">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Special Instructions</label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Add notes for the kitchen..."
                className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all resize-none"
                rows={2}
              />
            </div>
            
            <div className="p-6 bg-black/40 flex justify-between items-center border-t border-white/5 backdrop-blur-sm">
              <span className="text-lg font-medium text-neutral-400">Total Amount</span>
              <span className={`text-3xl font-bold text-white tracking-tight transition-all duration-300 ${highlightedTotal ? 'text-green-400 scale-110' : ''}`}>
                Nrs. {totalPrice.toFixed(0)}
              </span>
            </div>
          </div>
          <div className="mt-8 sticky bottom-24 z-10">
            <button
              onClick={placeOrder}
              className="w-full bg-green-500 text-black py-4 rounded-2xl font-bold text-lg hover:bg-green-400 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] transform active:scale-[0.99]"
            >
              Place Order
            </button>
          </div>
        </>
      )}

      {/* Quick Add Section: Favorites */}
      {favoriteItems.length > 0 && (
        <div className="mt-16 border-t border-white/5 pt-10">
          <button
            onClick={() => setIsFavoritesExpanded(!isFavoritesExpanded)}
            className="w-full text-center group focus:outline-none mb-8"
            aria-expanded={isFavoritesExpanded}
            aria-controls="favorites-grid"
          >
            <div className="flex justify-center items-center">
              <h3 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">Your Favorites</h3>
              <ChevronDownIcon className={`h-6 w-6 ml-2 text-neutral-500 transition-transform duration-300 ${isFavoritesExpanded ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-neutral-500 text-sm mt-1">Quickly add your go-to items</p>
          </button>

          {isFavoritesExpanded && (
            <div id="favorites-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
              {favoriteItems.map(item => (
                <div key={item.id} className="bg-[#121212] p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-green-500/20 transition-colors">
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-sm text-green-400 font-mono">Nrs. {item.price}</p>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="p-3 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500 hover:text-black transition-all"
                    aria-label={`Add ${item.name} to cart`}
                  >
                    <PlusIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Add Section: Reorder */}
      {lastTwoOrders.length > 0 && (
        <div className="mt-12">
            <h3 className="text-xl font-bold text-neutral-400 mb-6 uppercase tracking-wider text-sm">Recent Orders</h3>
            <div className="space-y-4">
            {lastTwoOrders.map(order => (
                <div key={order.id} className="bg-[#121212] p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex-grow">
                    <p className="text-xs text-neutral-500 font-bold uppercase mb-2">{new Date(order.created).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                    <ul className="flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map(item => (
                        <li key={item.id} className="text-sm text-neutral-300 bg-neutral-800 px-2 py-1 rounded">
                        {item.quantity}x {item.name}
                        </li>
                    ))}
                    {order.items.length > 3 && <li className="text-sm text-neutral-500 self-center">+ {order.items.length - 3} more</li>}
                    </ul>
                </div>
                <button
                    onClick={() => quickOrder(order as Order)}
                    className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center text-sm bg-neutral-800 hover:bg-white text-white hover:text-black font-bold py-3 px-5 rounded-xl transition-all"
                >
                    <ReorderIcon />
                    <span className="ml-2">Order Again</span>
                </button>
                </div>
            ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default CartView;